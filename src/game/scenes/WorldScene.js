import { Sim, TILE } from '../../engine/sim.js';
import { VIEW, setupCameras, toView } from '../../view.js';
import { InputReader } from '../../engine/input.js';
import { newSave } from '../../engine/save/schema.js';
import { autosave, loadAutosave, exportFile } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed } from '../../engine/rng.js';
import { MAPS, worldPos } from '../../content/maps/index.js';
import { TILE_COLORS } from '../../content/maps/build.js';
import { ENEMIES } from '../../content/enemies.js';
import { GAME_VERSION } from '../../version.js';
import { loadScene, Conversation } from '../../engine/dialogue.js';
import { babble, setArea, sfx, ring, speak, hush } from '../../audio/audio.js';
import { DROPS, SHOPS, ITEMS, RECIPES, SKILLS, playerMods } from '../../content/items.js';
import { tileKey } from '../render/tiles.js';
import { GameMenu, TABS } from '../ui/GameMenu.js';
import { Crowd } from '../crowd.js';
import { BARKS, pickBark } from '../../content/barks.js';
import { rollCatch } from '../../content/fish.js';
import { QUESTS, questState } from '../../content/quests.js';
import { CompanionBrain, isAi } from '../../engine/companion.js';
import * as Inv from '../../engine/inventory.js';
import { Neon } from '../render/neon.js';
import { skillNode, skillOpen, migrateSkills } from '../../content/skills.js';
import { PipePuzzle } from '../ui/PipePuzzle.js';
import { solution as yardSolution, clueFor, YARD_MAP_TEXT, LEVERS } from '../../content/switchyard.js';
import { CLOCKS, CLOCK_TIMES, clockTime, clocksSolved, PAPER_CLOCK_NOTE, BUST_ORDER, BUST_HINT } from '../../content/optionalPuzzles.js';

