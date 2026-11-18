import { VIEW, setupCameras, toView } from '../../view.js';
// Lobby (D-010): the host owns the save. Joiners claim a character, then receive the save on start.
import { HostNet, ClientNet, makeRoomCode, playerName } from '../../engine/net/net.js';
import { ROOMMATES } from './BootScene.js';
import { newSave } from '../../engine/save/schema.js';
import { loadAutosave } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed } from '../../engine/rng.js';
import { GAME_VERSION } from '../../version.js';

const FONT = { fontFamily: 'monospace', fontSize: '9px', color: '#e8e8f0' };
const IDS = Object.keys(ROOMMATES);

export class LobbyScene extends Phaser.Scene {
  constructor() { super('Lobby'); }
  init(data) { this.role = data.role; }

  async create() {
    setupCameras(this);
    const W = VIEW.w;
    this.cameras.main.setBackgroundColor('#0b0d16');
    this.status = this.add.text(W / 2, 20, '', { ...FONT, color: '#9aa3c7' }).setOrigin(0.5);
    this.name = playerName();
    this.claims = {};          // character -> { peer, name }
    this.cards = IDS.map((id, i) => this._card(id, W / 2 + (i - 1) * 110, 120));
    this.startBtn = this.add.text(W / 2, 236, '', { ...FONT, color: '#ffb347', fontSize: '11px' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this._start());
    this.add.text(8, 256, '[ESC] back', { ...FONT, color: '#5d6487' });
    this.input.keyboard.on('keydown-ESC', () => { this.net?.close(); this.scene.start('Title'); });
    try { this.role === 'host' ? await this._host() : await this._join(); }
    catch (e) { this.status.setText(`${e.message || e}`).setColor('#ff6b6b'); }
  }

  _card(id, x, y) {
    const spr = this.add.sprite(x, y, id).setScale(3).play(`${id}_idle_down`);
    const label = this.add.text(x, y + 44, ROOMMATES[id].name, FONT).setOrigin(0.5);
    const who = this.add.text(x, y + 58, 'free', { ...FONT, color: '#5d6487' }).setOrigin(0.5);
    this.add.zone(x, y + 10, 90, 120).setInteractive({ useHandCursor: true }).on('pointerdown', () => this._claim(id));
    return { id, spr, label, who };
  }

  // ---------- host ----------
  async _host() {
    this.save = (await loadAutosave().catch(() => null)) ?? (() => {
      const seed = newSeed();
      return newSave({ seed, rolls: rollWorld(seed), gameVersion: GAME_VERSION });
    })();
    this.net = new HostNet();
    this.status.setText('Opening a room...');
    const code = await this.net.open(makeRoomCode());
    this.status.setText(`ROOM CODE: ${code}   (others: Join and type it)`).setColor('#ffb347');
    const mine = this.save.session.hostCharacter;
    if (mine) this._setClaim(mine, 'host', this.name);
    this.net.on('msg', (peer, msg) => {
      if (msg.t === 'hello') { this.names = { ...(this.names || {}), [peer]: msg.name }; this._broadcastLobby(); }
      if (msg.t === 'claim') this._handleClaim(peer, msg.character);
    });
    this.net.on('leave', (peer) => { for (const [c, v] of Object.entries(this.claims)) if (v.peer === peer) delete this.claims[c]; this._broadcastLobby(); });
    this._broadcastLobby();
  }

  _suggest(name) {
    const hit = Object.entries(this.save.session.claims).find(([, v]) => v.playerName === name);
    return hit ? hit[0] : null;
  }

  _handleClaim(peer, character) {
    if (!IDS.includes(character)) return;
    const taken = this.claims[character];
    if (taken && taken.peer !== peer) return this.net.send(peer, { t: 'say', text: `${ROOMMATES[character].name} is taken.` });
    for (const [c, v] of Object.entries(this.claims)) if (v.peer === peer) delete this.claims[c];
    this._setClaim(character, peer, this.names?.[peer] ?? 'player');
  }

  _setClaim(character, peer, name) {
    this.claims[character] = { peer, name };
    this._broadcastLobby();
  }

  _broadcastLobby() {
    const suggestions = {};
    for (const [peer, name] of Object.entries(this.names || {})) suggestions[peer] = this._suggest(name);
    const state = { claims: this.claims, act: this.save.world.act, suggestions };
    this._renderLobby(state);
    this.net.broadcast({ t: 'lobby', state });
  }

  _start() {
    if (this.role !== 'host') return;
    const hostChar = Object.entries(this.claims).find(([, v]) => v.peer === 'host')?.[0];
    if (!hostChar) return this.status.setText('Pick your roommate first.').setColor('#ff6b6b');
    this.save.session.hostCharacter = hostChar;
    for (const [c, v] of Object.entries(this.claims)) this.save.session.claims[c] = { playerName: v.name, lastSeen: new Date().toISOString() };
    const assignments = Object.fromEntries(Object.entries(this.claims).map(([c, v]) => [v.peer, c]));
    this.net.broadcast({ t: 'start', save: this.save, assignments });
    this.scene.start('World', { mode: 'host', net: this.net, save: this.save, assignments, character: hostChar });
  }

  // ---------- client ----------
  async _join() {
    const code = (prompt('Room code from the host:') || '').trim();
    if (!code) throw new Error('No code entered. [ESC] to go back.');
    this.net = new ClientNet();
    this.status.setText(`Joining ${code.toUpperCase()}...`);
    await this.net.join(code);
    this.status.setText('Connected. Claim your roommate.').setColor('#9aa3c7');
    this.net.on('msg', (msg) => {
      if (msg.t === 'lobby') {
        this._renderLobby(msg.state);
        const sug = msg.state.suggestions?.[this.net.id];
        if (sug && !this._suggested) { this._suggested = true; this.status.setText(`Last time you were ${ROOMMATES[sug].name}. Claim them again?`); }
      }
      if (msg.t === 'say') this.status.setText(msg.text).setColor('#ff6b6b');
      if (msg.t === 'start') {
        const character = msg.assignments[this.net.id];
        if (!character) return this.status.setText('The host started without you. Claim a roommate next time.').setColor('#ff6b6b');
        this.scene.start('World', { mode: 'client', net: this.net, save: msg.save, character });
      }
    });
    this.net.send({ t: 'hello', name: this.name });
  }

  _claim(id) {
    if (this.role === 'host') {
      const taken = this.claims[id];
      if (taken && taken.peer !== 'host') return;
      for (const [c, v] of Object.entries(this.claims)) if (v.peer === 'host') delete this.claims[c];
      this._setClaim(id, 'host', this.name);
    } else {
      this.net?.send({ t: 'claim', character: id });
    }
  }

  _renderLobby(state) {
    for (const card of this.cards) {
      const c = state.claims[card.id];
      card.who.setText(c ? c.name : 'free').setColor(c ? '#ffb347' : '#5d6487');
      card.spr.setAlpha(c ? 1 : 0.6);
    }
    const n = Object.keys(state.claims).length;
    if (this.role === 'host') this.startBtn.setText(n ? `[ START ACT ${state.act} with ${n} player${n > 1 ? 's' : ''} ]` : '');
    else this.startBtn.setText('waiting for the host to start...').setColor('#5d6487');
  }
}
