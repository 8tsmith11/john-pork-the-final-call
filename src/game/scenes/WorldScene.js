import { Sim, TILE } from '../../engine/sim.js';
import { VIEW, setupCameras, toView } from '../../view.js';
import { InputReader } from '../../engine/input.js';
import { newSave } from '../../engine/save/schema.js';
import { autosave, loadAutosave, exportFile } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed } from '../../engine/rng.js';
import { MAPS } from '../../content/maps/index.js';
import { TILE_COLORS } from '../../content/maps/build.js';
import { ENEMIES } from '../../content/enemies.js';
import { GAME_VERSION } from '../../version.js';
import { loadScene, Conversation } from '../../engine/dialogue.js';
import { babble, setArea, sfx } from '../../audio/audio.js';
import { ITEMS, RECIPES, SKILLS, playerMods } from '../../content/items.js';
import { tileKey } from '../render/tiles.js';
import { GameMenu, TABS } from '../ui/GameMenu.js';
import { Crowd } from '../crowd.js';

const STEP = 1 / 60;
const XP_PER_LEVEL = 30;
const MORPH_UNLOCK = {
  trevor: 'Trevor\'s supplement stack finally hits all at once. Morph stage 1 unlocked. [M]',
  manuel: 'Something in Manuel clicks into place. He is the gonman now. Morph stage 1 unlocked. [M]',
  michael: 'Michael\'s lace catches a signal it shouldn\'t. Morph stage 1 unlocked. [M]',
};
const MORPH_LOOK = { trevor: [0xb8d8ff, 'Trevor (stacked)'], manuel: [0xb6e07a, 'the gonman'], michael: [0xffb0a8, 'Michael (signal)'] };
const FONT = { fontFamily: 'monospace', fontSize: '8px', color: '#e8e8f0' };

// Seconds of standing still before a roommate's long idle starts (?idle=10 to test).
const IDLE_MS = (Number(new URLSearchParams(globalThis.location?.search ?? '').get('idle')) || 180) * 1000;