const STEP = 1 / 60;
const XP_PER_LEVEL = 30;
const TRAIT_LABEL = { sprinter: 'fast', armored: 'armored', splitter: 'splits', puddler: 'leaks coderot', blinker: 'blinks' };
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
      // Task 9: roommates nobody is playing are still here, run by the companion brain.
      const taken = new Set([...this.sim.players.values()].map((p) => p.character));
      for (const ch of ['trevor', 'manuel', 'michael']) if (!taken.has(ch)) this.sim.addPlayer(`ai:${ch}`, ch);
      this.brain = new CompanionBrain(this.sim);
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
    this.save.world.money ??= 25;
    this.save.flags['settings.crudeHumor'] = 'on';   // always on (Trevor); scripts branch on it
    for (const [who, c] of Object.entries(this.save.party)) { Inv.normalize(c); migrateSkills(c, who); }
    this._makeMenu();
    this.input.keyboard.on('keydown-Q', () => { if (this.dlg || this.menu) return; if (this.mode === 'client') this.net.send({ t: 'scooter' }); else this._scooter(this.localId); });
    this.input.keyboard.on('keydown-M', () => { if (this.mode === 'client') this.net.send({ t: 'morph' }); else this._morph(this.localId); });
    // E: close an open panel/description, otherwise interact with the nearest thing in reach.
    this.input.keyboard.on('keydown-E', () => {
      if (this.dlg) return;                       // dialogue handles E itself (advance)
      if (this.fishing) { this._reel(); return; }
      if (this.menu) return this._closeMenu();
      if (this.sayOpen) return this._closeSay();
      const me = this.mode === 'client' ? this._lastRendered?.players.find((p) => p.id === this.localId) : this.sim.players.get(this.localId);
      if (!me) return;
      let best = null, bd = 34;
      for (const o of this.map.objects) { const d = Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y); if (d <= bd) { bd = d; best = o; } }
      if (best) { this._clickedObj = best; return; }
      if (this._nearWater(me)) { this._startFishing(me); return; }
      const person = this.crowd?.nearest(me.x, me.y);
      if (person) { person.mode = 'wait'; person.t = 4; person.spr.setFlipX(person.x > me.x); this._say(`${person.name.toUpperCase()}\n${this.crowd.lineFor(person)}`); if (person.pixel) this._flag?.('secrets.pixelated.found', true); babble(null, 'hey there friend'); }
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
      inventory: Inv.ids(me), seed: this.save.world.rolls?.twistVariant ?? 'A',
      morph: me.morph.stage, standing: this.save.standing,
    };
  }

  async startDialogue(sceneName, nodeId, onDone) {
    if (this.dlg) return;
    const scene = await loadScene(sceneName);
    const sink = {
      flag: (k, v) => this._flag(k, v),
      item: (item, n = 1) => { if (this.mode === 'client') this.net.send({ t: 'item', who: this.character, item, n }); else { Inv.add(this.save.party[this.character], `item.${item}`, n); this._syncParty(); } this._toast(`★ ${ITEMS[`item.${item}`]?.name ?? item}${n > 1 ? ' ×' + n : ''}`); },
      standing: (f, n) => { if (f in this.save.standing) this.save.standing[f] += n; if (this.mode === 'client') this.net.send({ t: 'standing', faction: f, n }); },
    };
    this.dlg = new Conversation(scene, nodeId, this._dialogueCtx(), sink);
    this.dlgVoiced = sceneName === 'ending';   // act-ending cutscene: spoken voices
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
    this.dlgMeasure = this.add.text(0, -999, '', { ...FONT, fontSize: '9px', wordWrap: { width: W - 110 }, lineSpacing: 1 }).setVisible(false);
    this.dlgChoices = [0, 1, 2, 3, 4, 5].map((i) => this.add.text(34, H - 62 + i * 9.5, '', { ...FONT, fontSize: '8.5px', color: '#9aa3c7', wordWrap: { width: W - 80 } })
      .setScrollFactor(0).setDepth(9501).setInteractive({ useHandCursor: true })
      .on('pointerover', function () { this.setColor('#ffb347'); }).on('pointerout', function () { this.setColor('#9aa3c7'); })
      .on('pointerdown', () => this._choose(i)));
    this.input.keyboard.on('keydown', (ev) => {
      if (!this.dlg) {
        const n = parseInt(ev.key, 10);
        if (n >= 1 && n <= 9 && !this.menu && !this.puzzle) this.menuUseSlot(n - 1);
        return;
      }
      if (ev.key === 'e' || ev.key === 'E' || ev.key === ' ' || ev.key === 'Enter') {
        if (!this.dlg.choices.length && (this._typeShown ?? 0) < (this._typeFull?.length ?? 0)) { this._typeShown = this._typeFull.length; this._drawDialogue(); return; }
        if (!this.dlg.choices.length && this.time.now - (this._lineAt ?? 0) > 220) this.dlg.advance();
        this._drawDialogue();
      }
      const n = parseInt(ev.key, 10); if (n >= 1 && n <= 6) this._choose(n - 1);
    });
    this._drawDialogue();
  }

  // "Him calling you is like getting hacked": the game itself is taken over before the call connects.
  _hackCall(onDone) {
    this._lastCallAt = this.time.now;
    if (this._hacking) return; this._hacking = true;
    const W = VIEW.w, H = VIEW.h, root = this.add.container(0, 0).setScrollFactor(0).setDepth(9800);
    const noise = this.add.graphics(); root.add(noise);
    const panel = this.add.graphics(); root.add(panel);
    const pw = 150, ph = 120, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    panel.fillStyle(0x05060c, 0.96).fillRoundedRect(px, py, pw, ph, 8).lineStyle(2, 0xf2a6b8, 1).strokeRoundedRect(px, py, pw, ph, 8);
    const t1 = this.add.text(W / 2, py + 8, 'INCOMING CALL', { ...FONT, fontSize: '8px', color: '#9aa3c7' }).setOrigin(0.5, 0);
    const t2 = this.add.text(W / 2, py + 18, 'JOHN PORK', { heading: true, fontSize: '14px', color: '#f2a6b8' }).setOrigin(0.5, 0);
    root.add([t1, t2]);
    if (this.anims.exists('pork')) { const face = this.add.sprite(W / 2, py + ph - 26, 'principals').play('pork').setOrigin(0.5, 1).setScale(2); root.add(face); }
    const ans = this.add.text(W / 2, py + ph - 14, '◉ connecting…', { ...FONT, fontSize: '8px', color: '#7fb069' }).setOrigin(0.5, 0); root.add(ans);
    const hudBits = [this.hudText, this.mapLabel, this.hudName, this.hudLv].filter(Boolean);
    const saved = hudBits.map((h) => h.text);
    const garble = (s) => s.replace(/[^\s]/g, () => '█▓▒░#@%&01'[Math.floor(Math.random() * 10)]);
    ring(2);
    this.cameras.main.shake(400, 0.008);
    const t0 = this.time.now;
    const tick = this.time.addEvent({ delay: 50, loop: true, callback: () => {
      const k = (this.time.now - t0) / 3200;
      noise.clear();
      for (let i = 0; i < 26; i++) {                                    // static + torn scanlines
        const y = Math.random() * H, h = 1 + Math.random() * 5;
        noise.fillStyle([0xd65db1, 0x7fb069, 0x6ff2ff, 0xffffff][i % 4], 0.10 + Math.random() * 0.25).fillRect(Math.random() * W * 0.3 - 20, y, W * (0.4 + Math.random() * 0.8), h);
      }
      noise.fillStyle(0x000000, 0.25 + 0.2 * Math.sin(this.time.now / 40)).fillRect(0, 0, W, H);
      hudBits.forEach((h) => h.setText(garble(h.text || 'XXXXXXXX')));
      root.x = Math.random() < 0.2 ? (Math.random() * 6 - 3) : 0;
      if (k > 0.7) ans.setText('◉ ANSWERED. You did not press anything.').setColor('#f2a6b8');
    } });
    this.time.delayedCall(3200, () => {
      tick.remove();
      hudBits.forEach((h, i) => h.setText(saved[i]));
      this.tweens.add({ targets: root, alpha: 0, duration: 250, onComplete: () => { root.destroy(); this._hacking = false; onDone?.(); } });
    });
  }

  _setPortrait(who) {
    const id = (who || '').toLowerCase();
    const isRoommate = ['michael', 'trevor', 'manuel'].includes(id) && this.textures.exists(id);
    const isPork = (id === 'pork' || id === 'john pork' || id === 'text: john pork') && this.textures.exists('principals');
    this.dlgPortraitBg.setVisible(true);
    this._porkTalking = isPork;
    this.dlgBg.setStrokeStyle(1, isPork ? 0xd65db1 : 0xf2a6b8);
    if (isPork) {
      this.dlgPortrait.setTexture('principals', 'pork_0').setCrop(0, 0, 24, 18).setScale(2.2).setOrigin(0.5, 0.3).setVisible(true);
      this.dlgInitial.setText('');
    } else if (isRoommate) {
      // Head-and-shoulders crop of the roommate's sprite, scaled up.
      this.dlgPortrait.setTexture(id, 'idle_down_0').setCrop(0, 0, 16, 14).setScale(3).setOrigin(0.5, 0.25).setVisible(true);
      this.dlgInitial.setText('');
    } else {
      this.dlgPortrait.setVisible(false);
      this.dlgInitial.setText(who ? who[0].toUpperCase() : '');
    }
  }

  _tickPorkGlitch() {
    if (!this.dlg || !this._porkTalking) { if (this.dlgBg && this.dlgBg.x !== VIEW.w / 2) this.dlgBg.setX(VIEW.w / 2); return; }
    const j = Math.random() < 0.15 ? (Math.random() * 4 - 2) : 0;
    this.dlgBg.setX(VIEW.w / 2 + j); this.dlgText.setX(76 + j);
    if (Math.random() < 0.04) this.cameras.main.shake(60, 0.002);
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
    if (!on) { this.dlgTimer?.setVisible(false); this.dlgPortrait.setVisible(false); this.dlgPortraitBg.setVisible(false); this.dlgInitial.setText(''); }
    if (d && d.done) { this.dlg = null; if (this.dlgVoiced) hush(); this.dlgVoiced = false; const cb = this.dlgDone; this.dlgDone = null; cb?.(); return; }
    if (!on) return;
    const choices = d.choices;
    this.dlgTimer?.setVisible(false);
    if (choices.length) {
      if (this._choicesFor !== d.nodeId) { this._choicesFor = d.nodeId; this._lineAt = this.time.now; }
      // A timed choice ("Let it ring."): count down on screen and take it if nobody picks.
      const ti = choices.findIndex((c) => c.timeout);
      if (ti >= 0) {
        const left = Math.ceil(choices[ti].timeout - (this.time.now - this._lineAt) / 1000);
        if (left <= 0) { this._lineAt = 0; this._choose(ti); return; }
        this.dlgWho.setText('');
        this.dlgTimer ??= this.add.text(0, 0, '', { ...FONT, fontSize: '9px' }).setOrigin(1, 0).setScrollFactor(0).setDepth(9502);
        this.dlgTimer.setText(`⏱ ${left}s`).setColor(left <= 5 ? '#d65db1' : '#9aa3c7').setVisible(true);
        this._choiceTick ??= this.time.addEvent({ delay: 250, loop: true, callback: () => { if (this.dlg?.choices.some((c) => c.timeout)) this._drawDialogue(); } });
      } else this.dlgWho.setText('');
      this.dlgPortrait.setVisible(false); this.dlgPortraitBg.setVisible(false); this.dlgInitial.setText('');
      this.dlgText.setText('');
      this.dlgChoices.forEach((t, i) => t.setText(choices[i] ? `${i + 1}. ${choices[i].text.replace(/\*/g, '')}` : '').setVisible(!!choices[i]));
    } else {
      const line = d.line;
      this.dlgWho.setText(line?.who ? line.who.toUpperCase() : '').setColor('#ffb347');
      this.dlgText.setColor(line && !line.who ? '#9aa3c7' : '#e8e8f0');
      if (line && line !== this._lastLine) {
        this._lastLine = line; this._lineAt = this.time.now;
        if (line.sms) {   // a text message: buzz, and keep it on the phone
          sfx('pickup');
          const texts = (this.save.world.phone ??= { texts: [] }).texts;
          if (!texts.some((t) => t.text === line.text)) texts.push({ from: 'John Pork', text: line.text, at: new Date().toISOString() });
        } else if (line.who && !(this.dlgVoiced && speak(line.who, line.text))) babble(line.who, line.text);
        this._typeFull = (line.text ?? '').replace(/\*([^*]+)\*/g, '$1'); this._typeShown = 0;
        this._setPortrait(line.who);
      }
      this.dlgText.setText((this._typeFull ?? '').slice(0, Math.floor(this._typeShown ?? 0)));
      this.dlgChoices.forEach((t) => t.setVisible(false));
    }
    this._layoutDialogue(choices.length > 0);
  }

  // The box grows upward to fit its content (measured against the FULL line, so the typewriter
  // never spills out), and choices stack inside it.
  _layoutDialogue(isChoices) {
    const W = VIEW.w, H = VIEW.h, bottom = H - 6;
    let h;
    if (isChoices) {
      h = 14 + this.dlgChoices.filter((t) => t.visible).reduce((sum, t) => sum + t.height + 3, 0);
    } else {
      this.dlgMeasure.setText(this._typeFull ?? '');
      h = 24 + this.dlgMeasure.height;
    }
    h = Math.max(60, Math.min(H - 40, Math.ceil(h)));
    const top = bottom - h;
    this.dlgBg.setSize(W - 40, h).setPosition(W / 2, top + h / 2);
    this.dlgBg.geom.setSize?.(W - 40, h); this.dlgBg.updateDisplayOrigin?.();
    this.dlgWho.setY(top + 6);
    this.dlgTimer?.setPosition(W - 30, top + 6);
    this.dlgText.setY(top + 17);
    let y = top + 7;
    for (const t of this.dlgChoices) { if (!t.visible) continue; t.setY(y); y += t.height + 3; }
    const py = top + 30;
    this.dlgPortraitBg.setY(py); this.dlgPortrait.setY(py); this.dlgInitial.setY(py);
  }

  // Story beats keyed to places (Act 1 MVP wiring; see docs/act1/DESIGN.md).
  _onEnterMap(map) {
    const once = (flag, fn) => { if (!this.save.flags[flag]) { this.save.flags[flag] = true; fn(); } };
    if (map.id === 'room631' && this.mode !== 'client') this.time.delayedCall(4000, () => this._maybeButtDial());
    if (map.id === 'aster_hall') once('act1.beat.asterEnter', () => this.startDialogue('aster'));
    if (map.id === 'tunnel_1') once('act1.beat.call', () => this._hackCall(() => this.startDialogue('the_call')));
    // A roommate says something on the way in.
    if (BARKS.enter[map.id]) this.time.delayedCall(1400, () => { const snap = this._lastRendered; const ps = (snap?.players ?? []).filter((p) => !p.dn); const p = ps[Math.floor(Math.random() * ps.length)]; if (p && this.map.id === map.id) this._bark(p.id, pickBark(BARKS.enter[map.id], p.c)); });
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
        if (msg.t === 'item' && this.save.party[msg.who] && ITEMS[`item.${msg.item}`]) { Inv.add(this.save.party[msg.who], `item.${msg.item}`, Math.min(99, msg.n | 0 || 1)); this._syncParty(); }
        if (msg.t === 'standing' && msg.faction in this.save.standing) this.save.standing[msg.faction] += Number(msg.n) || 0;
        if (msg.t === 'exit') this._tryExit(this.sim.map.objects.find((o) => o.id === msg.obj));
        if (msg.t === 'answer') this._answer();
        if (msg.t === 'door') this._toggleDoor(msg.id);
        if (msg.t === 'craft') this._craft(this._charOf(peer), msg.idx);
        if (msg.t === 'skill') this._learn(this._charOf(peer), msg.id);
        if (msg.t === 'equip') this._equip(this._charOf(peer), msg.id);
        if (msg.t === 'mate') this._mateBreak();
        if (msg.t === 'use') { this._useWhat = msg.id ?? null; this._use(this._charOf(peer), peer); }
        if (msg.t === 'morph') this._morph(peer);
        if (msg.t === 'useSlot') { this._useSlot = msg.i | 0; this._use(this._charOf(peer), peer); }
        if (msg.t === 'move' && this.save.party[this._charOf(peer)]) { Inv.moveSlot(this.save.party[this._charOf(peer)], msg.a | 0, msg.b | 0, !!msg.half); this._syncParty(); }
        if (msg.t === 'buy') this._buy(this._charOf(peer), msg.shop, msg.idx);
        if (msg.t === 'scooter') this._scooter(peer);
      });
      this.net.on('leave', (peer) => {
        // A roommate who drops out keeps walking with the party as a companion.
        const p = this.sim.players.get(peer); this.sim.removePlayer(peer);
        if (p) { this.sim.addPlayer(`ai:${p.character}`, p.character); const a = this.sim.players.get(`ai:${p.character}`); Object.assign(a, { x: p.x, y: p.y, hp: p.hp }); this.sim.setMods(a.id, playerMods(this.save.party[p.character], p.character)); }
      });
      this.time.addEvent({ delay: 50, loop: true, callback: () => this.net.broadcast({ t: 'snap', snap: this._lastSnap ?? this.sim.snapshot() }) });
    } else if (this.mode === 'client') {
      this.net.on('msg', (msg) => {
        if (msg.t === 'snap') { this.snapBuf.push({ at: performance.now(), snap: msg.snap }); if (this.snapBuf.length > 20) this.snapBuf.shift(); }
        if (msg.t === 'say') this._say(msg.text);
        if (msg.t === 'party') { this.save.party = msg.party; this.save.world.money = msg.money; this._refreshMenu(); }
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
    this.propSprites = []; this.propTimers = []; this.propById = {};
    const props = this.textures.exists('props') ? this.textures.get('props') : null;
    for (const s of this.doorVis ?? []) s.vis.destroy();
    this.doorVis = [];
    for (const o of map.objects) {
      const art = o.art ?? o.id;   // several objects can share one drawing
      if (o.door) {
        // Fable's door art when present (frames '<id>' and '<id>#open'); drawn placeholder otherwise.
        const artKey = o.art ?? o.id;
        // Doors sit inside their wall tile: 24px-tall art is fitted to the 16px tile so it never
        // pokes above the wall into the room behind.
        // Proper in-wall door art lives in the 16x16 'doors' sheet; older 24px prop art is squashed to fit.
        const sheet = this.textures.exists('doors') && this.textures.get('doors').has(artKey) ? 'doors' : props?.has(artKey) ? 'props' : null;
        const art = sheet ? this.add.image(o.x * TILE, o.y * TILE + TILE, sheet, artKey).setOrigin(0, 1).setDepth(o.y * TILE + TILE - 4) : null;
        if (art && art.height > TILE) art.setDisplaySize(TILE, TILE);
        const vis = art ?? this.add.graphics().setDepth(o.y * TILE + TILE - 4);
        this.doorVis.push({ o, vis, art: !!art, sheet, drawn: null });
        continue;
      }
      if (this.textures.exists('wide') && this.textures.get('wide').has(art)) {
        // Wall piece: 32x16, covering this wall tile and the one to its right.
        this.propSprites.push(this.add.image(o.x * TILE, o.y * TILE + TILE + 7, 'wide', art).setOrigin(0, 1).setDepth(o.y * TILE + TILE + 2));
        continue;
      }
      if (this.textures.exists('big') && this.textures.get('big').has(art)) {
        // Big piece: 32x40, centred on its tile and standing on the tile's bottom edge.
        const bim = this.add.image(o.x * TILE + TILE / 2, o.y * TILE + TILE, 'big', art).setOrigin(0.5, 1).setDepth(o.y * TILE + TILE - 4);
        this.propSprites.push(bim); this.propById[o.id] = { im: bim, sheet: 'big', art };
        continue;
      }
      if (props?.has(art)) {
        // Hand-drawn prop: 16x24, standing on its tile. A "#1" frame means a slow two-frame loop.
        const im = this.add.image(o.x * TILE, o.y * TILE + TILE, 'props', art).setOrigin(0, 1).setDepth(o.y * TILE + TILE - 4);
        if (props.has(`${art}#1`)) this.propTimers.push(this.time.addEvent({ delay: 420, loop: true, callback: () => im.active && im.setFrame(im.frame.name === art ? `${art}#1` : art) }));
        this.propSprites.push(im); this.propById[o.id] = { im, sheet: 'props', art };
        continue;
      }
      const warm = o.id === 'obj.printer_3' || o.id === 'obj.mate';
      const color = o.npc ? 0x8a8f6a : o.action === 'exit' ? 0xffb347 : o.id.includes('statue') || o.id.includes('flag') ? 0xf2a6b8 : warm ? 0xd98a4a : 0x6d7899;
      g.fillStyle(0x000000, 0.35).fillRect(o.x * TILE + 3, o.y * TILE + 12, TILE - 6, 3);
      g.fillStyle(color, o.action === 'exit' ? 0.55 : 1).fillRect(o.x * TILE + 3, o.y * TILE + 2, TILE - 6, TILE - 6);
      g.fillStyle(0xffffff, 0.18).fillRect(o.x * TILE + 3, o.y * TILE + 2, TILE - 6, 2);
    }
    this._refreshPuzzleProps();
    this.crowd?.destroy();
    this.crowd = new Crowd(this, map, this.save.world.seed);
    this._setupLighting(map);
    (this.neon ??= new Neon(this)).build(map);
    // Fill the screen: small/short maps get a bigger whole-number zoom (pixel-perfect), so play
    // isn't a thin strip in the middle. Base is 4 (a 480x270 view); up to 7.
    const SW = VIEW.w * VIEW.zoom, SH = VIEW.h * VIEW.zoom;
    const fit = Math.floor(SH / (map.h * TILE));   // height decides; the camera follows sideways
    this.worldZoom = Math.max(VIEW.zoom, Math.min(7, fit));
    this.cameras.main.setZoom(this.worldZoom);
    const mw = map.w * TILE, mh = map.h * TILE, vw = SW / this.worldZoom, vh = SH / this.worldZoom;
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
    // The ending script branches on these; nothing else sets them. Warm = the party picked up the
    // first time the phone rang (script note: any decline makes Pork cold, including the Sahur route).
    if (this.mode !== 'client') {
      const f = this.save.flags;
      this._flag('act1.boss.sahur', f['act1.boss.kind'] === 'sahur');
      this._flag('act1.ending.warm', !!f['act1.call.answered'] && !Number(f['act1.call.declines'] || 0));
      if (f['q.van.seen']) this._flag('act1.leadA.vanSeen', true);
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
    if (this.mode === 'host') this.net.broadcast({ t: 'party', party: this.save.party, money: this.save.world.money });
    this._refreshMenu();
  }

  _craft(who, idx) {
    const r = RECIPES[idx], c = this.save.party[who];
    if (!r || !c) return;
    if (!Inv.pay(c, r.cost)) return this._announce('Not enough materials for that.');
    const item = ITEMS[r.item];
    Inv.add(c, r.item);
    if (item.slot !== 'consumable' && !c.equipped[item.slot]) c.equipped[item.slot] = r.item;
    this._announce(`The fab hums. ${who} gets: ${item.name}.`);
    this._syncParty();
  }

  _learn(who, id) {
    const c = this.save.party[who], s = skillNode(who, id);
    if (!c || !s || c.skillPoints < 1 || (c.skills[id] ?? 0) >= s.max || !skillOpen(who, c, s)) return;
    c.skillPoints--; c.skills[id] = (c.skills[id] ?? 0) + 1;
    this._syncParty();
  }

  _use(who, peerId) {
    const c = this.save.party[who]; if (!c) return;
    // _useSlot: a hotbar slot index; _useWhat: an item id; neither: H eats the first food found.
    let i = this._useSlot ?? c.inventory.findIndex((x) => x && x.id === (this._useWhat ?? 'item.mate_flask'));
    if (i < 0 && !this._useWhat) i = c.inventory.findIndex((x) => x && ITEMS[x.id]?.heal);
    this._useWhat = null; this._useSlot = null;
    if (i < 0 || !c.inventory[i] || !ITEMS[c.inventory[i].id]?.heal) return;
    const it = ITEMS[Inv.takeSlot(c, i)];
    this.sim.heal(peerId, it.heal ?? 0);
    this._toast(`${who} has the ${it.name.toLowerCase()}. +${it.heal} HP`);
    this._syncParty();
  }

  // ---------- in-game menu (src/game/ui/GameMenu.js) ----------
  get menu() { return this.gameMenu?.tab ?? (this.puzzle && !this.puzzle.closed ? 'puzzle' : null); }
  _makeMenu() {
    this.gameMenu = new GameMenu(this);
    const kb = this.input.keyboard;
    kb.on('keydown-ESC', () => { if (this.dlg) return; if (this.gameMenu?.held != null) { this.gameMenu.held = null; this.gameMenu.refresh(); return; } if (this.puzzle && !this.puzzle.closed) { this.puzzle.destroy(); this.puzzle = null; return; } this.menu ? this._closeMenu() : this.gameMenu.show('inventory'); });
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
    if (def.slot === 'junk') return this._say(`${def.name}\n${def.text}`);
    if (def.slot === 'consumable') { if (this.mode === 'client') this.net.send({ t: 'use', id }); else { this._useWhat = id; this._use(this.character, this.localId); } return; }
    if (this.mode === 'client') this.net.send({ t: 'equip', id }); else this._equip(this.character, id);
  }
  // Slot actions (inventory grid + hotbar). Host-authoritative like everything else.
  menuUseSlot(i) {
    const c = this.save.party[this.character], it = c?.inventory[i]; if (!it) return;
    this._hotFlash = { i, at: this.time.now };
    const def = ITEMS[it.id]; if (!def) return;
    if (def.slot === 'consumable') {
      if (this.mode === 'client') this.net.send({ t: 'useSlot', i }); else { this._useSlot = i; this._use(this.character, this.localId); }
      return;
    }
    if (['weapon', 'ranged', 'armor', 'gadget', 'charm'].includes(def.slot)) return this.menuUse(it.id);
    if (def.slot === 'junk' || def.slot === 'key') this._say(`${def.name}\n${def.text}`);
  }
  menuMove(a, b, half) { if (this.mode === 'client') this.net.send({ t: 'move', a, b, half }); else { Inv.moveSlot(this.save.party[this.character], a, b, half); this._syncParty(); } }
  // Manuel's Haggler's Eye: the best haggler in the party gets everyone the discount.
  priceFor(who, base) { const h = Math.max(0, ...Object.entries(this.save.party).map(([k, c]) => playerMods(c, k).haggle ?? 0)); return Math.max(1, Math.round(base * (1 - h))); }
  menuBuy(shop, idx) { if (this.mode === 'client') this.net.send({ t: 'buy', shop, idx }); else this._buy(this.character, shop, idx); }
  _buy(who, shopId, idx) {
    const st = SHOPS[shopId]?.stock[idx], c = this.save.party[who]; if (!st || !c) return;
    if (st.once && Inv.has(c, st.item)) return;
    if (st.needs && !Inv.has(c, st.needs)) return;
    const price = this.priceFor(who, st.price);
    if ((this.save.world.money ?? 0) < price) return;
    if (Inv.add(c, st.item) > 0) return this._toast('Your bag is full.');
    this.save.world.money -= price;
    sfx('pickup'); this._toast(`Bought: ${ITEMS[st.item].name} (-$${price})`);
    this._syncParty();
  }
  menuLearn(id) { if (this.mode === 'client') this.net.send({ t: 'skill', id }); else this._learn(this.character, id); }
  menuCraft(i) { if (this.mode === 'client') this.net.send({ t: 'craft', idx: i }); else this._craft(this.character, i); }
  menuExport() { exportFile(this.save); }
  menuQuit(save) { const quit = () => { this.net?.close?.(); this.scene.start('Title'); }; save && this.mode !== 'client' ? autosave(this.save).then(quit) : quit(); }
  mapName(id) { return MAPS[id]?.name ?? id; }
  playerWorldTile() {
    const me = this.mode === 'client' ? this._lastRendered?.players.find((p) => p.id === this.localId) : this.sim.players.get(this.localId);
    const wp = worldPos(this.map);
    return { x: wp.x + (me ? me.x / TILE : this.map.w / 2), y: wp.y + (me ? me.y / TILE : this.map.h / 2) };
  }

  _equip(who, id) {
    const c = this.save.party[who], def = ITEMS[id];
    if (!c || !def || !Inv.has(c, id) || !['weapon', 'ranged', 'armor', 'gadget', 'charm'].includes(def.slot)) return;
    c.equipped[def.slot] = c.equipped[def.slot] === id ? null : id;   // click again to unequip
    this._syncParty();
  }

  _scooter(peerId) {
    const p = this.sim.players.get(peerId); if (!p) return;
    const c = this.save.party[p.character];
    if (!p.riding && !Inv.has(c, 'item.scooter')) return;   // you have to buy one first (Delroy's, on the plaza)
    p.battery = c.scooterBattery ??= 100;
    p.hicap = Inv.has(c, 'item.scooter_hicap');
    if (!p.riding && !this.map.outdoor) return this._toast('No scooters indoors.');
    if (!p.riding && p.battery <= 0) return this._toast('Scooter battery is dead. Charge it at the dock in 631.');
    this.sim.toggleScooter(peerId, true);
  }

  _morph(peerId) {
    const p = this.sim.players.get(peerId); if (!p) return;
    const stage = this.save.party[p.character]?.morph.stage ?? 0;
    if (stage < 1) return;   // nothing until it's unlocked (human request: no 'not yet' message)
    this.sim.toggleMorph(peerId, true);
  }

  // John Pork "shows up here and there" (brief): a screen you walk past glitches to his face for a
  // few frames. Rare (a check every ~1.5 s at 5%, at most once a minute), never in dialogue or combat.
  _tickGlimpse() {
    if (this.dlg || this.menu || this._transitioning) return;
    if ((this._glT = (this._glT ?? 0) + 1) % 90) return;
    if (this.time.now - (this._glAt ?? -1e9) < 60000 || Math.random() > 0.05) return;
    const me = this._lastRendered?.players.find((p) => p.id === this.localId); if (!me) return;
    if ((this._lastRendered.enemies ?? []).some((e) => Math.hypot(e.x - me.x, e.y - me.y) < 160)) return;
    const SCREENS = ['obj.tv', 'obj.lobby_monitor', 'obj.billboard', 'obj.kiosk', 'obj.trevor_pc', 'obj.payphone'];
    const scr = this.map.objects.filter((o) => SCREENS.includes(o.art ?? o.id)).find((o) => Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y) < 80);
    if (!scr) return;
    this._glAt = this.time.now;
    const x = scr.x * TILE + 8, y = scr.y * TILE + 4, d = scr.y * TILE + 40;
    const face = this.add.image(x, y, 'principals', 'pork_0').setDisplaySize(10, 13).setDepth(d).setAlpha(0.9);
    const flash = this.add.rectangle(x, y, 14, 12, 0xe87a9c, 0.35).setDepth(d + 1).setBlendMode('ADD');
    sfx('hit');
    let n = 0;
    this.time.addEvent({ delay: 60, repeat: 5, callback: () => { n++; face.setVisible(n % 2 === 0 || n > 3).setX(x + (Math.random() * 2 - 1)); flash.setAlpha(n > 3 ? 0 : 0.35); } });
    this.time.delayedCall(420, () => { face.destroy(); flash.destroy(); });
    if (!this.save.flags['seen.porkGlimpse']) { this.save.flags['seen.porkGlimpse'] = true; this.time.delayedCall(500, () => this._bark?.(this.localId, ['Did that screen just...', 'Was that him?', 'Anyone else see that?'][Math.floor(Math.random() * 3)])); }
  }

  // Continuity, in play: a patrol drone's searchlight that passes over you scans you. Nothing
  // happens. That's the point. (A cold flash, a tag over your head, one line from the city.)
  _tickScan() {
    if (this.dlg || this.menu || !this.neon) return;
    const me = this._lastRendered?.players.find((p) => p.id === this.localId); if (!me) return;
    if (this.time.now - (this._scanAt ?? -1e9) < 25000) return;
    const hit = this.neon.lightPoints().find((p) => Math.hypot(p.x - me.x, p.y - (me.y - 6)) < 10);
    if (!hit) return;
    this._scanAt = this.time.now;
    const n = (this.save.world.scans = (this.save.world.scans ?? 0) + 1);
    this.cameras.main.flash(120, 150, 210, 255);
    const tag = this.add.text(me.x, me.y - 30, 'SCANNED', { ...FONT, fontSize: '6px', color: '#bfe8ff' }).setOrigin(0.5).setDepth(6200);
    this.tweens.add({ targets: tag, y: tag.y - 8, alpha: 0, delay: 600, duration: 900, onComplete: () => tag.destroy() });
    const LINES = ['CONTINUITY: Citizen, things are stable.', 'CONTINUITY: Identity confirmed. Enjoy your evening.', 'CONTINUITY: Thank you for being where we expected.',
      'CONTINUITY: Resident of ASTER 631. Noted.', 'CONTINUITY: Please do not look directly at the light.', 'CONTINUITY: Your curfew is a suggestion. For now.'];
    this._toast(LINES[(n - 1) % LINES.length]);
  }

  // ---------- quests (src/content/quests.js) ----------
  _questInteract(near) {
    const f = this.save.flags, qs = questState(this.save);
    for (const q of QUESTS) {
      const st = qs[q.id];
      if (st.done) continue;
      if (q.inspect && near.id === q.inspect.obj && st.started && !f[q.inspect.flag]) {
        this._flag(q.inspect.flag, true); this._say(`${near.text ?? near.label}\n\n${q.inspect.text ?? ''}`); this._tickQuests(true); return true;
      }
      if (q.giver !== near.id) continue;
      const who = near.label.toUpperCase();
      if (!st.started && q.ask) { this._flag(q.ask, true); this._say(`${who}\n${q.pitch}`); this._tickQuests(true); return true; }
      if (q.give && !f[q.give.flag]) {
        const c = this.save.party[this.character];
        if (!Inv.remove(c, q.give.item)) { this._say(`${who}\n${q.give.refuse ?? '...'}`); return true; } this._flag(q.give.flag, true); this._syncParty(); this._tickQuests(true); return true;
      }
      if (q.report && f[q.report.needs] && !f[q.report.flag]) { this._flag(q.report.flag, true); this._tickQuests(true); return true; }
    }
    return false;
  }

  _tickQuests(force = false) {
    if (!force && (this._qT = (this._qT ?? 0) + 1) % 60) return;
    const f = this.save.flags, qs = questState(this.save);
    for (const q of QUESTS) {
      const st = qs[q.id];
      if (st.done) continue;
      if (!st.started && q.start?.(f)) { st.started = true; this._toast(`New quest: ${q.title}`); }
      if (!st.started) continue;
      while (st.stage < q.stages.length && q.stages[st.stage].done(f, this.save)) {
        st.stage++;
        if (st.stage < q.stages.length) this._toast(`${q.title}: ${q.stages[st.stage].text}`);
      }
      if (st.stage >= q.stages.length) {
        st.done = true;
        if (this.mode !== 'client') { this.save.world.money = (this.save.world.money ?? 0) + (q.reward?.money ?? 0); for (const c of Object.values(this.save.party)) c.xp += q.reward?.xp ?? 0; if (q.reward?.item) Inv.add(this.save.party[this.character], q.reward.item); this._partyDirty = true; }
        this._toast(`✓ Quest complete: ${q.title}`);
        if (q.reward?.line) this._say(q.reward.line);
      }
    }
  }

  // ---------- fishing ----------
  _nearWater(me) {
    const cx = Math.floor(me.x / TILE), cy = Math.floor(me.y / TILE);
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [2, 0], [-2, 0]])
      if (this.map.layout[cy + dy]?.[cx + dx] === '~') return { x: (cx + dx) * TILE + 8, y: (cy + dy) * TILE + 8 };
    return null;
  }

  _startFishing(me) {
    if (this.fishing) return;
    const spot = this._nearWater(me);
    const bob = this.add.circle(spot.x, spot.y, 2, 0xf2f2f2).setDepth(spot.y + 1).setStrokeStyle(1, 0xd65db1);
    const line = this.add.graphics().setDepth(spot.y);
    line.lineStyle(1, 0xc8c0b0, 0.7).lineBetween(me.x, me.y - 14, spot.x, spot.y);
    const bite = this.time.now + 1500 + Math.random() * 3500;
    this.fishing = { bob, line, bite, window: bite + 650, spot };
    this._toast('Cast. Wait for the bite… [E] to reel when it dips');
    if (this.mode !== 'client') this.time.delayedCall(9000, () => { if (!this.fishing) this._maybeButtDial(); });
    sfx('swing');
  }

  _tickFishing() {
    const f = this.fishing; if (!f) return;
    const now = this.time.now;
    f.bob.setY(f.spot.y + Math.sin(now / 300) * 0.8 + (now > f.bite && now < f.window ? 2 : 0));
    if (now > f.bite && !f.alerted) { f.alerted = true; f.mark = this.add.text(f.spot.x, f.spot.y - 10, '!', { heading: true, fontSize: '10px', color: '#ffb347' }).setOrigin(0.5).setDepth(6000); sfx('hit'); }
    if (now > f.window) this._endFishing(false);
  }

  _reel() {
    const f = this.fishing; if (!f) return false;
    const now = this.time.now;
    this._endFishing(now > f.bite && now <= f.window);
    return true;
  }

  _endFishing(caught) {
    const f = this.fishing; this.fishing = null;
    f.bob.destroy(); f.line.destroy(); f.mark?.destroy();
    if (!caught) return this._toast(f.alerted ? 'It got away.' : 'Too early. Nothing on the line.');
    const id = rollCatch(this.map.id), def = ITEMS[id];
    const log = (this.save.world.fishLog ??= {}); const first = !log[id]; log[id] = (log[id] ?? 0) + 1;
    this._grant(id);
    this._say(`${def.name}${first ? '  (new in your fishing log)' : ''}\n${def.text}`);
  }

  // Hidden mechanic (fun): kick the vending machine. Sometimes it pays. Keep kicking and it talks back.
  // Hard optional: wind the four stuck clocks to the paper clock's time.
  _windClock(o) {
    const key = `puz.clock.${o.id}`, n = ((this.save.flags[key] ?? 0) + 1) % CLOCK_TIMES.length;
    this._flag(key, n); sfx('swing');
    const now = clockTime(this.save.flags, o.id);
    const note = o.id === 'obj.plaza_clock' ? PAPER_CLOCK_NOTE : '';
    if (clocksSolved(this.save.flags) && !this.save.flags['puz.clocks.solved']) {
      this._flag('puz.clocks.solved', true);
      this._grant('item.charm_1901'); this._refreshPuzzleProps();
      this.cameras.main.shake(400, 0.006);
      return this._say(`You wind it to ${now}. Somewhere in ASTER, four clocks tick at once. When you're back on the sixth floor, the hallway clock's face is hanging open on a hinge. Inside, a brass clock hand on a cord. (Rollover charm)`);
    }
    this._say(`You open the face and wind it. It now reads ${now}.${note}`);
  }

  // Hard optional: turn Manuel's busts to face the flag, in the right order.
  _turnBust(o) {
    if (this.save.flags['puz.busts.solved']) return this._say(o.text + '\n\nAll three are looking at the flag. You don\'t want to turn them back.');
    const seq = (this.save.flags['puz.busts.seq'] ?? '').split(',').filter(Boolean);
    const expected = BUST_ORDER[seq.length];
    if (o.id !== expected) { this._flag('puz.busts.seq', ''); this._bustsFacing = {}; this._refreshPuzzleProps(); sfx('hit'); return this._say('You turn it toward the flag. Then the others turn back to the door on their own. Or you misremembered which way they faced.'); }
    seq.push(o.id); this._flag('puz.busts.seq', seq.join(',')); this._refreshPuzzleProps();
    (this._bustsFacing ??= {})[o.id] = true;
    sfx('swing');
    if (seq.length === BUST_ORDER.length) {
      this._flag('puz.busts.solved', true);
      this._grant('item.pork_pin');
      this.cameras.main.flash(300, 242, 166, 184);
      return this._say('The third bust turns to face the flag. For a second the whole room feels like it\'s being looked at, from three directions, kindly. Something small and porcelain is lying on the floor that wasn\'t there before. (Porcelain Pork pin)');
    }
    this._say(`You turn it to face the flag. (${seq.length} of 3)`);
  }

  // Puzzle state shows in the art: busts turned toward the flag, the hallway clock face swung open.
  _refreshPuzzleProps() {
    const f = this.save.flags, seq = (f['puz.busts.seq'] ?? '').split(',');
    const set = (id, on, suffix) => {
      const p = this.propById?.[id]; if (!p) return;
      const want = on && this.textures.get(p.sheet).has(`${p.art}${suffix}`) ? `${p.art}${suffix}` : p.art;
      if (p.im.frame.name !== want) p.im.setFrame(want);
    };
    for (const id of BUST_ORDER) set(id, !!f['puz.busts.solved'] || seq.includes(id), '#flag');
    set('obj.clock_6f', !!f['puz.clocks.solved'], '#open');
  }

  // Loot pop over the world (money and materials from a kill).
  _fxPop(x, y, text) {
    const t = this.add.text(x, y - 22, text, { ...FONT, fontSize: '7px', color: '#9be08a' }).setOrigin(0.5).setDepth(6050);
    this.tweens.add({ targets: t, y: t.y - 14, alpha: 0, delay: 250, duration: 1100, onComplete: () => t.destroy() });
  }

  _grant(itemId) {
    const c = this.save.party[this.character];
    Inv.add(c, itemId);
    if (this.mode === 'client') this.net.send({ t: 'item', who: this.character, item: itemId.replace(/^item\./, '') });
    else this._syncParty();
    this._toast(`★ ${ITEMS[itemId]?.name ?? itemId}`);
  }

  _kickVending(o) {
    const n = (this._kicks = (this._kicks ?? 0) + 1);
    sfx('hit'); this.cameras.main.shake(90, 0.004);
    if (n === 7 && !this.save.flags['secrets.vending.found']) {
      this._flag('secrets.vending.found', true); this._toast('★ Secret: the machine remembers you');
      return this._say('You kick it a seventh time. The display flickers, and for a second it reads, in perfect letters: "PLEASE STOP. I WAS A CHILDREN\'S TOY ONCE."\nThen: ROW C EMPTY.');
    }
    const r = Math.random();
    if (r < 0.33) {
      if (this.mode !== 'client') { const c = this.save.party[this.character]; Inv.add(c, 'item.mat_wire'); Inv.add(c, 'item.mat_scrap'); this.save.world.money += 1; this._partyDirty = true; }
      return this._say('You kick it. Something rattles loose: a bent coil, a bracket, and a coin. (+copper wire, +scrap metal, +$1)');
    }
    if (r < 0.45) {
      if (this.mode !== 'client') { Inv.add(this.save.party[this.character], 'item.mate_flask'); this._partyDirty = true; }
      return this._say('You kick it. A can drops out. It\'s cold yerba mate, which this machine has never stocked. (Mate thermos)');
    }
    this._say(['You kick it. It hums at you, offended.', 'You kick it. Nothing. Row C stays empty.', 'You kick it. A light comes on inside, then thinks better of it.'][n % 3]);
  }

  // Hidden mechanic (progression): the shrimp are a canary. Their behaviour tells you how rotted the next place is.
  _shrimpReading() {
    const f = this.save.flags, killed = new Set(this.save.world.killed || []);
    const tunnelLeft = (MAPS.tunnel_1?.enemies || []).filter((_, i) => !killed.has(`tunnel_1#${i}`)).length;
    if (f['act1.complete']) return 'The shrimp are spread out again, grazing. Whatever was in the water has eased.';
    if (!f['act1.beat.call']) return 'They\'re clustered in the corner away from the window, very still. Trevor says they do that before a coderot spike. Something under the street is bad.';
    if (tunnelLeft > 6) return `They won't come out of the plants. (The tunnels are still crawling: about ${tunnelLeft} coderot things down there.)`;
    if (tunnelLeft > 0) return `A couple of them are moving again. (Fewer coderot things under the street now: about ${tunnelLeft}.)`;
    return 'They\'re out and grazing. The tunnels are quiet.';
  }

  _lever(k) {
    const key = `act1.switch.${k}`, now = (this.save.flags[key] ?? 'left') === 'left' ? 'right' : 'left';
    this._flag(key, now); sfx('hit'); this.cameras.main.shake(80, 0.003);
    this._toast(`Lever ${k.toUpperCase()}: ${now.toUpperCase()}`);
    const sol = yardSolution(this.save.world.seed);
    const solved = LEVERS.every((x) => (this.save.flags[`act1.switch.${x}`] ?? 'left') === sol[x]);
    if (solved && !this.save.flags['act1.switchyard.solved']) {
      this._flag('act1.switchyard.solved', true);
      this.cameras.main.shake(500, 0.01); sfx('kill');
      this._say('Somewhere east, something heavy unlocks and rolls. The lines agree now. The gate to the platform is open.');
    }
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
      'CHANNEL 7 · CONTINUITY NEWS\n"Citizens, things are stable." Coderot abatement completes ahead of schedule in Hyattsville. Residents may return Thursday.',
      'CHANNEL 7 · "A coderot outbreak at Baltimore\'s Inner Harbor has been contained, officials say. The harbor will remain closed." Footage shows a crane folding in half, slowly.',
      'CHANNEL 7 · The Analog Union has closed its borders to "unattested data." Flights to Lisbon now require a paper ticket.',
      'CHANNEL 7 · Helium convoy attacked in the Gulf. Continuity reminds citizens that hoarding helium is a federal offense.',
      'CHANNEL 7 · Purple Line opening date: SOON. A reporter laughs and the feed cuts.',
      'CHANNEL 7 · Static, then two seconds of someone very familiar saying "hey—" before the channel corrects itself.',
      'CHANNEL 7 · "Tonight marks twenty-seven years since the incident of 2071." The likeness is not shown. The anchor describes it instead, from memory, for some time, and has to be stopped.',
      'ARCHIVE HOUR · A lecture hall, decades old. A woman at a lectern: "We did not build a personality. We built a mind and asked it to pick one. I want to be clear about who picked." The feed is withdrawn for stability.',
      'CHANNEL 7 · Interdiction confirms the entity "has not been observed in a body since the eighties." A man in the background of the shot, in a long coat, waits for the light to change and crosses.',
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
      if (c && !Inv.has(c, 'item.mate_flask')) Inv.add(c, 'item.mate_flask');
    }
    this._syncParty();
  }

  _answer() {
    if (this.sim.answerSahur()) {
      this.save.flags['act1.call.answered'] = true;
      this.save.flags['act1.boss.defeated'] = true;
      this._announce('You answer. The drumming stops mid-beat. The tall wooden figure tilts its head, listening to something only it can hear, and walks back into the dark.');
      // The sim clears its event list at the start of every step, so the 'kill' event answerSahur()
      // pushes from this key handler never reaches _fx. Start the ending from here instead.
      if (!this._endingPlayed) { this._endingPlayed = true; this.time.delayedCall(2600, () => { this._closeSay(); this._playEnding(true); }); }
    }
  }

  // Semi-dark lighting: a dark layer with light pools around players and lit objects.
  _setupLighting(map) {
    const DARK = { room631: 0.35, aster_hall: 0.45, metro_plaza: 0.4, tunnel_1: 0.7, platform: 0.62 };
    this.darkness = DARK[map.id] ?? 0.4;
    this.lights?.destroy();
    const W = VIEW.w, H = VIEW.h;
    this.lights = this.add.renderTexture(0, 0, W, H).setOrigin(0, 0).setScrollFactor(0).setDepth(8000);
    // Light sources: anything with `light: <radius scale>` (lamps, neon, screens), plus NPCs, exits and a few named props.
    this.lightSpots = map.objects.filter((o) => o.light || o.npc || o.action === 'exit' || ['obj.printer_3', 'obj.mate', 'obj.pork_flag', 'obj.shrimp_tank', 'obj.billboard', 'obj.oscilloscope', 'obj.lobby_monitor'].includes(o.id));
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
    const kind = { metro_plaza: 'rain', lake: 'rain', tunnel_1: 'drip', platform: 'drip' }[this.map.id] ?? 'dust';
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
    const k = (this.worldZoom ?? VIEW.zoom) / VIEW.zoom;          // world px → light-layer px
    const L = (this._lightImg ??= this.make.image({ key: 'light', add: false }));
    const lit = (x, y, sc) => { L.setScale(sc * k); rt.erase(L, (x - cam.worldView.x) * k, (y - cam.worldView.y) * k); };
    for (const p of snap.players) lit(p.x, p.y - 8, 1.3);
    // Rot things glow faintly, so enemies read in the dark.
    for (const e of snap.enemies || []) lit(e.x, e.y - 8, e.boss ? 0.9 : 0.4);
    for (const o of this.lightSpots) lit(o.x * TILE + 8, o.y * TILE + 8, typeof o.light === 'number' ? o.light : 0.7);
    // Neon signs, holo ads and drone searchlights open the dark too (their colour is added by neon.js).
    for (const p of this.neon?.lightPoints() ?? []) lit(p.x, p.y, p.r);
    for (const sg of this.neon?.signs ?? []) if (sg.on) lit(sg.cx, sg.cy + 6, 0.55);
    for (const g of this.neon?.glows ?? []) lit(g.x, g.y, g.r * 0.7);
    // Rot shows up as rendering errors at the screen edges.
    if (this.rotEdge && Math.random() < 0.12) {
      const W = VIEW.w, H = VIEW.h, y = Math.random() * H, h = 2 + Math.random() * 6, left = Math.random() < 0.5;
      rt.fill(Math.random() < 0.5 ? 0x7fb069 : 0xd65db1, 0.35, left ? 0 : W - 40, y, 40, h);
    }
  }

  _tryExit(obj) {
    if (!obj || obj.action !== 'exit' || this._transitioning) return;
    if (obj.requiresClear && !this.sim.cleared) return this._announce('Something down here is still moving.');
    if (obj.requiresFlag && !this.save.flags[obj.requiresFlag]) return this._announce(obj.lockedText ?? 'It won\'t open.');
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
      this.enteredFrom = from;
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
    this._makeHotbar();
  }

  // Hotbar: inventory slots 1-9 along the bottom. Number keys use / equip them.
  _makeHotbar() {
    const W = VIEW.w, H = VIEW.h, S = 18, x0 = Math.round(W / 2 - (9 * S + 8 * 2) / 2), y0 = H - S - 4;
    this.hot = { g: this.add.graphics().setScrollFactor(0).setDepth(8990), icons: [], qty: [], nums: [], x0, y0, S, sig: '' };
    for (let i = 0; i < 9; i++) {
      const x = x0 + i * (S + 2);
      this.hot.icons.push(this.add.image(x + S / 2, y0 + S / 2, 'icons', 'generic').setScrollFactor(0).setDepth(8991).setVisible(false));
      this.hot.qty.push(this.add.text(x + S - 1, y0 + S, '', { ...FONT, fontSize: '6px', color: '#e8e8f0' }).setOrigin(1, 1).setScrollFactor(0).setDepth(8992));
      this.hot.nums.push(this.add.text(x + 2, y0 + 1, `${i + 1}`, { ...FONT, fontSize: '5px', color: '#5d6487' }).setScrollFactor(0).setDepth(8992));
    }
  }

  _drawHotbar() {
    const h = this.hot, c = this.save.party[this.character]; if (!h || !c?.inventory) return;
    const hide = !!(this.dlg || this.menu || this.box.visible);
    const flash = this._hotFlash && this.time.now - this._hotFlash.at < 220 ? this._hotFlash.i : -1;
    const sig = JSON.stringify([c.inventory.slice(0, 9), c.equipped, hide, flash]);
    if (sig === h.sig) return;
    h.sig = sig;
    h.g.clear(); h.g.setVisible(!hide);
    const eq = new Set(Object.values(c.equipped || {}));
    for (let i = 0; i < 9; i++) {
      const x = h.x0 + i * (h.S + 2), it = c.inventory[i];
      h.g.fillStyle(i === flash ? 0x3a3150 : 0x0b0d16, 0.85).fillRect(x, h.y0, h.S, h.S);
      h.g.lineStyle(1, it && eq.has(it.id) ? 0x7fb069 : 0x5d6487, 0.9).strokeRect(x + 0.5, h.y0 + 0.5, h.S - 1, h.S - 1);
      const tex = it && this.textures.get('icons').has(it.id) ? it.id : 'generic';
      h.icons[i].setFrame(tex).setVisible(!!it && !hide);
      h.qty[i].setText(it && it.qty > 1 ? `${it.qty}` : '').setVisible(!hide);
      h.nums[i].setVisible(!hide);
    }
  }

  // Small corner notice (saving etc.). Never a dialogue box.
  _toast(text) {
    // Sits above the say/dialogue box (the taller one covers the bottom 66px) and wraps so it clears the centred [E] prompt.
    this.toastText ??= this.add.text(VIEW.w - 6, VIEW.h - 70, '', { ...FONT, color: '#7fb069', align: 'right', wordWrap: { width: 176 } }).setOrigin(1, 1).setScrollFactor(0).setDepth(9300);
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
      if (this.menu !== 'puzzle' && !this.gameMenu.contains(sx, sy)) this._closeMenu();
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
        if (this.brain && !(this.dlg && this.mode === 'solo')) for (const [id, ai] of this.brain.inputs()) inputs.set(id, ai);
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
        if (exit?.requiresFlag && !this.save.flags[exit.requiresFlag]) { if (!this._lockedSaid || this.time.now - this._lockedSaid > 3000) { this._lockedSaid = this.time.now; this._toast(exit.lockedText ?? 'It won\'t open.'); } continue; }
        // Solo goes straight through. In co-op the party gathers at the door first.
        if ([...this.sim.players.keys()].filter((id) => !isAi(id)).length <= 1 || this.sim.waitAtExit(ev.by, ev.id, ev.dx, ev.dy)) { this.sim.clearWaiting(); this._tryExit(exit); }
      }
      if (ev.t === 'door' || ev.t === 'doorClose') sfx('swing');
      if (ev.t === 'grind' && ev.id === this.localId && !this.save.flags['secrets.grind.found']) { this._flag('secrets.grind.found', true); this._toast('★ Rail grind! (scooters fly along the tracks)'); }
      if (ev.t === 'scooter') {
        const p = this.sim.players.get(ev.id); if (p) this.save.party[p.character].scooterBattery = Math.round(p.battery ?? 100);
        if (ev.id === this.localId) this._toast(ev.dead ? 'Battery dead.' : ev.knocked ? 'Knocked off your scooter!' : ev.on ? 'On the scooter. [Q] to hop off' : 'Off the scooter.');
      }
      if (ev.t === 'kill') {
        if (ev.key && !this.save.world.killed.includes(ev.key)) this.save.world.killed.push(ev.key);
        // Drops: money to the shared wallet, a material to whoever landed the kill.
        const drop = ev.boss ? DROPS.boss : DROPS.default;
        const cash = drop.money[0] + Math.floor(Math.random() * (drop.money[1] - drop.money[0] + 1));
        this.save.world.money = (this.save.world.money ?? 0) + cash;
        const killer = this.sim.players.get(ev.by) ?? this.sim.players.get(this.localId), kc = killer && this.save.party[killer.character];
        if (killer?.mods?.lifesteal) this.sim.heal(killer.id, killer.mods.lifesteal);
        if (kc) {
          const got = [];
          if (!ev.boss && Math.random() < (killer.mods?.loot ?? 0)) { const id = drop.mats[Math.floor(Math.random() * drop.mats.length)][0]; Inv.add(kc, id); got.push(ITEMS[id].name); }
          if (ev.boss) for (const [id] of drop.mats) { Inv.add(kc, id, 2); got.push(ITEMS[id].name); }
          else if (Math.random() < 0.7) { const tot = drop.mats.reduce((t, [, w]) => t + w, 0); let r = Math.random() * tot; const id = drop.mats.find(([, w]) => (r -= w) < 0)?.[0] ?? drop.mats[0][0]; Inv.add(kc, id); got.push(ITEMS[id].name); }
          this._fxPop(ev.x, ev.y, `+$${cash}${got.length ? ' · ' + got.join(', ') : ''}`);
        }
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
    // Party wipe: a short beat, then everyone wakes at the start of this area (the entrance you came
    // in by). Dead enemies stay dead; survivors and bosses reset.
    if (this.sim.wiped && !this._wipeAt) { this._wipeAt = this.time.now + 1200; this.cameras.main.fadeOut(1000, 5, 6, 12); }
    if (this._wipeAt && this.time.now > this._wipeAt) {
      this._wipeAt = 0;
      this.sim.setMap(this.sim.map, this.enteredFrom ?? null);
      this.cameras.main.fadeIn(500, 5, 6, 12);
      this._toast('You come to at the start of the area.');
    }
  }

  // Pork's butt dial (the_call: butt_dial). Not a hack: an ordinary ringtone, ordinary caller ID.
  _maybeButtDial(force = false) {
    const f = this.save.flags;
    if (f['act1.call.buttDialDone'] || f['act1.beat.buttDial'] || f['act1.call.sahurSummoned']) return;
    if (!(f['act1.call.answered'] || Number(f['act1.call.declines'] || 0) >= 1)) return;
    if (this.dlg || this.menu || this._transitioning || this.time.now - (this._lastCallAt ?? -1e9) < 60000) return;
    const me = this.sim.players.get(this.localId);
    if (me && [...this.sim.enemies.values()].some((e) => Math.hypot(e.x - me.x, e.y - me.y) < 140)) return;
    if (!force && Math.random() > 1 / 3) return;
    f['act1.beat.buttDial'] = true;
    ring(2); this._toast('Phone: JOHN PORK');
    this.time.delayedCall(2600, () => this.startDialogue('the_call', 'butt_dial'));
  }

  _handleInteract(me) {
    if (this.dlg || this.menu) { this.hint.setText(''); return; }
    // John Pork calls back. If the party declined, he rings again deeper in the tunnels: once at the
    // switchyard, once on the approach. A third decline is what brings the Sahur (the_call script).
    if (this.map.id === 'tunnel_1' && this.mode !== 'client' && !this.save.flags['act1.call.answered']) {
      const declines = Number(this.save.flags['act1.call.declines'] || 0), tx = me.x / TILE;
      const ring = declines === 1 && tx > 33 ? 2 : declines === 2 && tx > 54 ? 3 : 0;
      if (ring && !this.save.flags[`act1.beat.ring${ring}`]) {
        this.save.flags[`act1.beat.ring${ring}`] = true;
        this._hackCall(() => this.startDialogue('the_call', `call_ring_${ring}`));
        return;
      }
    }
    if (this.mode !== 'client' && this.map.id === 'tunnel_1' && me.x / TILE > 40) this._maybeButtDial(true);
    const inReach = (o) => Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y) <= 34;
    let nearest = null, nd = 34;
    for (const o of this.map.objects) { const d = Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y); if (d <= nd) { nd = d; nearest = o; } }
    const person = !nearest ? this.crowd?.nearest(me.x, me.y) : null;
    const verb = (o) => (o.npc || o.talk && o.id.startsWith('npc.') ? `Talk to ${o.label}` : o.label);
    this.hint.setText(nearest ? `[E] ${verb(nearest)}${nearest.door ? (nearest.open ? ' (close)' : ' (open)') : ''}` : person ? `[E] Talk to ${person.name}` : '');
    // Name tag over whoever you're about to talk to.
    this.nameTag ??= this.add.text(0, 0, '', { ...FONT, fontSize: '7px', color: '#ffe6c0' }).setOrigin(0.5, 1).setDepth(6500);
    const tagged = person ?? (nearest?.npc ? { x: nearest.x * TILE + 8, y: nearest.y * TILE + 8, name: nearest.label } : null);
    if (tagged) this.nameTag.setText(tagged.name).setPosition(Math.round(tagged.x), Math.round(tagged.y) - 22).setVisible(true); else this.nameTag.setVisible(false);
    const near = this._clickedObj; this._clickedObj = null;
    if (!near) return;
    if (!inReach(near)) { this.hint.setText(`${near.label} (too far)`); return; }
    if (near.action === 'exit') {
      if (this.mode === 'client') this.net.send({ t: 'exit', obj: near.id });
      else this._tryExit(near);
      return;
    }
    if (near.puzzle === 'pipes' && !this.save.flags[near.solvedFlag]) {
      this.puzzle = new PipePuzzle(this, `${this.save.world.seed}:${near.id}`, () => {
        this.puzzle = null; this._flag(near.solvedFlag, true); this._toast('✓ Signal restored');
        const [scene, node] = near.talk.split(':'); this.startDialogue(scene, node || null);
      });
      return;
    }
    // Story first, quest second: the first talk plays the scene; after that a quest step (pitch,
    // hand-in, report) takes the interaction if one is waiting, otherwise the scene replays.
    if (near.talk && near.npc) {
      const met = `met.${near.id}`;
      if (this.save.flags[met] && this._questInteract(near)) return;
      if (!this.save.flags[met]) this._flag(met, true);
    }
    // A scene that is finished for good (e.g. the sniffer is printed) answers with one line after that.
    if (near.talk && near.doneFlag && this.save.flags[near.doneFlag]) { this._say(near.doneText ?? near.text ?? ''); return; }
    if (near.talk) { const [scene, node] = near.talk.split(':'); this.startDialogue(scene, node || null, near.after ? () => this._flag(near.after, true) : null); return; }
    if (near.action === 'ending') { this._playEnding(); return; }
    if (near.action === 'fab') { this._openFab(); return; }
    if (this._questInteract(near)) return;
    if (near.grant) {
      if (this.save.flags[near.grantFlag ?? `got.${near.id}`]) { this._say(near.doneText ?? near.text ?? ''); return; }
      this._flag(near.grantFlag ?? `got.${near.id}`, true); this._grant(near.grant); this._say(near.text ?? ''); return;
    }
    if (/^obj\.switch_[abc]$/.test(near.id)) { this._lever(near.id.slice(-1)); return; }
    if (near.id === 'obj.vending') { this._kickVending(near); return; }
    if (CLOCKS.includes(near.id)) { this._windClock(near); return; }
    if (BUST_ORDER.includes(near.id)) { this._turnBust(near); return; }
    if (near.id === 'obj.manuel_table') { this._say(near.text + BUST_HINT); return; }
    if (near.id === 'obj.shrimp_tank') { this._say(near.text + '\n\n' + this._shrimpReading()); return; }
    if (near.id === 'obj.yard_map') { this._say(`${YARD_MAP_TEXT}\n\nCurrent: ${LEVERS.map((k) => `${k.toUpperCase()} ${(this.save.flags[`act1.switch.${k}`] ?? 'left').toUpperCase()}`).join(' · ')}${this.save.flags['act1.switchyard.solved'] ? '\nThe east gate is open.' : ''}`); return; }
    if (['obj.work_order', 'obj.sunk_vending', 'obj.ledger'].includes(near.id)) { this._say((near.text ?? '') + clueFor(near.id, yardSolution(this.save.world.seed), !!this.save.flags['act1.bay.drained'])); return; }
    if (near.id === 'obj.pump') {
      if (this.save.flags['act1.bay.drained']) { this._say((near.text ?? '') + '\n\nIt\'s still running, the way you left it. Down in the flooded bay, the waterline has dropped.'); return; }
      this._flag('act1.bay.drained', true); sfx('hit'); this.cameras.main.shake(300, 0.004);
      this._say((near.text ?? '') + '\n\nYou find the reset and lean on it. The pump coughs, catches, and starts pulling water. Somewhere south, a long gurgle. The flooded bay is draining.'); return;
    }
    if (near.action === 'tv') { this._say(this._newsLine()); return; }
    if (near.action === 'shop') { this.gameMenu.show(`shop:${near.shop}`); return; }
    if (near.action === 'quests') { this.gameMenu.show('quests'); return; }
    if (near.action === 'pages') { if (near.flag && !this.save.flags[near.flag]) this._flag(near.flag, true); const n = (this._pageIdx[near.id] = ((this._pageIdx[near.id] ?? -1) + 1) % near.pages.length); this._say(near.pages[n] + (near.pages.length > 1 ? `\n\n[E again: ${n + 1}/${near.pages.length}]` : '')); return; }
    if (near.id === 'obj.scooters') {
      if (this.mode !== 'client') { for (const c of Object.values(this.save.party)) c.scooterBattery = 100; for (const p of this.sim.players.values()) p.battery = 100; }
      this._say(near.text + '\n\nAll three scooters are charged to 100%. Ride outdoors with [Q].'); return;
    }
    if (near.action === 'mate') { this._mateBreak(); this._say(near.text + '\n\nEveryone has some. Better. (Thermos refilled.)'); return; }
    if (near.door) { if (this.mode === 'client') this.net.send({ t: 'door', id: near.id }); else this._toggleDoor(near.id); return; }
    if (near.knock) { this._knock(near); return; }
    this._say(near.text);
    if (near.flag) {
      if (this.mode === 'client') this.net.send({ t: 'flag', key: near.flag });
      else this.save.flags[near.flag] = true;
    }
    if (near.action === 'save') this._save();
  }

  // Easter egg (docs/SECRETS.md): the always-occupied bathroom. Knock 5 times, then 10.
  _knock(obj) {
    const done = !!this.save?.flags?.['secrets.bathroom.found'];
    const n = this._knocks = done ? 11 : (this._knocks ?? 0) + 1;
    const lines = [
      '"Occupied."',
      '"Still occupied."',
      '"It\'s a door. It\'s locked. You\'ve met doors."',
      'A tap runs. It stops. It runs again.',
      '"ONE MINUTE!"',
      '"I said one minute. I didn\'t say which one."',
      'Something heavy is set down on tile. A long breath out.',
      '"Do you want me to rush this? Nobody wants me to rush this."',
      '"Fine. FINE."',
      'The lock turns. The door opens a hand\'s width.\n\nYou look. You stop looking.\n\nThe door closes itself, gently, like a book you weren\'t ready for. The queue sign still says 1.',
    ];
    this._say(n > 10 ? '"No."' : lines[n - 1]);
    if (n === 10) {
      if (this.mode === 'client') this.net.send({ t: 'flag', key: 'secrets.bathroom.found' });
      else this.save.flags['secrets.bathroom.found'] = true;
      this._toast('Achievement: One minute.');
    }
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
    this._reviveCleared = false; if (!snap.players.some((p) => p.dn)) this.reviveGfx?.clear();
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
      // Combat frames win over walk/idle: dodge, then the swing, then the flinch after a hit.
      const act = p.d ? 'dodge' : p.sw ? 'attack' : (p.iv && !p.d) ? 'hurt' : null;
      if (act && this.anims.exists(`${p.c}_${act}_${facing}`)) key = `${p.c}_${act}_${facing}`;
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
      const sg = (s.scooterGfx ??= this.add.graphics());
      sg.clear();
      if (p.ri) {
        const col = { michael: 0xc8605a, trevor: 0x3f6fb5, manuel: 0x5f8f3a }[p.c] ?? 0x888888, fx = p.f === 'left' ? -1 : 1;
        sg.fillStyle(0x1a1a22).fillRect(p.x - 7, p.y + 3, 14, 2);                       // deck
        sg.fillStyle(col).fillRect(p.x - 7, p.y + 2, 14, 1);
        sg.fillStyle(0x2b2b33).fillCircle(p.x - 6, p.y + 5, 1.5).fillCircle(p.x + 6, p.y + 5, 1.5); // wheels
        sg.lineStyle(1, 0x9aa3c7).lineBetween(p.x + 6 * fx, p.y + 3, p.x + 6 * fx, p.y - 9);       // stem
        sg.setDepth(p.y + 1);
        s.setY(Math.round(p.y + 1));
        if (p.gr && Math.random() < 0.6) { const sp = this.add.rectangle(p.x - 6 * fx, p.y + 5, 1.5, 1.5, 0xffd27f).setDepth(p.y + 2); this.tweens.add({ targets: sp, x: sp.x - fx * (6 + Math.random() * 8), y: sp.y - Math.random() * 4, alpha: 0, duration: 220, onComplete: () => sp.destroy() }); }
      }
      if (p.dn) {
        const g = (this.reviveGfx ??= this.add.graphics().setDepth(6400));
        if (!this._reviveCleared) { g.clear(); this._reviveCleared = true; }
        g.lineStyle(2, 0x1c1f33, 0.9).strokeCircle(p.x, p.y - 20, 6);
        if (p.rv > 0) g.lineStyle(2, 0xffb347, 1).beginPath().arc(p.x, p.y - 20, 6, -Math.PI / 2, -Math.PI / 2 + (p.rv / 4) * Math.PI * 2).strokePath();
      }
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
      if (e.boss) {
        this._bossBar(e);
        if (e.boss.st === 'vulnerable') s.setAlpha(0.6 + 0.4 * Math.sin(this.time.now / 50)); else s.setAlpha(1);
        if (e.boss.st === 'windup') s.setScale(1.08 + 0.04 * Math.sin(this.time.now / 30), 1.08); else if (!e.boss.sahur) s.setScale(1);
      }
      s.setScale(1 + Math.sin(this.time.now / 90 + e.x) * 0.06, 1);   // jittery rot wobble
    }
    for (const [id, s] of this.enemySprites) if (!eseen.has(id)) { s.destroy(); this.enemySprites.delete(id); }
    const meP = snap.players.find((p) => p.id === this.localId);
    let tgt = null, td = 70;
    for (const e of snap.enemies || []) { if (e.boss || !e.vn || !meP) continue; const d = Math.hypot(e.x - meP.x, e.y - meP.y); if (d < td) { td = d; tgt = e; } }
    this.enemyTag ??= this.add.text(0, 0, '', { ...FONT, fontSize: '6.5px', color: '#d6c0e8' }).setOrigin(0.5, 1).setDepth(6500);
    if (tgt) this.enemyTag.setText(`${tgt.vn}${tgt.tr && tgt.tr !== 'plain' ? ` · ${TRAIT_LABEL[tgt.tr]}` : ''}`).setPosition(tgt.x, tgt.y - 16).setVisible(true); else this.enemyTag.setVisible(false);
    if (!(snap.enemies || []).some((e) => e.boss)) this.bossUi?.setVisible(false);

    for (const d of this.doorVis ?? []) if (d.drawn !== !!d.o.open) {
      d.drawn = !!d.o.open;
      if (d.art) { const k = d.o.art ?? d.o.id; const f = d.o.open && this.textures.get(d.sheet).has(`${k}#open`) ? `${k}#open` : k; d.vis.setFrame(f).setAlpha(d.o.open && f === k ? 0.3 : 1); }
      else this._drawDoor(d.vis, d.o);
    }
    this.shotGfx.clear();
    for (const d of snap.decoys || []) {   // decoy bust (placeholder: a little pink plaster figure)
      this.shotGfx.fillStyle(0xe8d8d0).fillRect(d.x - 4, d.y - 10, 8, 9).fillStyle(0xf2a6b8).fillRect(d.x - 2, d.y - 7, 4, 3).fillStyle(0x5a4a44).fillRect(d.x - 5, d.y - 1, 10, 2);
    }
    for (const h of snap.hazards || []) {
      const pulse = 0.25 + 0.12 * Math.sin(this.time.now / 120 + h.x);
      this.shotGfx.fillStyle(0xd65db1, pulse * Math.min(1, h.t)).fillCircle(h.x, h.y, h.r);
      this.shotGfx.lineStyle(1, 0x7fb069, 0.6 * Math.min(1, h.t)).strokeCircle(h.x, h.y, h.r);
      for (let i = 0; i < 3; i++) this.shotGfx.fillStyle(0x7fb069, 0.5).fillRect(h.x + Math.sin(this.time.now / 90 + i * 2) * h.r * 0.6, h.y + Math.cos(this.time.now / 110 + i) * h.r * 0.5, 2, 2);
    }
    if (snap.ring) {
      const cx = (this.map.w * TILE) / 2, cy = (this.map.h * TILE) / 2;
      this.shotGfx.lineStyle(3, 0xd65db1, 0.5 + 0.3 * Math.sin(this.time.now / 100)).strokeCircle(cx, cy, snap.ring);
    }
    for (const sh of snap.shots || []) this.shotGfx.fillStyle(sh.f ? 0xffd27f : 0xd65db1).fillCircle(sh.x, sh.y, sh.f ? 2 : 2.5);

    for (const ev of snap.events || []) this._fx(ev, snap);
    this._barkTick(snap);
    this._drawLighting(snap);
    this._tickAmbient(this.game.loop.delta / 1000);
    this.neon?.update(this.game.loop.delta / 1000, this.cameras.main);
    this.crowd?.update(this.game.loop.delta / 1000);
    this._tickTypewriter(this.game.loop.delta / 1000);
    this._tickFishing();
    this._tickQuests();
    this._tickGlimpse();
    this._tickScan();
    if (this.fishing) { const k = this.input2.keys; if (k.w.isDown || k.a.isDown || k.s.isDown || k.d.isDown || k.up.isDown || k.down.isDown || k.left.isDown || k.right.isDown) this._endFishing(false); }
    this._tickPorkGlitch();
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

  /** The whole world: every explored area at its world position, panned/zoomed inside a viewport. */
  drawWorldMap(g, vx, vy, vw, vh, view, snap = this._lastRendered) {
    const k = view.zoom, here = this.map.id;
    g.fillStyle(0x070912, 0.92).fillRect(vx, vy, vw, vh).lineStyle(1, 0x5d6487, 0.8).strokeRect(vx, vy, vw, vh);
    const ex = this.save.world.explored || {};
    const labels = [];
    for (const id of Object.keys(ex)) {
      const m = MAPS[id]; if (!m) continue;
      const wp = worldPos(m), bits = ex[id];
      const ox = vx + vw / 2 + (wp.x - view.cx) * k, oy = vy + vh / 2 + (wp.y - view.cy) * k;
      if (ox > vx + vw || oy > vy + vh || ox + m.w * k < vx || oy + m.h * k < vy) continue;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        if (bits[y * m.w + x] !== '1') continue;
        const px = ox + x * k, py = oy + y * k;
        if (px < vx || py < vy || px + k > vx + vw || py + k > vy + vh) continue;
        g.fillStyle(m.solid(x, y) && !m.doors.get(`${x},${y}`) ? (id === here ? 0x4a5080 : 0x353a5c) : (id === here ? 0x262a44 : 0x1a1d30)).fillRect(px, py, Math.ceil(k), Math.ceil(k));
      }
      for (const o of m.objects) if (bits[o.y * m.w + o.x] === '1' && o.action === 'exit') {
        const px = ox + o.x * k, py = oy + o.y * k;
        if (px >= vx && py >= vy && px < vx + vw && py < vy + vh) g.fillStyle(0xffb347).fillRect(px, py, Math.max(2, k), Math.max(2, k));
      }
      labels.push({ text: m.name, x: ox + (m.w * k) / 2, y: oy - 2, here: id === here });
    }
    if (snap) for (const p of snap.players) {
      const wp = worldPos(this.map), px = vx + vw / 2 + (wp.x + p.x / TILE - view.cx) * k, py = vy + vh / 2 + (wp.y + p.y / TILE - view.cy) * k;
      if (px >= vx && py >= vy && px < vx + vw && py < vy + vh) g.fillStyle(p.id === this.localId ? 0x7fff9a : 0x6fb6ff).fillRect(px - 2, py - 2, 4, 4);
    }
    return labels.filter((l) => l.x > vx && l.x < vx + vw && l.y > vy + 6 && l.y < vy + vh);
  }

  _drawMinimap(snap) {
    const g = (this.mini ??= this.add.graphics().setScrollFactor(0).setDepth(9050)).clear();
    if (this.menu || this.dlg) return;
    const w = Math.min(100, this.map.w * 2), h = Math.min(40, this.map.h * 2);
    this.drawAreaMap(g, VIEW.w - w - 6, 44, w, h, snap);
  }

  // Boss name card: big, centered, then it gets out of the way.
  _bossIntro(ev) {
    const W = VIEW.w, H = VIEW.h;
    const band = this.add.rectangle(W / 2, H / 2, W, 46, 0x05060c, 0.85).setScrollFactor(0).setDepth(9400);
    const name = this.add.text(W / 2, H / 2 - 8, ev.name, { heading: true, fontSize: '18px', color: ev.sahur ? '#c8955a' : '#f2a6b8' }).setOrigin(0.5).setScrollFactor(0).setDepth(9401);
    const ep = this.add.text(W / 2, H / 2 + 12, ev.epithet, { ...FONT, color: '#9aa3c7' }).setOrigin(0.5).setScrollFactor(0).setDepth(9401);
    const all = [band, name, ep];
    all.forEach((o) => o.setAlpha(0));
    this.tweens.add({ targets: all, alpha: 1, duration: 300, hold: 1500, yoyo: true, onComplete: () => all.forEach((o) => o.destroy()) });
    this.cameras.main.shake(250, 0.006);
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

  // ---------- barks: short lines over the roommates' heads (content in src/content/barks.js) ----------
  _bark(playerId, text) {
    const s = this.sprites.get(playerId);
    if (!s || !text || this.dlg || this.menu || this.time.now < (this._barkQuietUntil ?? 0)) return;
    this._barkQuietUntil = this.time.now + 5000;                    // one voice at a time
    const t = this.add.text(s.x, s.y - 30, text, { ...FONT, fontSize: '6px', color: '#e8e8f0', backgroundColor: '#0b0d16cc', padding: { x: 2, y: 1 } }).setOrigin(0.5, 1).setDepth(7000);
    const follow = this.time.addEvent({ delay: 30, loop: true, callback: () => t.active && s.active && t.setPosition(s.x, s.y - 30) });
    this.tweens.add({ targets: t, alpha: 0, delay: 2600, duration: 500, onComplete: () => { follow.remove(); t.destroy(); } });
  }

  _barkFrom(kind, snap, { not = null, by = null } = {}) {
    const players = (snap?.players ?? []).filter((p) => !p.dn && p.id !== not);
    const p = by ? players.find((x) => x.id === by) : players[Math.floor(Math.random() * players.length)];
    if (p) this._bark(p.id, pickBark(BARKS[kind], p.c));
  }

  _barkTick(snap) {
    // Somebody went down: one of the others says so.
    for (const p of snap.players) {
      const s = this.sprites.get(p.id);
      if (s && p.dn && !s.wasDown) this._barkFrom('allyDown', snap, { not: p.id });
      if (s) s.wasDown = p.dn;
    }
    // Now and then, out of nowhere.
    this._nextIdleBark ??= this.time.now + 20000;
    if (this.time.now > this._nextIdleBark) {
      this._nextIdleBark = this.time.now + 28000 + Math.random() * 30000;
      const up = snap.players.filter((p) => !p.dn);
      const p = up[Math.floor(Math.random() * up.length)];
      if (p) this._bark(p.id, pickBark(p.mo && BARKS.idleMorph[p.c] ? BARKS.idleMorph : BARKS.idle, p.c));
    }
  }

  _fx(ev, snap) {
    if (['hit', 'kill', 'shot', 'swing'].includes(ev.t) && (ev.by === this.localId || ev.id === this.localId)) sfx(ev.t);
    if (ev.t === 'hurt' && ev.id === this.localId) sfx('hurt');
    if (ev.t === 'kill' && !ev.boss && Math.random() < 0.3) this._barkFrom('kill', snap, { by: ev.by });
    if (ev.t === 'hurt' && Math.random() < 0.2) this._barkFrom('allyHurt', snap, { not: ev.id });
    if (ev.t === 'drum') { this.cameras.main.shake(40, ev.beat % 4 === 0 ? 0.006 : 0.002); sfx('hit'); }
    if (ev.t === 'boss' && !ev.sahur && this.mode !== 'client') this.save.flags['act1.boss.wardenName'] = ev.name;
    if (ev.t === 'kill' && ev.boss && this.mode !== 'client') this.save.flags['act1.boss.defeated'] = true;
    if (ev.t === 'kill' && ev.boss && !this._endingPlayed) { this._endingPlayed = true; this.time.delayedCall(900, () => this._playEnding(true)); }
    if (ev.t === 'phase') { this.cameras.main.shake(300, 0.01); this._say(ev.phase === 3 ? 'The Warden overloads. The platform starts rendering wrong.' : 'It changes how it moves.'); }
    if (ev.t === 'tell' && ev.kind) {
      const g = this.add.graphics().setDepth(5500), dur = (ev.dur ?? 0.7) * 1000;
      if (ev.kind === 'charge' || ev.kind === 'beam') {
        const len = ev.kind === 'charge' ? 120 : 160;
        g.lineStyle(ev.kind === 'charge' ? 10 : 3, 0xd65db1, 0.35).lineBetween(ev.x, ev.y - 8, ev.x + Math.cos(ev.a) * len, ev.y - 8 + Math.sin(ev.a) * len);
      } else if (ev.kind === 'ring' || ev.kind === 'spray') {
        g.lineStyle(2, 0xffb347, 0.7).strokeCircle(ev.x, ev.y - 8, 18);
      } else if (ev.kind === 'puddle') {
        for (const p of snap.players) g.lineStyle(1, 0xd65db1, 0.8).strokeCircle(p.x, p.y, 16);
      }
      this.tweens.add({ targets: g, alpha: { from: 0.4, to: 1 }, duration: dur, yoyo: false, onComplete: () => g.destroy() });
    }
    if (ev.t === 'riff') { const r = this.add.circle(ev.x, ev.y - 6, 6, 0xffe08a, 0).setStrokeStyle(2, 0xffe08a, 0.9).setDepth(5600); this.tweens.add({ targets: r, scale: 7.5, alpha: 0, duration: 380, onComplete: () => r.destroy() }); this.cameras.main.shake(140, 0.006); sfx('kill'); }
    if (ev.t === 'ping') { const r = this.add.circle(ev.x, ev.y - 6, 6, 0x6ff2ff, 0).setStrokeStyle(1, 0x6ff2ff, 0.9).setDepth(5600); this.tweens.add({ targets: r, scale: 25, alpha: 0, duration: 650, onComplete: () => r.destroy() }); sfx('shot'); }
    if (ev.t === 'decoy') sfx('swing');
    if (ev.t === 'vuln') {
      const t = this.add.text(ev.x, ev.y - 30, 'OVERHEATED: hit it!', { ...FONT, color: '#ffb347' }).setOrigin(0.5).setDepth(6100);
      this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 1300, onComplete: () => t.destroy() });
    }
    if (ev.t === 'overload') { this.cameras.main.shake(500, 0.012); this.cameras.main.flash(250, 214, 93, 177); }
    if (ev.t === 'boss') this._bossIntro(ev);
    if (ev.t === 'crit') { const t = this.add.text(ev.x, ev.y - 24, 'CRIT', { ...FONT, fontSize: '7px', color: '#ff6b6b' }).setOrigin(0.5).setDepth(6060); this.tweens.add({ targets: t, y: t.y - 8, alpha: 0, duration: 600, onComplete: () => t.destroy() }); }
    if (ev.t === 'secondwind') {
      const g = this.add.circle(ev.x, ev.y - 8, 10, 0x7fd0c0, 0.5).setDepth(6000); this.tweens.add({ targets: g, scale: 3, alpha: 0, duration: 600, onComplete: () => g.destroy() });
      if (ev.id === this.localId) { this.cameras.main.flash(160, 120, 220, 200); this._toast('Second wind.'); }
    }
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
    if (ev.t === 'down' && ev.id === this.localId) this._say('You\'re down. A roommate can pick you up by staying next to you for a few seconds.');
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
    if (me) {   // ability (R): a pip under the card that fills as it recharges
      const max = { trevor: 6, manuel: 10, michael: 8 }[me.c] ?? 8, frac = 1 - Math.min(1, (me.sk ?? 0) / max);
      g.fillStyle(0x1c1f33).fillRect(34, 33, 30, 3).fillStyle(frac >= 1 ? 0xffb347 : 0x5d6487).fillRect(34, 33, 30 * frac, 3);
    }
    this.hudSkill ??= this.add.text(67, 31, '', { ...FONT, fontSize: '6px', color: '#9aa3c7' }).setScrollFactor(0).setDepth(9002);
    this.hudSkill.setText(`[R] ${{ trevor: 'Riff', manuel: 'Decoy', michael: 'Ping' }[this.character]}`);
    g.fillStyle(0xffb347).fillRoundedRect(92, 6, 20, 9, 2);
    this.hudLv ??= this.add.text(102, 6.5, '', { ...FONT, fontSize: '7px', color: '#0b0d16' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(9002);
    this.hudLv.setText(`LV${c.level}`);
    // Teammates: small bars under the card.
    snap.players.filter((p) => p.id !== this.localId).forEach((p, i) => {
      const y = 42 + i * 7;
      g.fillStyle(0x0b0d16, 0.7).fillRect(4, y - 1, 70, 6);
      g.fillStyle(p.dn ? 0x777788 : 0x5f8fbf).fillRect(18, y, Math.max(0, (p.hp / (p.mhp || 100)) * 54), 4);
      if (p.dn) g.fillStyle(0xffb347).fillRect(18, y + 4, (p.rv / 4) * 54, 1);
      g.fillStyle({ michael: 0xc8605a, trevor: 0x3f6fb5, manuel: 0x5f8f3a }[p.c] ?? 0x888888).fillRect(7, y, 8, 4);
    });
    // Top-right: XP and money, compact.
    const lines = [`xp ${c.xp}/${c.level * XP_PER_LEVEL}${c.skillPoints ? `   ◆ ${c.skillPoints} skill pt [K]` : ''}`, `$${this.save.world.money ?? 0}${snap.enemies?.length ? `   coderot ${snap.enemies.length}` : ''}`];
    this.hudText.setText(lines.join('\n'));
    this._drawHotbar();
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
