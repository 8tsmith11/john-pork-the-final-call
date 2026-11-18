import { Sim, TILE } from '../../engine/sim.js';
import { InputReader } from '../../engine/input.js';
import { newSave } from '../../engine/save/schema.js';
import { autosave, loadAutosave } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed } from '../../engine/rng.js';
import { MAPS } from '../../content/maps/index.js';
import { TILE_COLORS } from '../../content/maps/build.js';
import { ENEMIES } from '../../content/enemies.js';
import { GAME_VERSION } from '../../version.js';
import { loadScene, Conversation } from '../../engine/dialogue.js';
import { babble, setArea, sfx } from '../../audio/audio.js';
import { ITEMS, RECIPES, SKILLS, playerMods } from '../../content/items.js';

const STEP = 1 / 60;
const XP_PER_LEVEL = 30;
const FONT = { fontFamily: 'monospace', fontSize: '8px', color: '#e8e8f0' };

export class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }

  // mode: 'solo' | 'host' | 'client'. Host and solo run the Sim; clients render host snapshots.
  init(data) {
    this.character = data.character; this.mode = data.mode;
    this.net = data.net; this.assignments = data.assignments; this.passedSave = data.save;
  }

  async create() {
    this.save = this.passedSave ?? (await loadAutosave().catch(() => null)) ?? this._newGame();
    const startMap = MAPS[this.save.world.area] ?? MAPS.room631;
    this.sim = new Sim(startMap, { seed: this.save.world.seed });
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
    if (this.mode !== 'client') for (const p of this.sim.players.values()) this.sim.setMods(p.id, playerMods(this.save.party[p.character], p.character));
    this.save.world.scrap ??= 0;
    this._makeMenu();
    this.input.keyboard.on('keydown-K', () => this.menu ? this._closeMenu() : this._openSkills());
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
    const W = this.scale.width, H = this.scale.height;
    this.dlgBg = this.add.rectangle(W / 2, H - 46, W - 16, 84, 0x0b0d16, 0.94).setStrokeStyle(1, 0xf2a6b8).setScrollFactor(0).setDepth(9500).setVisible(false);
    this.dlgWho = this.add.text(16, H - 84, '', { ...FONT, color: '#ffb347' }).setScrollFactor(0).setDepth(9501);
    this.dlgText = this.add.text(16, H - 72, '', { ...FONT, wordWrap: { width: W - 34 }, lineSpacing: 2 }).setScrollFactor(0).setDepth(9501);
    this.dlgChoices = [0, 1, 2, 3, 4, 5].map((i) => this.add.text(22, H - 72 + i * 11, '', { ...FONT, color: '#9aa3c7' })
      .setScrollFactor(0).setDepth(9501).setInteractive({ useHandCursor: true })
      .on('pointerover', function () { this.setColor('#ffb347'); }).on('pointerout', function () { this.setColor('#9aa3c7'); })
      .on('pointerdown', () => this._choose(i)));
    this.input.keyboard.on('keydown', (ev) => {
      if (!this.dlg) return;
      if (ev.key === 'e' || ev.key === 'E' || ev.key === ' ' || ev.key === 'Enter') { this.dlg.choices.length ? null : this.dlg.advance(); this._drawDialogue(); }
      const n = parseInt(ev.key, 10); if (n >= 1 && n <= 6) this._choose(n - 1);
    });
    this._drawDialogue();
  }

  _choose(i) { if (!this.dlg?.choices[i]) return; this.dlg.choose(i); this._drawDialogue(); }

  _drawDialogue() {
    const d = this.dlg, on = !!d && !d.done;
    [this.dlgBg, this.dlgWho, this.dlgText, ...this.dlgChoices].forEach((o) => o.setVisible(on));
    if (d && d.done) { this.dlg = null; const cb = this.dlgDone; this.dlgDone = null; cb?.(); return; }
    if (!on) return;
    const choices = d.choices;
    if (choices.length) {
      this.dlgWho.setText('');
      this.dlgText.setText('');
      this.dlgChoices.forEach((t, i) => t.setText(choices[i] ? `${i + 1}. ${choices[i].text}` : '').setVisible(!!choices[i]));
    } else {
      const line = d.line;
      this.dlgWho.setText(line?.who ? line.who.toUpperCase() : '');
      if (line && line !== this._lastLine) { this._lastLine = line; babble(line.who, line.text); }
      this.dlgText.setText(line?.text?.replace(/\*([^*]+)\*/g, '$1') ?? '');
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
        if (msg.t === 'craft') this._craft(this._charOf(peer), msg.idx);
        if (msg.t === 'skill') this._learn(this._charOf(peer), msg.id);
        if (msg.t === 'use') this._use(this._charOf(peer), peer);
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
    this.mapGfx?.destroy();
    const g = this.mapGfx = this.add.graphics().setDepth(-10);
    map.layout.forEach((row, ty) => [...row].forEach((ch, tx) => {
      g.fillStyle(TILE_COLORS[ch] ?? 0x000000).fillRect(tx * TILE, ty * TILE, TILE, TILE);
      if (ch === '#') g.fillStyle(0x262a45).fillRect(tx * TILE, ty * TILE, TILE, 3);
      if (ch === 't') g.fillStyle(0x6b5d4d).fillRect(tx * TILE, ty * TILE + 5, TILE, 1).fillRect(tx * TILE, ty * TILE + 10, TILE, 1);
    }));
    for (const o of map.objects) {
      const warm = o.id === 'obj.printer_3' || o.id === 'obj.mate';
      const color = o.npc ? 0x8a8f6a : o.action === 'exit' ? 0xffb347 : o.id.includes('statue') || o.id.includes('flag') ? 0xf2a6b8 : warm ? 0xd98a4a : 0x6d7899;
      g.fillStyle(color, o.action === 'exit' ? 0.5 : 1).fillRect(o.x * TILE + 3, o.y * TILE + 3, TILE - 6, TILE - 6);
    }
    const mw = map.w * TILE, mh = map.h * TILE, vw = this.scale.width, vh = this.scale.height;
    this.cameras.main.setBounds(Math.min(0, (mw - vw) / 2), Math.min(0, (mh - vh) / 2), Math.max(mw, vw), Math.max(mh, vh)).setRoundPixels(true);
    this.mapLabel.setText(map.name);
    setArea(map.id);
    for (const s of this.enemySprites.values()) s.destroy();
    this.enemySprites.clear();
  }

  async _playEnding(fromBoss = false) {
    if (!fromBoss && this.mode !== 'client' && !this.sim.cleared) return this._announce('Something down here is still moving.');
    this.startDialogue('ending', null, () => {
      this._flag('act1.complete', true);
      const W = this.scale.width, H = this.scale.height;
      const card = this.add.text(W / 2, H / 2, 'ACT 1\nMISSED CALLS', { fontFamily: 'monospace', fontSize: '18px', color: '#f2a6b8', align: 'center' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(9999).setAlpha(0);
      this.tweens.add({ targets: card, alpha: 1, duration: 1600, hold: 2600, yoyo: true });
      if (this.mode !== 'client') { this.save.world.act = 2; autosave(this.save); }
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

  _makeMenu() {
    const W = this.scale.width;
    this.menuBg = this.add.rectangle(W / 2, 128, 300, 196, 0x0b0d16, 0.95).setStrokeStyle(1, 0xffb347).setScrollFactor(0).setDepth(9600).setVisible(false);
    this.menuTitle = this.add.text(W / 2 - 140, 42, '', { ...FONT, color: '#ffb347' }).setScrollFactor(0).setDepth(9601);
    this.menuRows = [0, 1, 2, 3, 4, 5, 6].map((i) => this.add.text(W / 2 - 136, 58 + i * 25, '', { ...FONT, wordWrap: { width: 270 } })
      .setScrollFactor(0).setDepth(9601).setInteractive({ useHandCursor: true }).on('pointerdown', () => this._pickMenu(i)));
    this.input.keyboard.on('keydown', (ev) => {
      if (!this.menu) return;
      if (ev.key === 'Escape') return this._closeMenu();
      const n = parseInt(ev.key, 10); if (n >= 1 && n <= 7) this._pickMenu(n - 1);
    });
    this._closeMenu();
  }

  _openFab() { this.menu = 'fab'; this._refreshMenu(); }
  _openSkills() { this.menu = 'skills'; this._refreshMenu(); }
  _closeMenu() { this.menu = null; [this.menuBg, this.menuTitle, ...this.menuRows].forEach((o) => o.setVisible(false)); }

  _refreshMenu() {
    if (!this.menu) return;
    const c = this.save.party[this.character];
    let title, rows;
    if (this.menu === 'fab') {
      title = `FAB #2 · scrap: ${this.save.world.scrap}   [1-5] print  [ESC] close`;
      rows = RECIPES.map((r, i) => `${i + 1}. ${ITEMS[r.item].name} (${r.scrap} scrap): ${ITEMS[r.item].text}`);
    } else {
      title = `${this.character.toUpperCase()} · level ${c.level} · skill points: ${c.skillPoints}   [K] close`;
      rows = (SKILLS[this.character] || []).map((s, i) => `${i + 1}. ${s.name} [${c.skills[s.id] ?? 0}/${s.max}]: ${s.text}`);
    }
    [this.menuBg, this.menuTitle].forEach((o) => o.setVisible(true));
    this.menuTitle.setText(title);
    this.menuRows.forEach((t, i) => t.setText(rows[i] ?? '').setVisible(!!rows[i]));
  }

  _pickMenu(i) {
    if (this.menu === 'fab') { if (this.mode === 'client') this.net.send({ t: 'craft', idx: i }); else this._craft(this.character, i); }
    if (this.menu === 'skills') {
      const s = (SKILLS[this.character] || [])[i]; if (!s) return;
      if (this.mode === 'client') this.net.send({ t: 'skill', id: s.id }); else this._learn(this.character, s.id);
    }
  }

  _answer() {
    if (this.sim.answerSahur()) {
      this.save.flags['act1.call.answered'] = true;
      this.save.flags['act1.boss.defeated'] = true;
      this._announce('You answer. The drumming stops mid-beat. The tall wooden figure tilts its head, listening to something only it can hear, and walks back into the dark.');
    }
  }

  _tryExit(obj) {
    if (!obj || obj.action !== 'exit') return;
    if (obj.requiresClear && !this.sim.cleared) return this._announce('Something down here is still moving.');
    const to = MAPS[obj.to];
    if (!to) return this._announce(obj.text);
    if (to.id === 'platform') {
      const sahur = Number(this.save.flags['act1.call.declines'] || 0) >= 3;
      this.sim.bossVariant = sahur ? 'sahur' : 'warden';
      this.save.flags['act1.boss.kind'] = this.sim.bossVariant;
    }
    this.sim.setMap(to);
    this.save.world.area = to.id;
    this._announce(obj.text);
  }

  _announce(text) { this._say(text); if (this.mode === 'host') this.net.broadcast({ t: 'say', text }); }

  // ---------- UI ----------
  _makeUi() {
    const W = this.scale.width, H = this.scale.height;
    this.hint = this.add.text(W / 2, H - 46, '', { ...FONT, color: '#ffb347' }).setOrigin(0.5).setScrollFactor(0).setDepth(9000);
    this.box = this.add.rectangle(W / 2, H - 22, W - 20, 34, 0x0b0d16, 0.9).setStrokeStyle(1, 0x5d6487).setScrollFactor(0).setDepth(9000).setVisible(false);
    this.boxText = this.add.text(18, H - 36, '', { ...FONT, wordWrap: { width: W - 36 } }).setScrollFactor(0).setDepth(9001).setVisible(false);
    this.mapLabel = this.add.text(6, 4, '', { ...FONT, color: '#9aa3c7' }).setScrollFactor(0).setDepth(9000);
    this.hud = this.add.graphics().setScrollFactor(0).setDepth(9000);
    this.hudText = this.add.text(W - 6, 4, '', { ...FONT, color: '#9aa3c7', align: 'right' }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);
  }

  _say(text) { this.box.setVisible(true); this.boxText.setText(text).setVisible(true); this.sayUntil = this.time.now + 4500; }

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
      this._handleInteract(me, inp.interact);
    } else {
      me = this.sim.players.get(this.localId);
      const inp = this._frozen(this.input2.read(me));
      this.acc += Math.min(deltaMs / 1000, 0.1);
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
      if (first) this._pendingInteract ||= inp.interact;
      this._handleInteract(me, inp.interact || this._pendingInteract);
      this._pendingInteract = false;
      this._hostEvents(events);
      snap = this._lastSnap = { ...this.sim.snapshot(), events };
    }
    if (snap.map !== this.map.id && MAPS[snap.map]) { this._showMap(MAPS[snap.map]); this._onEnterMap(MAPS[snap.map]); }
    this._lastRendered = snap;
    if (this.sayUntil && this.time.now > this.sayUntil) { this.box.setVisible(false); this.boxText.setVisible(false); this.sayUntil = 0; }
    this._render(snap);
  }

  _frozen(inp) { return this.dlg || this.menu ? { ...inp, mx: 0, my: 0, attack: false, fire: false, dodge: false, interact: false } : inp; }

  _hostEvents(events) {
    for (const ev of events) {
      if (ev.t === 'kill') {
        this.save.world.scrap = (this.save.world.scrap ?? 0) + (ev.boss ? 10 : 2);
        this._partyDirty = true;
        // XP is shared by the party (co-op), levels grant skill points.
        for (const p of this.sim.players.values()) {
          const c = this.save.party[p.character]; if (!c) continue;
          c.xp += ev.xp;
          while (c.xp >= c.level * XP_PER_LEVEL) { c.xp -= c.level * XP_PER_LEVEL; c.level++; c.skillPoints++; this._announce(`${p.character} reached level ${c.level}. (+1 skill point)`); }
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

  _handleInteract(me, pressed) {
    if (this.dlg) { this.hint.setText(''); return; }
    const near = this._nearestObject(me);
    this.hint.setText(near ? `[E] ${near.label}` : '');
    if (!pressed || !near) return;
    if (near.action === 'exit') {
      if (this.mode === 'client') this.net.send({ t: 'exit', obj: near.id });
      else this._tryExit(near);
      return;
    }
    if (near.talk) { const [scene, node] = near.talk.split(':'); this.startDialogue(scene, node || null, near.after ? () => this._flag(near.after, true) : null); return; }
    if (near.action === 'ending') { this._playEnding(); return; }
    if (near.action === 'fab') { this._openFab(); return; }
    this._say(near.text);
    if (near.flag) {
      if (this.mode === 'client') this.net.send({ t: 'flag', key: near.flag });
      else this.save.flags[near.flag] = true;
    }
    if (near.action === 'save') {
      if (this.mode === 'client') this._say('Only the host can save. (Their save is the world.)');
      else autosave(this.save);
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
      const key = `${p.c}_${p.m ? 'walk' : 'idle'}_${facing}`;
      if (s.anims.currentAnim?.key !== key) s.play(key);
      s.setAlpha(p.d ? 0.55 : p.iv ? (Math.floor(this.time.now / 60) % 2 ? 0.4 : 1) : 1);
      s.setAngle(p.dn ? 90 : 0).setTint(p.dn ? 0x777788 : 0xffffff);
    }
    for (const [id, s] of this.sprites) if (!seen.has(id)) { s.destroy(); this.sprites.delete(id); }

    const eseen = new Set();
    for (const e of snap.enemies || []) {
      eseen.add(e.id);
      let s = this.enemySprites.get(e.id);
      const def = e.boss ? { radius: e.boss.r, color: e.boss.c } : ENEMIES[e.k];
      if (!s) { s = this.add.rectangle(e.x, e.y, def.radius * 2, def.radius * (e.boss ? 3 : 2) + 2, def.color).setOrigin(0.5, 1); this.enemySprites.set(e.id, s); }
      s.setPosition(e.x, e.y + 3).setDepth(e.y).setFillStyle(e.h ? 0xffffff : def.color);
      if (e.boss) this._bossBar(e);
      s.setScale(1 + Math.sin(this.time.now / 90 + e.x) * 0.06, 1);   // jittery rot wobble
    }
    for (const [id, s] of this.enemySprites) if (!eseen.has(id)) { s.destroy(); this.enemySprites.delete(id); }
    if (!(snap.enemies || []).some((e) => e.boss)) this.bossUi?.setVisible(false);

    this.shotGfx.clear();
    for (const sh of snap.shots || []) this.shotGfx.fillStyle(sh.f ? 0xffd27f : 0xd65db1).fillCircle(sh.x, sh.y, sh.f ? 2 : 2.5);

    for (const ev of snap.events || []) this._fx(ev, snap);
    this._drawHud(snap);
  }

  _bossBar(e) {
    const W = this.scale.width;
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
    if (ev.t === 'down' && ev.id === this.localId) this._say('You\'re down. A roommate can pick you up: they just have to stand next to you.');
  }

  _drawHud(snap) {
    const g = this.hud.clear();
    const lines = [];
    snap.players.forEach((p, i) => {
      const y = 16 + i * 9, w = 60;
      g.fillStyle(0x1c1f33).fillRect(6, y, w, 5);
      g.fillStyle(p.dn ? 0x777788 : p.id === this.localId ? 0x7fb069 : 0x5f8fbf).fillRect(6, y, Math.max(0, (p.hp / (p.mhp || 100)) * w), 5);
      if (p.dn) g.fillStyle(0xffb347).fillRect(6, y + 5, (p.rv / 2) * w, 1);
    });
    if (snap.enemies?.length) lines.push(`rot: ${snap.enemies.length}`);
    const c = this.save.party[this.character];
    lines.push(`lv ${c.level}  xp ${c.xp}/${c.level * XP_PER_LEVEL}${c.skillPoints ? `  [K] ${c.skillPoints} pt` : ''}`);
    lines.push(`scrap ${this.save.world.scrap ?? 0}`);
    this.hudText.setText(lines.join('\n'));
  }
}