export class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  // mode: 'solo' | 'host' | 'client'. Host and solo run the Sim; clients render host snapshots.
  init(data) {
    this.character = data.character; this.mode = data.mode;
    this.net = data.net; this.assignments = data.assignments; this.passedSave = data.save;
  }

  async create() {
    setupCameras(this, { world: true });
    this.save = this.passedSave ?? (await loadAutosave().catch(() => null)) ?? this._newGame();
    const startMap = MAPS[this.save.world.area] ?? MAPS.room631;
    this.save.world.killed ??= [];
    this.sim = new Sim(startMap, { seed: this.save.world.seed, killed: new Set(this.save.world.killed) });
    this.localId = this.mode === 'client' ? this.net.id : 'host';
    this.remoteInputs = new Map();
    this.snapBuf = [];
    if (this.mode !== 'client') {
      this.sim.addPlayer(this.localId, this.character);
      for (const [peer, ch] of Object.entries(this.assignments || {})) if (peer !== 'host') this.sim.addPlayer(peer, ch);
    }
    this.input.mouse?.disableContextMenu();
    this.sprites = new Map(); this.enemySprites = new Map(); this.shotGfx = this.add.graphics().setDepth(5000);
    this.fxGfx = this.add.graphics().setDepth(5001);
    this.input2 = new InputReader(this);
    this.acc = 0;
    this._makeUi();
    this._wireNet();
    this._makeDialogueUi();
    this._pageIdx = {};
    this.vignette = this._makeVignette();
    if (this.mode !== 'client') for (const p of this.sim.players.values()) this.sim.setMods(p.id, playerMods(this.save.party[p.character], p.character));
    this.save.world.scrap ??= 0;
    this._makeMenu();
    this.input.keyboard.on('keydown-M', () => { if (this.mode === 'client') this.net.send({ t: 'morph' }); else this._morph(this.localId); });
    // E: close an open panel/description, otherwise interact with the nearest thing in reach.
    this.input.keyboard.on('keydown-E', () => {
      if (this.dlg) return;                       // dialogue handles E itself (advance)
      if (this.menu) return this._closeMenu();
      if (this.sayOpen) return this._closeSay();
      const me = this.mode === 'client' ? this._lastRendered?.players.find((p) => p.id === this.localId) : this.sim.players.get(this.localId);
      if (!me) return;
      let best = null, bd = 34;
      for (const o of this.map.objects) { const d = Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y); if (d <= bd) { bd = d; best = o; } }
      if (best) { this._clickedObj = best; return; }
      const person = this.crowd?.nearest(me.x, me.y);
      if (person) { person.mode = 'wait'; person.t = 4; person.spr.setFlipX(person.x > me.x); this._say(this.crowd.lineFor(person)); babble(null, 'hey there friend'); }
    });
    this.input.on('pointerdown', (ptr) => this._onClick(ptr));
    this.input.keyboard.on('keydown-H', () => { if (this.mode === 'client') this.net.send({ t: 'use' }); else this._use(this.character, this.localId); });
    this.input.keyboard.on('keydown-F', () => { if (this.mode === 'client') this.net.send({ t: 'answer' }); else this._answer(); });
    this._showMap(startMap);
    this.ready = true;
    if (!this.save.flags['act1.coldopen.done']) this.startDialogue('cold_open', null, () => this._flag('act1.coldopen.done', true));
  }

  // ---------- dialogue ----------
  _flag(k, v) {
    this.save.flags[k] = v;
    if (this.mode === 'client') this.net.send({ t: 'flag', key: k, value: v });
  }

  _dialogueCtx() {
    const me = this.save.party[this.character];
    const present = [...new Set((this._lastRendered?.players || []).map((p) => p.c))];
    return {
      speaker: this.character, present: present.length ? present : [this.character], flags: this.save.flags,
      inventory: me.inventory.map((i) => i.id), seed: this.save.world.rolls?.twistVariant ?? 'A',
      morph: me.morph.stage, standing: this.save.standing,
    };
  }

  async startDialogue(sceneName, nodeId, onDone) {
    if (this.dlg) return;
    const scene = await loadScene(sceneName);
    const sink = {
      flag: (k, v) => this._flag(k, v),
      item: (item) => { this.save.party[this.character].inventory.push({ id: `item.${item}`, qty: 1 }); if (this.mode === 'client') this.net.send({ t: 'item', who: this.character, item }); },
      standing: (f, n) => { if (f in this.save.standing) this.save.standing[f] += n; if (this.mode === 'client') this.net.send({ t: 'standing', faction: f, n }); },
    };
    this.dlg = new Conversation(scene, nodeId, this._dialogueCtx(), sink);
    this.dlgDone = onDone;
    this._drawDialogue();
  }

  _makeDialogueUi() {
    const W = VIEW.w, H = VIEW.h;
    this.dlgBg = this.add.rectangle(W / 2, H - 36, W - 40, 60, 0x0b0d16, 0.94).setStrokeStyle(1, 0xf2a6b8).setScrollFactor(0).setDepth(9500).setVisible(false);
    this.dlgPortraitBg = this.add.rectangle(46, H - 36, 44, 48, 0x151827).setStrokeStyle(1, 0x5d6487).setScrollFactor(0).setDepth(9501).setVisible(false);
    this.dlgPortrait = this.add.image(46, H - 36, 'light').setScrollFactor(0).setDepth(9502).setVisible(false);
    this.dlgInitial = this.add.text(46, H - 36, '', { heading: true, fontSize: '18px', color: '#5d6487' }).setOrigin(0.5).setScrollFactor(0).setDepth(9502);
    this.dlgWho = this.add.text(76, H - 62, '', { ...FONT, fontSize: '9px', color: '#ffb347' }).setScrollFactor(0).setDepth(9501);
    this.dlgText = this.add.text(76, H - 51, '', { ...FONT, fontSize: '9px', wordWrap: { width: W - 110 }, lineSpacing: 1 }).setScrollFactor(0).setDepth(9501);
    this.dlgChoices = [0, 1, 2, 3, 4, 5].map((i) => this.add.text(34, H - 62 + i * 9.5, '', { ...FONT, fontSize: '8.5px', color: '#9aa3c7' })
      .setScrollFactor(0).setDepth(9501).setInteractive({ useHandCursor: true })
      .on('pointerover', function () { this.setColor('#ffb347'); }).on('pointerout', function () { this.setColor('#9aa3c7'); })
      .on('pointerdown', () => this._choose(i)));
    this.input.keyboard.on('keydown', (ev) => {
      if (!this.dlg) return;
      if (ev.key === 'e' || ev.key === 'E' || ev.key === ' ' || ev.key === 'Enter') {
        if (!this.dlg.choices.length && (this._typeShown ?? 0) < (this._typeFull?.length ?? 0)) { this._typeShown = this._typeFull.length; this._drawDialogue(); return; }
        if (!this.dlg.choices.length && this.time.now - (this._lineAt ?? 0) > 220) this.dlg.advance();
        this._drawDialogue();
      }
      const n = parseInt(ev.key, 10); if (n >= 1 && n <= 6) this._choose(n - 1);
    });
    this._drawDialogue();
  }

  _setPortrait(who) {
    const id = (who || '').toLowerCase();
    const isRoommate = ['michael', 'trevor', 'manuel'].includes(id) && this.textures.exists(id);
    this.dlgPortraitBg.setVisible(true);
    if (isRoommate) {
      // Head-and-shoulders crop of the roommate's sprite, scaled up.
      this.dlgPortrait.setTexture(id, 'idle_down_0').setCrop(0, 0, 16, 14).setScale(3).setOrigin(0.5, 0.25).setVisible(true);
      this.dlgInitial.setText('');
    } else {
      this.dlgPortrait.setVisible(false);
      this.dlgInitial.setText(who ? who[0].toUpperCase() : '');
    }
  }

  _tickTypewriter(dt) {
    if (!this.dlg || this._typeFull == null || this._typeShown >= this._typeFull.length) return;
    this._typeShown = Math.min(this._typeFull.length, this._typeShown + dt * 55);
    this.dlgText.setText(this._typeFull.slice(0, Math.floor(this._typeShown)));
  }

  // Minimum time a line stays up before a click can skip it: base + reading time, capped.
  _minLineMs() { return Math.min(1600, 650 + (this.dlg?.line?.text?.length ?? 0) * 12); }

  _choose(i) { if (!this.dlg?.choices[i] || this.time.now - (this._lineAt ?? 0) < 450) return; this.dlg.choose(i); this._drawDialogue(); }

  _drawDialogue() {
    const d = this.dlg, on = !!d && !d.done;
    [this.dlgBg, this.dlgWho, this.dlgText, ...this.dlgChoices].forEach((o) => o.setVisible(on));
    if (!on) { this.dlgPortrait.setVisible(false); this.dlgPortraitBg.setVisible(false); this.dlgInitial.setText(''); }
    if (d && d.done) { this.dlg = null; const cb = this.dlgDone; this.dlgDone = null; cb?.(); return; }
    if (!on) return;
    const choices = d.choices;
    if (choices.length) {
      if (this._choicesFor !== d.nodeId) { this._choicesFor = d.nodeId; this._lineAt = this.time.now; }
      this.dlgWho.setText('');
      this.dlgText.setText('');
      this.dlgChoices.forEach((t, i) => t.setText(choices[i] ? `${i + 1}. ${choices[i].text}` : '').setVisible(!!choices[i]));
    } else {
      const line = d.line;
      this.dlgWho.setText(line?.who ? line.who.toUpperCase() : '');
      if (line && line !== this._lastLine) {
        this._lastLine = line; this._lineAt = this.time.now; babble(line.who, line.text);
        this._typeFull = (line.text ?? '').replace(/\*([^*]+)\*/g, '$1'); this._typeShown = 0;
        this._setPortrait(line.who);
      }
      this.dlgText.setText((this._typeFull ?? '').slice(0, Math.floor(this._typeShown ?? 0)));
      this.dlgChoices.forEach((t) => t.setVisible(false));
    }
  }

  // Story beats keyed to places (Act 1 MVP wiring; see docs/act1/DESIGN.md).
  _onEnterMap(map) {
    const once = (flag, fn) => { if (!this.save.flags[flag]) { this.save.flags[flag] = true; fn(); } };
    if (map.id === 'aster_hall') once('act1.beat.asterEnter', () => this.startDialogue('aster'));
    if (map.id === 'tunnel_1') once('act1.beat.call', () => this.startDialogue('the_call'));
  }

  _newGame() {
    const seed = newSeed();
    return newSave({ seed, rolls: rollWorld(seed), gameVersion: GAME_VERSION });
  }

  // ---------- networking ----------
  _wireNet() {
    if (this.mode === 'host') {
      this.net.on('msg', (peer, msg) => {
        if (msg.t === 'input') {
          const prev = this.remoteInputs.get(peer);
          this.remoteInputs.set(peer, { ...msg.inp, dodge: msg.inp.dodge || prev?.dodge, interact: false });
        }
        if (msg.t === 'flag' && typeof msg.key === 'string' && /^(act\d|dlg\.)/.test(msg.key)) this.save.flags[msg.key] = msg.value ?? true;
        if (msg.t === 'item' && this.save.party[msg.who]) this.save.party[msg.who].inventory.push({ id: `item.${msg.item}`, qty: 1 });
        if (msg.t === 'standing' && msg.faction in this.save.standing) this.save.standing[msg.faction] += Number(msg.n) || 0;
        if (msg.t === 'exit') this._tryExit(this.sim.map.objects.find((o) => o.id === msg.obj));
        if (msg.t === 'answer') this._answer();
        if (msg.t === 'door') this._toggleDoor(msg.id);
        if (msg.t === 'craft') this._craft(this._charOf(peer), msg.idx);
        if (msg.t === 'skill') this._learn(this._charOf(peer), msg.id);
        if (msg.t === 'equip') this._equip(this._charOf(peer), msg.id);
        if (msg.t === 'mate') this._mateBreak();
        if (msg.t === 'use') this._use(this._charOf(peer), peer);
        if (msg.t === 'morph') this._morph(peer);
      });
      this.net.on('leave', (peer) => this.sim.removePlayer(peer));
      this.time.addEvent({ delay: 50, loop: true, callback: () => this.net.broadcast({ t: 'snap', snap: this._lastSnap ?? this.sim.snapshot() }) });
    } else if (this.mode === 'client') {
      this.net.on('msg', (msg) => {
        if (msg.t === 'snap') { this.snapBuf.push({ at: performance.now(), snap: msg.snap }); if (this.snapBuf.length > 20) this.snapBuf.shift(); }
        if (msg.t === 'say') this._say(msg.text);
        if (msg.t === 'party') { this.save.party = msg.party; this.save.world.scrap = msg.scrap; this._refreshMenu(); }
      });
      this.net.on('close', () => this._say('The host closed the game.'));
    }
  }

  _interpolated() {
    const t = performance.now() - 100, buf = this.snapBuf;
    if (!buf.length) return null;
    const i = buf.findIndex((s) => s.at > t);
    if (i <= 0) return buf[i === 0 ? 0 : buf.length - 1].snap;
    const a = buf[i - 1], b = buf[i], k = (t - a.at) / (b.at - a.at || 1);
    if (a.snap.map !== b.snap.map) return b.snap;
    const lerp = (list, prevList) => {
      const prev = new Map(prevList.map((p) => [p.id, p]));
      return list.map((p) => { const q = prev.get(p.id); return q ? { ...p, x: q.x + (p.x - q.x) * k, y: q.y + (p.y - q.y) * k } : p; });
    };
    return { ...b.snap, players: lerp(b.snap.players, a.snap.players), enemies: lerp(b.snap.enemies, a.snap.enemies) };
  }

  // ---------- map ----------
  _showMap(map) {
    this.map = map;
    this.mapGfx?.destroy(); this.mapRT?.destroy();
    // Bake textured tiles into one render texture (cheap to draw every frame).
    const rt = this.mapRT = this.add.renderTexture(0, 0, map.w * TILE, map.h * TILE).setOrigin(0, 0).setDepth(-10);
    map.layout.forEach((row, ty) => [...row].forEach((ch, tx) => rt.draw(tileKey(ch, tx, ty), tx * TILE, ty * TILE)));
    const g = this.mapGfx = this.add.graphics().setDepth(-9);
    for (const im of this.propSprites ?? []) im.destroy();
    for (const t of this.propTimers ?? []) t.remove();
    this.propSprites = []; this.propTimers = [];
    const props = this.textures.exists('props') ? this.textures.get('props') : null;
    for (const s of this.doorVis ?? []) s.vis.destroy();
    this.doorVis = [];
    for (const o of map.objects) {
      if (o.door) {
        const vis = this.add.graphics().setDepth(o.y * TILE + TILE - 4);
        this.doorVis.push({ o, vis, drawn: null });
        continue;
      }
      if (this.textures.exists('wide') && this.textures.get('wide').has(o.id)) {
        // Wall piece: 32x16, covering this wall tile and the one to its right.
        this.propSprites.push(this.add.image(o.x * TILE, o.y * TILE + TILE + 7, 'wide', o.id).setOrigin(0, 1).setDepth(o.y * TILE + TILE + 2));
        continue;
      }
      if (this.textures.exists('big') && this.textures.get('big').has(o.id)) {
        // Big piece: 32x40, centred on its tile and standing on the tile's bottom edge.
        this.propSprites.push(this.add.image(o.x * TILE + TILE / 2, o.y * TILE + TILE, 'big', o.id).setOrigin(0.5, 1).setDepth(o.y * TILE + TILE - 4));
        continue;
      }
      if (props?.has(o.id)) {
        // Hand-drawn prop: 16x24, standing on its tile. A "#1" frame means a slow two-frame loop.
        const im = this.add.image(o.x * TILE, o.y * TILE + TILE, 'props', o.id).setOrigin(0, 1).setDepth(o.y * TILE + TILE - 4);
        if (props.has(`${o.id}#1`)) this.propTimers.push(this.time.addEvent({ delay: 420, loop: true, callback: () => im.active && im.setFrame(im.frame.name === o.id ? `${o.id}#1` : o.id) }));
        this.propSprites.push(im);
        continue;
      }
      const warm = o.id === 'obj.printer_3' || o.id === 'obj.mate';
      const color = o.npc ? 0x8a8f6a : o.action === 'exit' ? 0xffb347 : o.id.includes('statue') || o.id.includes('flag') ? 0xf2a6b8 : warm ? 0xd98a4a : 0x6d7899;
      g.fillStyle(0x000000, 0.35).fillRect(o.x * TILE + 3, o.y * TILE + 12, TILE - 6, 3);
      g.fillStyle(color, o.action === 'exit' ? 0.55 : 1).fillRect(o.x * TILE + 3, o.y * TILE + 2, TILE - 6, TILE - 6);
      g.fillStyle(0xffffff, 0.18).fillRect(o.x * TILE + 3, o.y * TILE + 2, TILE - 6, 2);
    }
    this.crowd?.destroy();
    this.crowd = new Crowd(this, map, this.save.world.seed);
    this._setupLighting(map);
    const mw = map.w * TILE, mh = map.h * TILE, vw = VIEW.w, vh = VIEW.h;
    this.cameras.main.setBounds(Math.min(0, (mw - vw) / 2), Math.min(0, (mh - vh) / 2), Math.max(mw, vw), Math.max(mh, vh)).setRoundPixels(true);
    this.mapLabel.setText(map.name);
    setArea(map.id);
    for (const s of this.enemySprites.values()) s.destroy();
    this.enemySprites.clear();
  }

  async _playEnding(fromBoss = false) {
    if (!fromBoss && this.mode !== 'client' && !this.sim.cleared) return this._announce('Something down here is still moving.');
    // John Pork arrives in person: climbs down from the back of the platform and stands with the party.
    if (this.anims.exists('pork') && !this.porkSprite) {
      const me = this.sim.players?.get(this.localId) ?? this._lastRendered?.players.find((p) => p.id === this.localId);
      const tx = (me?.x ?? 160) + 40, ty = (me?.y ?? 80);
      this.porkSprite = this.add.sprite(tx, ty - 60, 'principals').setOrigin(0.5, 1).play('pork').setAlpha(0).setDepth(ty);
      this.tweens.add({ targets: this.porkSprite, y: ty + 4, alpha: 1, duration: 1400, ease: 'Sine.out' });
    }
    this.startDialogue('ending', null, () => {
      this._flag('act1.complete', true);
      const W = VIEW.w, H = VIEW.h;
      const card = this.add.text(W / 2, H / 2, 'ACT 1\nMISSED CALLS', { fontFamily: 'monospace', fontSize: '18px', color: '#f2a6b8', align: 'center' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(9999).setAlpha(0);
      this.tweens.add({ targets: card, alpha: 1, duration: 1600, hold: 2600, yoyo: true });
      if (this.mode !== 'client') { this.save.world.act = 2; this._save(); }
    });
  }

  // ---------- crafting, skills, items (host-authoritative) ----------
  _charOf(peer) { return this.sim.players.get(peer)?.character; }

  _syncParty() {
    for (const p of this.sim.players.values()) this.sim.setMods(p.id, playerMods(this.save.party[p.character], p.character));
    if (this.mode === 'host') this.net.broadcast({ t: 'party', party: this.save.party, scrap: this.save.world.scrap });
    this._refreshMenu();
  }

  _craft(who, idx) {
    const r = RECIPES[idx], c = this.save.party[who];
    if (!r || !c) return;
    if (this.save.world.scrap < r.scrap) return this._announce(`Not enough scrap (${this.save.world.scrap}/${r.scrap}).`);
    this.save.world.scrap -= r.scrap;
    const item = ITEMS[r.item];
    c.inventory.push({ id: r.item, qty: 1 });
    if (item.slot !== 'consumable') c.equipped[item.slot] = r.item;
    this._announce(`The fab hums. ${who} gets: ${item.name}.`);
    this._syncParty();
  }

  _learn(who, id) {
    const c = this.save.party[who], s = (SKILLS[who] || []).find((x) => x.id === id);
    if (!c || !s || c.skillPoints < 1 || (c.skills[id] ?? 0) >= s.max) return;
    c.skillPoints--; c.skills[id] = (c.skills[id] ?? 0) + 1;
    this._syncParty();
  }

  _use(who, peerId) {
    const c = this.save.party[who]; if (!c) return;
    const i = c.inventory.findIndex((x) => x.id === 'item.mate_flask');
    if (i < 0) return this._announce('No mate thermos. (Print one at the fab.)');
    c.inventory.splice(i, 1);
    this.sim.heal(peerId, ITEMS['item.mate_flask'].heal);
    this._announce(`${who} drinks some mate. Better.`);
    this._syncParty();
  }

  // ---------- in-game menu (src/game/ui/GameMenu.js) ----------
  get menu() { return this.gameMenu?.tab ?? null; }
  _makeMenu() {
    this.gameMenu = new GameMenu(this);
    const cam = this.cameras.main, rawShake = cam.shake.bind(cam);
    cam.shake = (...a) => { let on = true; try { on = localStorage.getItem('jpfc.screenshake') !== 'off'; } catch { /* default on */ } return on ? rawShake(...a) : cam; };
    const kb = this.input.keyboard;
    kb.on('keydown-ESC', () => { if (this.dlg) return; this.menu ? this._closeMenu() : this.gameMenu.show('inventory'); });
    kb.on('keydown-I', () => { if (!this.dlg) this.menu === 'inventory' ? this._closeMenu() : this.gameMenu.show('inventory'); });
    kb.on('keydown-K', () => { if (!this.dlg) this.menu === 'skills' ? this._closeMenu() : this.gameMenu.show('skills'); });
    kb.on('keydown-TAB', (ev) => { ev.preventDefault?.(); if (!this.dlg) this.menu === 'map' ? this._closeMenu() : this.gameMenu.show('map'); });
    kb.addCapture('TAB');
    for (const [key, dir] of [['A', -1], ['LEFT', -1], ['D', 1], ['RIGHT', 1]]) kb.on(`keydown-${key}`, () => { if (TABS.includes(this.menu)) this.gameMenu.cycle(dir); });
  }
  _openFab() { this.gameMenu.show('fab'); }
  _openSkills() { this.gameMenu.show('skills'); }
  _closeMenu() { this.gameMenu.close(); }
  _refreshMenu() { this.gameMenu?.refresh(); }

  // Menu actions (host-authoritative; clients ask the host).
  menuUse(id) {
    const def = ITEMS[id]; if (!def) return;
    if (def.slot === 'consumable') { if (this.mode === 'client') this.net.send({ t: 'use' }); else this._use(this.character, this.localId); return; }
    if (this.mode === 'client') this.net.send({ t: 'equip', id }); else this._equip(this.character, id);
  }
  menuLearn(id) { if (this.mode === 'client') this.net.send({ t: 'skill', id }); else this._learn(this.character, id); }
  menuCraft(i) { if (this.mode === 'client') this.net.send({ t: 'craft', idx: i }); else this._craft(this.character, i); }
  menuExport() { exportFile(this.save); }
  menuQuit(save) { const quit = () => { this.net?.close?.(); this.scene.start('Title'); }; save && this.mode !== 'client' ? autosave(this.save).then(quit) : quit(); }
  mapName(id) { return MAPS[id]?.name ?? id; }

  _equip(who, id) {
    const c = this.save.party[who], def = ITEMS[id];
    if (!c || !def || !c.inventory.some((it) => it.id === id) || def.slot === 'consumable') return;
    c.equipped[def.slot] = c.equipped[def.slot] === id ? null : id;   // click again to unequip
    this._syncParty();
  }

  _morph(peerId) {
    const p = this.sim.players.get(peerId); if (!p) return;
    const stage = this.save.party[p.character]?.morph.stage ?? 0;
    if (stage < 1) return this._announce('No morph yet. (Stage 1 unlocks at level 3.)');
    this.sim.toggleMorph(peerId, true);
  }

  _toggleDoor(id) {
    const d = [...this.map.doors.values()].find((x) => x.id === id); if (!d) return;
    // Don't close a door on someone standing in the doorway.
    if (d.open && [...this.sim.players.values()].some((p) => Math.floor(p.x / TILE) === d.x && Math.floor(p.y / TILE) === d.y)) return;
    d.open = !d.open; sfx('swing');
  }

  // ---------- apartment hub ----------
  _newsLine() {
    const NEWS = [
      'CHANNEL 7 · CONTINUITY NEWS\n"Citizens, things are stable." Rot abatement completes ahead of schedule in Hyattsville. Residents may return Thursday.',
      'CHANNEL 7 · "A rot outbreak at Baltimore\'s Inner Harbor has been contained, officials say. The harbor will remain closed." Footage shows a crane folding in half, slowly.',
      'CHANNEL 7 · The Analog Union has closed its borders to "unattested data." Flights to Lisbon now require a paper ticket.',
      'CHANNEL 7 · Helium convoy attacked in the Gulf. Continuity reminds citizens that hoarding helium is a federal offense.',
      'CHANNEL 7 · Purple Line opening date: SOON. A reporter laughs and the feed cuts.',
      'CHANNEL 7 · Static, then two seconds of someone very familiar saying "hey—" before the channel corrects itself.',
    ];
    this._newsIdx = ((this._newsIdx ?? -1) + 1) % NEWS.length;
    return NEWS[this._newsIdx];
  }

  _objectives() {
    const f = this.save.flags, out = [];
    const did = (k) => !!f[k];
    out.push(did('act1.balloon.noticedGone') ? '✓ The balloon is gone from Manuel\'s closet.' : '· Check Manuel\'s closet.');
    out.push(did('act1.clue.lockForced') ? '✓ Someone forced the front door.' : '· Look at the front door.');
    out.push(Object.keys(f).some((k) => k.startsWith('act1.halvard')) ? '✓ Talked to the fence under the metro.' : '· Ask around the metro plaza.');
    out.push(Object.keys(f).some((k) => k.startsWith('act1.leadA')) ? '✓ Followed the helium.' : '· Print a sniffer (Fab #1) and follow the helium.');
    out.push(Object.keys(f).some((k) => k.startsWith('act1.leadC')) ? '✓ Watched the camera footage.' : '· Fix the hallway security monitor.');
    out.push(did('act1.complete') ? '✓ Act 1 complete.' : did('act1.beat.call') ? '· Get through the tunnels.' : '· Find where it went.');
    return 'WHAT WE\'RE DOING (whiteboard)\n\n' + out.join('\n');
  }

  _mateBreak() {
    if (this.mode === 'client') { this.net.send({ t: 'mate' }); return; }
    for (const p of this.sim.players.values()) this.sim.heal(p.id, 999);
    for (const p of this.sim.players.values()) {
      const c = this.save.party[p.character];
      if (c && !c.inventory.some((it) => it.id === 'item.mate_flask')) c.inventory.push({ id: 'item.mate_flask', qty: 1 });
    }
    this._syncParty();
  }

  _answer() {
    if (this.sim.answerSahur()) {
      this.save.flags['act1.call.answered'] = true;
      this.save.flags['act1.boss.defeated'] = true;
      this._announce('You answer. The drumming stops mid-beat. The tall wooden figure tilts its head, listening to something only it can hear, and walks back into the dark.');
    }
  }

  // Semi-dark lighting: a dark layer with light pools around players and lit objects.
  _setupLighting(map) {
    const DARK = { room631: 0.35, aster_hall: 0.45, metro_plaza: 0.4, tunnel_1: 0.7, platform: 0.62 };
    this.darkness = DARK[map.id] ?? 0.4;
    this.lights?.destroy();
    const W = VIEW.w, H = VIEW.h;
    this.lights = this.add.renderTexture(0, 0, W, H).setOrigin(0, 0).setScrollFactor(0).setDepth(8000);
    this.lightSpots = map.objects.filter((o) => o.npc || o.action === 'exit' || ['obj.printer_3', 'obj.mate', 'obj.pork_flag', 'obj.shrimp_tank', 'obj.billboard', 'obj.oscilloscope', 'obj.lobby_monitor'].includes(o.id));
    this.rotEdge = map.id === 'tunnel_1' || map.id === 'platform';
  }

  _makeVignette() {
    if (this.textures.exists('vignette')) return this.add.image(0, 0, 'vignette').setOrigin(0, 0).setScrollFactor(0).setDepth(8500);
    const tex = this.textures.createCanvas('vignette', VIEW.w, VIEW.h), c = tex.getContext();
    const g = c.createRadialGradient(VIEW.w / 2, VIEW.h / 2, VIEW.h * 0.35, VIEW.w / 2, VIEW.h / 2, VIEW.w * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,4,10,0.55)');
    c.fillStyle = g; c.fillRect(0, 0, VIEW.w, VIEW.h); tex.refresh();
    return this.add.image(0, 0, 'vignette').setOrigin(0, 0).setScrollFactor(0).setDepth(8500);
  }

  // Ambient life per area: dust motes indoors, rain over the plaza, drips in the tunnels.
  _tickAmbient(dt) {
    const kind = { metro_plaza: 'rain', tunnel_1: 'drip', platform: 'drip' }[this.map.id] ?? 'dust';
    this._ambAcc = (this._ambAcc ?? 0) + dt * (kind === 'rain' ? 70 : kind === 'drip' ? 3 : 6);
    const v = this.cameras.main.worldView;
    while (this._ambAcc > 1) {
      this._ambAcc -= 1;
      const x = v.x + Math.random() * v.width, y = v.y + Math.random() * v.height;
      if (kind === 'rain') {
        const r = this.add.rectangle(x, v.y - 4, 1, 6, 0x9ab8d8, 0.35).setDepth(7000);
        this.tweens.add({ targets: r, y: v.y + v.height * (0.4 + Math.random() * 0.6), x: x - 8, duration: 420, onComplete: () => r.destroy() });
      } else if (kind === 'drip') {
        const r = this.add.rectangle(x, y - 30, 1, 2, 0x7fb069, 0.6).setDepth(7000);
        this.tweens.add({ targets: r, y, duration: 600, ease: 'Quad.in', onComplete: () => { r.destroy(); const sp = this.add.circle(x, y, 2, 0x7fb069, 0.4).setDepth(7000); this.tweens.add({ targets: sp, scale: 2.5, alpha: 0, duration: 300, onComplete: () => sp.destroy() }); } });
      } else {
        const d = this.add.rectangle(x, y, 1, 1, 0xffe6c0, 0.45).setDepth(7000);
        this.tweens.add({ targets: d, x: x + (Math.random() * 16 - 8), y: y - 10 - Math.random() * 10, alpha: 0, duration: 2600 + Math.random() * 1600, onComplete: () => d.destroy() });
      }
    }
  }

  _drawLighting(snap) {
    if (!this.lights) return;
    const cam = this.cameras.main, rt = this.lights;
    rt.clear().fill(0x05060c, this.darkness);
    const at = (x, y, scale) => rt.erase('light', x - cam.worldView.x - 64 * scale, y - cam.worldView.y - 64 * scale);
    for (const p of snap.players) { this._lightImg ??= this.make.image({ key: 'light', add: false }); this._lightImg.setScale(1.3); rt.erase(this._lightImg, p.x - cam.worldView.x, p.y - 8 - cam.worldView.y); }
    // Rot things glow faintly, so enemies read in the dark.
    for (const e of snap.enemies || []) { this._lightImg.setScale(e.boss ? 0.9 : 0.4); rt.erase(this._lightImg, e.x - cam.worldView.x, e.y - 8 - cam.worldView.y); }
    for (const o of this.lightSpots) { this._lightImg.setScale(0.7); rt.erase(this._lightImg, o.x * TILE + 8 - cam.worldView.x, o.y * TILE + 8 - cam.worldView.y); }
    // Rot shows up as rendering errors at the screen edges.
    if (this.rotEdge && Math.random() < 0.12) {
      const W = VIEW.w, H = VIEW.h, y = Math.random() * H, h = 2 + Math.random() * 6, left = Math.random() < 0.5;
      rt.fill(Math.random() < 0.5 ? 0x7fb069 : 0xd65db1, 0.35, left ? 0 : W - 40, y, 40, h);
    }
  }

  _tryExit(obj) {
    if (!obj || obj.action !== 'exit' || this._transitioning) return;
    if (obj.requiresClear && !this.sim.cleared) return this._announce('Something down here is still moving.');
    const to = MAPS[obj.to];
    if (!to) return this._announce(obj.text);
    if (to.id === 'platform') {
      const sahur = Number(this.save.flags['act1.call.declines'] || 0) >= 3;
      this.sim.bossVariant = sahur ? 'sahur' : 'warden';
      this.save.flags['act1.boss.kind'] = this.sim.bossVariant;
    }
    // Quick fade out → swap → fade in. Players arrive beside the matching door on the other side.
    this._transitioning = true;
    const from = this.map.id;
    this.cameras.main.fadeOut(140, 5, 6, 12);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.sim.setMap(to, from);
      this.save.world.area = to.id;
      this._showMap(to); this._onEnterMap(to);
      this._save();
      this.cameras.main.fadeIn(220, 5, 6, 12);
      this._transitioning = false;
      if (obj.text && obj.text.length > 40) this._announce(obj.text);
    });
  }

  _announce(text) { this._say(text); if (this.mode === 'host') this.net.broadcast({ t: 'say', text }); }

  // ---------- UI ----------
  _makeUi() {
    const W = VIEW.w, H = VIEW.h;
    this.hint = this.add.text(W / 2, H - 46, '', { ...FONT, color: '#ffb347' }).setOrigin(0.5).setScrollFactor(0).setDepth(9000);
    this.box = this.add.rectangle(W / 2, H - 22, W - 20, 34, 0x0b0d16, 0.9).setStrokeStyle(1, 0x5d6487).setScrollFactor(0).setDepth(9000).setVisible(false);
    this.boxText = this.add.text(18, H - 36, '', { ...FONT, wordWrap: { width: W - 36 } }).setScrollFactor(0).setDepth(9001).setVisible(false);
    this.mapLabel = this.add.text(6, 4, '', { ...FONT, color: '#9aa3c7' }).setScrollFactor(0).setDepth(9000);
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(9000);
    this.hudText = this.add.text(W - 6, 4, '', { ...FONT, color: '#9aa3c7', align: 'right' }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);
  }

  // Small corner notice (saving etc.). Never a dialogue box.
  _toast(text) {
    this.toastText ??= this.add.text(VIEW.w - 6, VIEW.h - 10, '', { ...FONT, color: '#7fb069' }).setOrigin(1, 1).setScrollFactor(0).setDepth(9300);
    this.toastText.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1400, duration: 500 });
  }

  _save() {
    if (this.mode === 'client') return;
    this._toast('saving…');
    autosave(this.save).then(() => this._toast('✓ saved'));
  }

  // Descriptions stay up until E or a click outside the box.
  _say(text) { this.box.setVisible(true); this.boxText.setText(text).setVisible(true); this.sayOpen = true; }
  _closeSay() { this.box.setVisible(false); this.boxText.setVisible(false); this.sayOpen = false; }

  _objectAt(wx, wy) {
    return this.map.objects.find((o) => wx >= o.x * TILE - 2 && wx < o.x * TILE + TILE + 2 && wy >= o.y * TILE - 2 && wy < o.y * TILE + TILE + 2);
  }

  _onClick(ptr) {
    if (!this.ready || ptr.button !== 0) return;
    const { x: sx, y: sy } = toView(ptr);
    if (this.dlg) {
      this.input2.blockAttack = true;
      return;   // clicks never advance dialogue (E does); choices are clicked directly
    }
    if (this.menu) {
      this.input2.blockAttack = true;
      if (!this.gameMenu.contains(sx, sy)) this._closeMenu();
      return;
    }
    if (this.sayOpen) {
      this.input2.blockAttack = true;
      if (!this.box.getBounds().contains(sx, sy)) this._closeSay();
      return;
    }
    // World clicks are attacks. Interacting with things is E (nearest in reach).
  }

  _nearestObject(p) {
    let best = null, bd = 22;
    for (const o of this.map.objects) {
      const d = Math.hypot(o.x * TILE + 8 - p.x, o.y * TILE + 8 - p.y);
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }

  // ---------- loop ----------
  update(_, deltaMs) {
    if (!this.ready) return;
    let snap, me;
    if (this.mode === 'client') {
      snap = this._interpolated();
      me = snap?.players.find((p) => p.id === this.localId);
      if (!me) return;
      const inp = this._frozen(this.input2.read(me));
      this.net.send({ t: 'input', inp });
      this._handleInteract(me);
    } else {
      me = this.sim.players.get(this.localId);
      const inp = this._frozen(this.input2.read(me));
      // Solo: the world pauses while you read or use a menu. (Co-op keeps running for the others.)
      this.acc += this.mode === 'solo' && (this.dlg || this.menu) ? 0 : Math.min(deltaMs / 1000, 0.1);
      let first = true, events = [];
      while (this.acc >= STEP) {
        const inputs = new Map([[this.localId, first ? inp : { ...inp, dodge: false, interact: false }]]);
        for (const [peer, rinp] of this.remoteInputs) {
          inputs.set(peer, rinp);
          if (rinp.dodge) this.remoteInputs.set(peer, { ...rinp, dodge: false });
        }
        this.sim.step(STEP, inputs);
        events = events.concat(this.sim.events);
        this.acc -= STEP; first = false;
      }
      this._handleInteract(me);
      this._hostEvents(events);
      snap = this._lastSnap = { ...this.sim.snapshot(), events, doors: [...this.map.doors.values()].filter((d) => d.open).map((d) => d.id) };
    }
    if (snap.map !== this.map.id && MAPS[snap.map]) { this._showMap(MAPS[snap.map]); this._onEnterMap(MAPS[snap.map]); if (this.mode === 'client') this.cameras.main.fadeIn(220, 5, 6, 12); }
    this._lastRendered = snap;
    if (this.mode === 'client' && snap.doors) for (const d of this.map.doors.values()) d.open = snap.doors.includes(d.id);
    this._render(snap);
  }

  _frozen(inp) { return this.dlg || this.menu ? { ...inp, mx: 0, my: 0, attack: false, fire: false, dodge: false, interact: false } : inp; }

  _hostEvents(events) {
    for (const ev of events) {
      if (ev.t === 'bumpExit' && !this.dlg) {
        const exit = this.map.objects.find((o) => o.id === ev.id);
        if (exit?.requiresClear && !this.sim.cleared) { this._announce('Something down here is still moving.'); continue; }
        // Solo goes straight through. In co-op the party gathers at the door first.
        if (this.sim.players.size <= 1 || this.sim.waitAtExit(ev.by, ev.id, ev.dx, ev.dy)) { this.sim.clearWaiting(); this._tryExit(exit); }
      }
      if (ev.t === 'door') sfx('swing');
      if (ev.t === 'kill') {
        if (ev.key && !this.save.world.killed.includes(ev.key)) this.save.world.killed.push(ev.key);
        this.save.world.scrap = (this.save.world.scrap ?? 0) + (ev.boss ? 10 : 2);
        this._partyDirty = true;
        // XP is shared by the party (co-op), levels grant skill points.
        for (const p of this.sim.players.values()) {
          const c = this.save.party[p.character]; if (!c) continue;
          c.xp += ev.xp;
          while (c.xp >= c.level * XP_PER_LEVEL) {
            c.xp -= c.level * XP_PER_LEVEL; c.level++; c.skillPoints++;
            this._announce(`${p.character} reached level ${c.level}. (+1 skill point)`);
            if (c.level >= 3 && c.morph.stage < 1) { c.morph.stage = 1; this._announce(MORPH_UNLOCK[p.character]); }
          }
        }
      }
    }
    if (this._partyDirty) { this._partyDirty = false; this._syncParty(); }
    if (this.sim.wiped && !this._wipeAt) this._wipeAt = this.time.now + 2500;
    if (this._wipeAt && this.time.now > this._wipeAt) {
      this._wipeAt = 0;
      this.sim.setMap(this.sim.map);
      this._announce('Everything goes dark. You come to where you came in, aching. (The rot doesn\'t forget.)');
    }
  }

  _handleInteract(me) {
    if (this.dlg || this.menu) { this.hint.setText(''); return; }
    const inReach = (o) => Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y) <= 34;
    let nearest = null, nd = 34;
    for (const o of this.map.objects) { const d = Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y); if (d <= nd) { nd = d; nearest = o; } }
    this.hint.setText(nearest ? `[E] ${nearest.label}${nearest.door ? (nearest.open ? ' (close)' : ' (open)') : ''}` : '');
    const near = this._clickedObj; this._clickedObj = null;
    if (!near) return;
    if (!inReach(near)) { this.hint.setText(`${near.label} (too far)`); return; }
    if (near.action === 'exit') {
      if (this.mode === 'client') this.net.send({ t: 'exit', obj: near.id });
      else this._tryExit(near);
      return;
    }
    if (near.talk) { const [scene, node] = near.talk.split(':'); this.startDialogue(scene, node || null, near.after ? () => this._flag(near.after, true) : null); return; }
    if (near.action === 'ending') { this._playEnding(); return; }
    if (near.action === 'fab') { this._openFab(); return; }
    if (near.action === 'tv') { this._say(this._newsLine()); return; }
    if (near.action === 'quests') { this._say(this._objectives()); return; }
    if (near.action === 'pages') { const n = (this._pageIdx[near.id] = ((this._pageIdx[near.id] ?? -1) + 1) % near.pages.length); this._say(near.pages[n] + (near.pages.length > 1 ? `\n\n[E again: ${n + 1}/${near.pages.length}]` : '')); return; }
    if (near.action === 'mate') { this._mateBreak(); this._say(near.text + '\n\nEveryone has some. Better. (Thermos refilled.)'); return; }
    if (near.door) { if (this.mode === 'client') this.net.send({ t: 'door', id: near.id }); else this._toggleDoor(near.id); return; }
    this._say(near.text);
    if (near.flag) {
      if (this.mode === 'client') this.net.send({ t: 'flag', key: near.flag });
      else this.save.flags[near.flag] = true;
    }
    if (near.action === 'save') this._save();
  }

  // A roommate was interrupted mid long-idle: they scramble, and the party "saw nothing".
  _caught(p) {
    const s = this.sprites.get(p.id);
    if (s) this.tweens.add({ targets: s, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => s.setAngle(0) });
    if (this.save?.flags && !this.save.flags['secrets.sawNothing.found']) {
      if (this.mode !== 'client') this.save.flags['secrets.sawNothing.found'] = true;
      this._toast('★ Achievement: We saw nothing.');
    }
  }

  // ---------- rendering ----------
  _render(snap) {
    const seen = new Set();
    for (const p of snap.players) {
      seen.add(p.id);
      let s = this.sprites.get(p.id);
      if (!s) {
        s = this.add.sprite(p.x, p.y, p.c).setOrigin(0.5, 1);
        this.sprites.set(p.id, s);
        if (p.id === this.localId) this.cameras.main.startFollow(s, true, 0.15, 0.15);
      }
      s.setPosition(Math.round(p.x), Math.round(p.y + 4)).setDepth(p.y);
      const facing = p.f === 'left' ? 'right' : p.f;
      s.setFlipX(p.f === 'left');
      let key = `${p.c}_${p.m ? 'walk' : 'idle'}_${facing}`;
      // Long idle easter eggs: stand still for 3 minutes (?idle=<seconds> to test). Moving breaks it.
      const busy = p.m || p.d || p.sw || p.dn || p.iv;
      if (busy || s.idleSince === undefined) {
        if (s.longIdle && busy && !p.dn) this._caught(p);
        s.idleSince = this.time.now; s.longIdle = null;
      } else if (!s.longIdle && this.time.now - s.idleSince > IDLE_MS && this.anims.exists(`${p.c}_long`)) {
        const crude = true;   // crude humor is always on (Trevor)
        // Manuel's other idle: only in his morph ("the gonman" and up), one time in three, crude humor on.
        const alt = p.c === 'manuel' && p.mo && crude && this.anims.exists('manuel_alt') && ((Math.floor(this.time.now / 1000) + p.id.length) % 3 === 0);
        s.longIdle = alt ? 'manuel_alt' : `${p.c}_long`;
      }
      if (s.longIdle) { key = s.longIdle; s.setFlipX(false); }
      if (s.anims.currentAnim?.key !== key) s.play(key);
      if (!p.d) p._dashFx = false;
      if (p.m && !p.d && (this._stepTick = (this._stepTick ?? 0) + 1) % 16 === 0) {
        const puff = this.add.circle(p.x + (Math.random() * 4 - 2), p.y + 3, 1.5, 0xc8c0b0, 0.35).setDepth(p.y - 1);
        this.tweens.add({ targets: puff, scale: 2.2, alpha: 0, y: puff.y - 2, duration: 380, onComplete: () => puff.destroy() });
      }
      if (p.d && (this._ghostTick = (this._ghostTick ?? 0) + 1) % 2 === 0) this._dashGhost(s, p);
      s.setAlpha(p.d ? 0.55 : p.iv ? (Math.floor(this.time.now / 60) % 2 ? 0.4 : 1) : 1);
      s.setVisible(!p.w);
      s.setAngle(p.dn ? 90 : 0).setTint(p.dn ? 0x777788 : p.mo ? MORPH_LOOK[p.c][0] : 0xffffff).setScale(p.mo ? 1.12 : 1);
    }
    for (const [id, s] of this.sprites) if (!seen.has(id)) { s.destroy(); this.sprites.delete(id); }

    const eseen = new Set();
    for (const e of snap.enemies || []) {
      eseen.add(e.id);
      let s = this.enemySprites.get(e.id);
      const def = e.boss ? { radius: e.boss.r, color: e.boss.c } : ENEMIES[e.k];
      if (!s) {
        const anim = e.boss ? (e.boss.sahur ? 'sahur' : 'warden') : e.k;
        if (this.anims.exists(anim)) { s = this.add.sprite(e.x, e.y, e.boss ? (e.boss.sahur ? 'principals' : 'warden') : 'enemies').setOrigin(0.5, 1).play(anim); s.isArt = true; s.noTint = !!e.boss?.sahur; }
        else s = this.add.rectangle(e.x, e.y, def.radius * 2, def.radius * (e.boss ? 3 : 2) + 2, def.color).setOrigin(0.5, 1);
        this.enemySprites.set(e.id, s);
      }
      s.setPosition(e.x, e.y + 3).setDepth(e.y);
      if (s.isArt) { if (e.h) s.setTintFill(0xffffff); else if (e.boss && !s.noTint) s.setTint(def.color); else s.clearTint(); }
      else s.setFillStyle(e.h ? 0xffffff : def.color);
      if (e.boss) this._bossBar(e);
      s.setScale(1 + Math.sin(this.time.now / 90 + e.x) * 0.06, 1);   // jittery rot wobble
    }
    for (const [id, s] of this.enemySprites) if (!eseen.has(id)) { s.destroy(); this.enemySprites.delete(id); }
    if (!(snap.enemies || []).some((e) => e.boss)) this.bossUi?.setVisible(false);

    for (const d of this.doorVis ?? []) if (d.drawn !== !!d.o.open) { d.drawn = !!d.o.open; this._drawDoor(d.vis, d.o); }
    this.shotGfx.clear();
    for (const sh of snap.shots || []) this.shotGfx.fillStyle(sh.f ? 0xffd27f : 0xd65db1).fillCircle(sh.x, sh.y, sh.f ? 2 : 2.5);

    for (const ev of snap.events || []) this._fx(ev, snap);
    this._drawLighting(snap);
    this._tickAmbient(this.game.loop.delta / 1000);
    this.crowd?.update(this.game.loop.delta / 1000);
    this._tickTypewriter(this.game.loop.delta / 1000);
    this._updateExplored(snap);
    this._drawMinimap(snap);
    this._drawHud(snap);
  }

  // Door placeholder art: a framed wood panel with a knob; open = swung against the jamb.
  _drawDoor(g, o) {
    const x = o.x * TILE, y = o.y * TILE;
    g.clear();
    g.fillStyle(0x1a1410).fillRect(x, y, TILE, TILE);                 // dark doorway
    g.fillStyle(0x3b2a1e).fillRect(x, y, 2, TILE).fillRect(x + TILE - 2, y, 2, TILE).fillRect(x, y, TILE, 2); // frame
    if (o.open) {
      g.fillStyle(0x7a5236).fillRect(x + 2, y + 2, 3, TILE - 2);       // door edge, swung open
      g.fillStyle(0x9a6a46).fillRect(x + 2, y + 2, 1, TILE - 2);
    } else {
      g.fillStyle(0x7a5236).fillRect(x + 2, y + 2, TILE - 4, TILE - 2);
      g.fillStyle(0x8f6243).fillRect(x + 4, y + 4, TILE - 8, 4).fillRect(x + 4, y + 10, TILE - 8, 4); // panels
      g.fillStyle(0xd9b25a).fillRect(x + TILE - 6, y + 9, 2, 2);        // knob
    }
  }

  // Dash: cyan afterimages that streak and fade, plus a spark burst where the dash starts.
  _dashGhost(s, p) {
    const g = this.add.image(s.x, s.y, s.texture.key, s.frame.name).setOrigin(0.5, 1).setFlipX(s.flipX)
      .setTint(0x6ff2ff).setAlpha(0.55).setDepth(s.depth - 1).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: g, alpha: 0, scaleX: 0.85, duration: 220, onComplete: () => g.destroy() });
    if (!p._dashFx) {
      p._dashFx = true;
      for (let i = 0; i < 6; i++) {
        const sp = this.add.rectangle(p.x, p.y, 2, 2, 0xbff9ff).setDepth(s.depth);
        const a = Math.random() * Math.PI * 2, d = 6 + Math.random() * 8;
        this.tweens.add({ targets: sp, x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, alpha: 0, duration: 260, onComplete: () => sp.destroy() });
      }
    }
  }

  // ---------- exploration map ----------
  _explored(mapId) {
    const m = MAPS[mapId]; const ex = (this.save.world.explored ??= {});
    if (!ex[mapId] || ex[mapId].length !== m.w * m.h) ex[mapId] = '0'.repeat(m.w * m.h);
    return ex[mapId];
  }

  _updateExplored(snap) {
    if ((this._exT = (this._exT ?? 0) + 1) % 10) return;   // a few times a second is plenty
    const m = this.map, R = 6;
    const arr = this._explored(m.id).split('');
    let changed = false;
    for (const p of snap.players) {
      const cx = Math.floor(p.x / TILE), cy = Math.floor(p.y / TILE);
      for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
        if (x < 0 || y < 0 || x >= m.w || y >= m.h || (x - cx) ** 2 + (y - cy) ** 2 > R * R) continue;
        const i = y * m.w + x; if (arr[i] === '0') { arr[i] = '1'; changed = true; }
      }
    }
    if (changed) this.save.world.explored[m.id] = arr.join('');
    (this.save.world.visited ??= []).includes(m.id) || this.save.world.visited.push(m.id);
  }

  /** Draw the current area's explored map into graphics `g`, fitted to a box. Used by the minimap and the MAP tab. */
  drawAreaMap(g, bx, by, maxW, maxH, snap = this._lastRendered) {
    const m = this.map, ex = this._explored(m.id);
    const k = Math.max(1, Math.min(6, Math.floor(maxW / m.w), Math.floor(maxH / m.h)));
    const mw = m.w * k, mh = m.h * k, ox = bx + Math.floor((maxW - mw) / 2), oy = by;
    g.fillStyle(0x070912, 0.85).fillRect(ox - 2, oy - 2, mw + 4, mh + 4).lineStyle(1, 0x5d6487, 0.8).strokeRect(ox - 2, oy - 2, mw + 4, mh + 4);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (ex[y * m.w + x] !== '1') continue;
      g.fillStyle(m.solid(x, y) && !m.doors.get(`${x},${y}`) ? 0x3a3f66 : 0x1f2236).fillRect(ox + x * k, oy + y * k, k, k);
    }
    for (const o of m.objects) if (ex[o.y * m.w + o.x] === '1' && (o.action === 'exit' || o.door)) g.fillStyle(o.door ? 0x8a6a4a : 0xffb347).fillRect(ox + o.x * k, oy + o.y * k, k, k);
    for (const e of snap?.enemies || []) { const tx = Math.floor(e.x / TILE), ty = Math.floor(e.y / TILE); if (ex[ty * m.w + tx] === '1') g.fillStyle(0xd65db1).fillRect(ox + tx * k, oy + ty * k, k, k); }
    for (const p of snap?.players || []) { const d = k > 2 ? 1 : 0; g.fillStyle(p.id === this.localId ? 0x7fff9a : 0x6fb6ff).fillRect(ox + Math.floor(p.x / TILE) * k - d, oy + Math.floor(p.y / TILE) * k - d, k + 2 * d, k + 2 * d); }
  }

  _drawMinimap(snap) {
    const g = (this.mini ??= this.add.graphics().setScrollFactor(0).setDepth(9050)).clear();
    if (this.menu || this.dlg) return;
    const w = Math.min(100, this.map.w * 2), h = Math.min(40, this.map.h * 2);
    this.drawAreaMap(g, VIEW.w - w - 6, 44, w, h, snap);
  }

  _bossBar(e) {
    const W = VIEW.w;
    if (!this.bossUi) {
      this.bossUi = this.add.container(0, 0).setScrollFactor(0).setDepth(9100);
      this.bossName = this.add.text(W / 2, 22, '', { ...FONT, color: '#f2a6b8' }).setOrigin(0.5);
      this.bossGfx = this.add.graphics();
      this.bossUi.add([this.bossGfx, this.bossName]);
    }
    this.bossUi.setVisible(true);
    this.bossName.setText(`${e.boss.name}, ${e.boss.ep}${e.boss.ph === 3 ? '  [OVERLOAD]' : ''}${e.boss.ring ? '\n☎ YOUR PHONE IS RINGING. [F] ANSWER' : ''}`);
    const w = 200, x = W / 2 - w / 2;
    if (e.boss.sahur) { this.bossGfx.clear().fillStyle(0xa0703c).fillRect(x, 30, w, 4); return; }
    this.bossGfx.clear().fillStyle(0x1c1f33).fillRect(x, 30, w, 4).fillStyle(e.boss.ph === 3 ? 0xd65db1 : 0xf2a6b8).fillRect(x, 30, Math.max(0, e.hp / e.boss.max) * w, 4);
  }

  _fx(ev, snap) {
    if (['hit', 'kill', 'shot', 'swing'].includes(ev.t) && (ev.by === this.localId || ev.id === this.localId)) sfx(ev.t);
    if (ev.t === 'hurt' && ev.id === this.localId) sfx('hurt');
    if (ev.t === 'drum') { this.cameras.main.shake(40, ev.beat % 4 === 0 ? 0.006 : 0.002); sfx('hit'); }
    if (ev.t === 'boss' && !ev.sahur && this.mode !== 'client') this.save.flags['act1.boss.wardenName'] = ev.name;
    if (ev.t === 'kill' && ev.boss && this.mode !== 'client') this.save.flags['act1.boss.defeated'] = true;
    if (ev.t === 'kill' && ev.boss && !this._endingPlayed) { this._endingPlayed = true; this.time.delayedCall(900, () => this._playEnding(true)); }
    if (ev.t === 'phase') { this.cameras.main.shake(300, 0.01); this._say(ev.phase === 3 ? 'The Warden overloads. The platform starts rendering wrong.' : 'It changes how it moves.'); }
    if (ev.t === 'tell') { const g = this.add.circle(ev.x, ev.y - 8, 14, 0xd65db1, 0.35).setDepth(6000); this.tweens.add({ targets: g, scale: 2, alpha: 0, duration: 380, onComplete: () => g.destroy() }); }
    if (ev.t === 'hit') {
      for (let i = 0; i < 5; i++) {
        const sp = this.add.rectangle(ev.x, ev.y - 6, 1.5, 1.5, 0xffe08a).setDepth(6000);
        const a = Math.random() * Math.PI * 2, d = 6 + Math.random() * 10;
        this.tweens.add({ targets: sp, x: ev.x + Math.cos(a) * d, y: ev.y - 6 + Math.sin(a) * d, alpha: 0, duration: 220, onComplete: () => sp.destroy() });
      }
    }
    if (ev.t === 'kill') {
      for (let i = 0; i < 14; i++) {
        const sq = this.add.rectangle(ev.x + (Math.random() * 12 - 6), ev.y - 4 - Math.random() * 12, 2, 2, Math.random() < 0.5 ? 0x7fb069 : 0xd65db1).setDepth(6000);
        this.tweens.add({ targets: sq, y: sq.y - 8 - Math.random() * 10, x: sq.x + (Math.random() * 10 - 5), alpha: 0, duration: 380 + Math.random() * 300, onComplete: () => sq.destroy() });
      }
    }
    if (ev.t === 'hit' || ev.t === 'kill') {
      const t = this.add.text(ev.x, ev.y - 14, ev.t === 'kill' ? '✕' : `${ev.dmg}`, { ...FONT, color: ev.t === 'kill' ? '#7fb069' : '#ffd27f' }).setOrigin(0.5).setDepth(6000);
      this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 450, onComplete: () => t.destroy() });
      if (ev.by === this.localId) this.cameras.main.shake(60, 0.002);
    }
    if (ev.t === 'hurt' && ev.id === this.localId) { this.cameras.main.shake(120, 0.006); this.cameras.main.flash(80, 120, 20, 40); }
    if (ev.t === 'swing') {
      const p = snap.players.find((q) => q.id === ev.id); if (!p) return;
      const g = this.add.graphics().setDepth(p.y + 1);
      g.lineStyle(2, 0xe8e8f0, 0.8).beginPath().arc(p.x, p.y - 8, 16, ev.a - 0.9, ev.a + 0.9).strokePath();
      this.tweens.add({ targets: g, alpha: 0, duration: 140, onComplete: () => g.destroy() });
    }
    if (ev.t === 'morph') { const p = snap.players.find((q) => q.id === ev.id); if (p) { this.cameras.main.flash(120, 180, 255, 160); if (ev.id === this.localId) this._say(ev.on ? `${MORPH_LOOK[p.c][1]}. Stronger. Faster. Softer in the wrong places.` : 'You come back to yourself. Mostly.'); } }
    if (ev.t === 'down' && ev.id === this.localId) this._say('You\'re down. A roommate can pick you up: they just have to stand next to you.');
  }

  _drawHud(snap) {
    const g = this.hud.clear();
    const me = snap.players.find((p) => p.id === this.localId);
    const c = this.save.party[this.character];
    // Local player card: portrait, name, level badge, framed HP and stamina bars.
    if (!this.hudPortrait && this.textures.exists(this.character)) {
      this.hudPortrait = this.add.image(19, 22, this.character, 'idle_down_0').setCrop(0, 0, 16, 13).setScale(1.5).setOrigin(0.5, 0.3).setScrollFactor(0).setDepth(9001);
      this.hudName = this.add.text(34, 6, this.character[0].toUpperCase() + this.character.slice(1), { heading: true, fontSize: '8px', color: '#e8e8f0' }).setScrollFactor(0).setDepth(9001);
      this.mapLabel.setPosition(VIEW.w / 2, 5).setOrigin(0.5, 0);
    }
    g.fillStyle(0x0b0d16, 0.82).fillRoundedRect(4, 4, 112, 34, 3).lineStyle(1, 0x5d6487, 0.8).strokeRoundedRect(4, 4, 112, 34, 3);
    g.fillStyle(0x151827).fillRect(8, 8, 22, 26).lineStyle(1, 0x2b2f4a).strokeRect(8, 8, 22, 26);
    const bar = (y, frac, col, h) => { g.fillStyle(0x1c1f33).fillRect(34, y, 76, h); g.fillStyle(col).fillRect(34, y, Math.max(0, Math.min(1, frac)) * 76, h); g.lineStyle(1, 0x2b2f4a).strokeRect(34, y, 76, h); };
    if (me) {
      bar(19, me.hp / (me.mhp || 100), me.dn ? 0x777788 : me.hp / (me.mhp || 100) < 0.3 ? 0xd65db1 : 0x7fb069, 5);
      bar(27, (me.st ?? 100) / 100, 0x6ff2ff, 3);
    }
    g.fillStyle(0xffb347).fillRoundedRect(92, 6, 20, 9, 2);
    this.hudLv ??= this.add.text(102, 6.5, '', { ...FONT, fontSize: '7px', color: '#0b0d16' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(9002);
    this.hudLv.setText(`LV${c.level}`);
    // Teammates: small bars under the card.
    snap.players.filter((p) => p.id !== this.localId).forEach((p, i) => {
      const y = 42 + i * 7;
      g.fillStyle(0x0b0d16, 0.7).fillRect(4, y - 1, 70, 6);
      g.fillStyle(p.dn ? 0x777788 : 0x5f8fbf).fillRect(18, y, Math.max(0, (p.hp / (p.mhp || 100)) * 54), 4);
      if (p.dn) g.fillStyle(0xffb347).fillRect(18, y + 4, (p.rv / 2) * 54, 1);
      g.fillStyle({ michael: 0xc8605a, trevor: 0x3f6fb5, manuel: 0x5f8f3a }[p.c] ?? 0x888888).fillRect(7, y, 8, 4);
    });
    // Top-right: XP and scrap, compact.
    const lines = [`xp ${c.xp}/${c.level * XP_PER_LEVEL}${c.skillPoints ? `   ◆ ${c.skillPoints} skill pt [K]` : ''}`, `scrap ${this.save.world.scrap ?? 0}${snap.enemies?.length ? `   rot ${snap.enemies.length}` : ''}`];
    this.hudText.setText(lines.join('\n'));
    // Door gathering message overrides the prompt.
    const waiting = snap.players.filter((p) => p.w);
    if (waiting.length) {
      const up = snap.players.filter((p) => !p.dn).length;
      this.hint.setText(me?.w ? `Waiting at the door for the others (${waiting.length}/${up}). Move away to step back.` : `${waiting.length}/${up} waiting at a door. Walk into it to go through together.`);
    }
    // Prompt pill behind the hint text.
    const ht = this.hint.text;
    (this.hintBg ??= this.add.graphics().setScrollFactor(0).setDepth(8999)).clear();
    if (ht) { const wdt = this.hint.width + 12; this.hintBg.fillStyle(0x0b0d16, 0.85).fillRoundedRect(VIEW.w / 2 - wdt / 2, this.hint.y - 7, wdt, 14, 4).lineStyle(1, 0xffb347, 0.6).strokeRoundedRect(VIEW.w / 2 - wdt / 2, this.hint.y - 7, wdt, 14, 4); }
  }
}
