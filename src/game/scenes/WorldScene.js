import { Sim, TILE } from '../../engine/sim.js';
import { VIEW, setupCameras, toView } from '../../view.js';
import { InputReader } from '../../engine/input.js';
import { newSave } from '../../engine/save/schema.js';
import { autosave, loadAutosave, exportFile } from '../../engine/save/storage.js';
import { rollWorld } from '../../engine/worldRolls.js';
import { newSeed, Rng } from '../../engine/rng.js';
import { MAPS, worldPos } from '../../content/maps/index.js';
import { OLD_PHONE } from '../../content/eggs_gonman.js';
import { TILE_COLORS } from '../../content/maps/build.js';
import { ENEMIES } from '../../content/enemies.js';
import { GAME_VERSION } from '../../version.js';
import { loadScene, Conversation, evalCond } from '../../engine/dialogue.js';
import { babble, setArea, sfx, ring, speak, hush, setInstrumentFocus } from '../../audio/audio.js';
import { sellPrice, LOOT, DROPS, SHOPS, ITEMS, RECIPES, SKILLS, playerMods, EQUIP_SLOTS, canWear } from '../../content/items.js';
import { tileKey, laneDashes } from '../render/tiles.js';
import { GameMenu, TABS } from '../ui/GameMenu.js';
import { Crowd } from '../crowd.js';
import { BARKS, pickBark } from '../../content/barks.js';
import { esLine } from '../../content/lines_es.js';
import { rollCatch } from '../../content/fish.js';
import { QUESTS, questState, questVisible } from '../../content/quests.js';
import { CompanionBrain, isAi } from '../../engine/companion.js';
import * as Inv from '../../engine/inventory.js';
import { CallCard } from '../ui/CallCard.js';
import { tr } from '../../i18n.js';
import * as Settings from '../../settings.js';
import { BoardGame } from '../ui/BoardGame.js';
import { Neon } from '../render/neon.js';
import { skillNode, skillOpen, migrateSkills } from '../../content/skills.js';
import { PipePuzzle } from '../ui/PipePuzzle.js';
import { solution as yardSolution, clueFor, YARD_MAP_TEXT, LEVERS } from '../../content/switchyard.js';
import { SharedEvents } from '../sharedEvent.js';
import { Performances } from '../performances.js';
import { Romance } from '../romance.js';
import { Gear } from '../gear.js';
import { Cameos } from '../cameos.js';
import { Eggs } from '../eggs.js';
import { Crush } from '../crush.js';
import { Fart } from '../fart.js';
import { Approach } from '../approach.js';
import { Pacifier } from '../pacifier.js';
import { ABILITY_KEYS, BASE_SCORES, MAX_SCORE } from '../../content/abilities.js';
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

// Highlight colours: quest-important text (cyan) and people/places (gold).
const HI = { quest: '#6fe3e8', name: '#ffd27f' };

// Who sees a conversation in co-op, until the scripts carry their own `Scope:` lines (gonman, #307).
const SCOPE_DEFAULT = { cold_open: 'all', the_call: 'all', ending: 'all', first_death: 'all', 'aster:aster_enter': 'all' };

const CONTROLS_TEXT = 'WASD move · mouse aim · click: use held item\nSpace / Shift dodge · E interact · R ability\n1-9 or wheel: hotbar · Q scooter outdoors\nI bag · J quests · K skills · Tab map · ESC';

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
    // Screen shake can be turned off in settings (task #31): every shake in the game goes through the camera.
    { const cam = this.cameras.main, shake = cam.shake.bind(cam); cam.shake = (...args) => (Settings.get('shake') ? shake(...args) : cam); }
    this.events.once('shutdown', () => setInstrumentFocus(null, null));
    this.acc = 0;
    this._makeUi();
    this._wireNet();
    this._makeDialogueUi();
    // D-014: shared events, instruments, romance (src/game/sharedEvent.js, performances.js, romance.js)
    this.shared = new SharedEvents(this); this.perf = new Performances(this); this.romance = new Romance(this); this.gear = new Gear(this); this.cameos = new Cameos(this); this.eggs = new Eggs(this); this.crush = new Crush(this); this.fart = new Fart(this); this.approach = new Approach(this); this.pacifier = new Pacifier(this);
    this._pageIdx = {};
    this.vignette = this._makeVignette();
    if (this.mode !== 'client') for (const p of this.sim.players.values()) {
      const c = this.save.party[p.character];
      this.sim.setMods(p.id, playerMods(c, p.character));
      this.sim.setRot(p.id, c.rot ?? 0);
      p.analogCharm = !!ITEMS[c.equipped?.charm]?.analog;
    }
    // No default punch (Trevor). Nobody starts armed: weapons are found, bought, printed, or taken
    // off the 631 toolwall (obj.toolwall). How the first one is earned is still being discussed (#hub).
    for (const c of Object.values(this.save.party)) c.hotSel ??= 0;
    if (this.mode !== 'client') this._syncParty();
    this.input.on('wheel', (ptr, objs, dx, dy) => { if (this.menu || this.dlg) return; const c = this.save.party[this.character]; this.selectHot((c?.hotSel ?? 0) + (dy > 0 ? 1 : -1)); });
    this.time.delayedCall(500, () => this._spawnBot());
    if (new URLSearchParams(location.search).has('lattice')) this.time.delayedCall(800, () => this.openBoardGame());   // debug: open the board game
    { const c = new URLSearchParams(location.search).get('cinematic'); if (c) this.time.delayedCall(600, () => this.playCinematic(c)); }   // debug: ?cinematic=demo
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
      if (this._qbSticky) return this._qbSticky.leave();   // E closes a quest card too (Trevor)
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
    if (!this.save.flags['act1.coldopen.done']) this.startDialogue('cold_open', null, () => { this._flag('act1.coldopen.done', true); this._controlsHint(); });
    else this.time.delayedCall(1200, () => this._controlsHint());
  }

  // ---------- dialogue ----------
  _flag(k, v) {
    this.save.flags[k] = v;
    if (this.mode === 'client') this.net.send({ t: 'flag', key: k, value: v });
  }

  // Roommates a human is playing. Everyone else is an AI companion, and the human can act for them
  // (Trevor: NPC stories must progress in a one-player game too).
  humanRoommates() {
    const ps = this.mode === 'client' ? (this._lastRendered?.players ?? []).map((p) => ({ id: p.id, character: p.c })) : [...(this.sim?.players.values() ?? [])];
    return new Set(ps.filter((p) => !String(p.id).startsWith('ai:')).map((p) => p.character));
  }
  actsFor(who) { return who === this.character || !this.humanRoommates().has(who); }

  _dialogueCtx() {
    const me = this.save.party[this.character];
    const present = [...new Set((this._lastRendered?.players || []).map((p) => p.c))];
    return {
      speaker: this._speakerOverride ?? this.character, present: present.length ? present : [this.character], flags: this.save.flags,
      inventory: Inv.ids(me), seed: this.save.world.rolls?.twistVariant ?? 'A',
      morph: me.morph.stage, standing: this.save.standing, money: this.save.world.money ?? 0,
    };
  }

  // Every conversation goes through here. In co-op it becomes a shared event with a scope:
  // story scenes reach everyone, NPC talks reach roommates nearby (D-018 via #296/#306/#307).
  async startDialogue(sceneName, nodeId, onDone, label = '') {
    if (this.dlg) return;
    if (this._inShared) return this._startLocal(sceneName, nodeId, onDone);
    const sc = await loadScene(sceneName), node = sc.nodes[nodeId ?? sc.start];
    const scope = node?.scope ?? sc.scope ?? SCOPE_DEFAULT[`${sceneName}:${nodeId ?? sc.start}`] ?? SCOPE_DEFAULT[sceneName] ?? 'nearby';
    this._dlgScope = scope;
    if (this.mode === 'solo') return this._startLocal(sceneName, nodeId, () => { this._dlgScope = null; onDone?.(); });
    this._inShared = true;
    try { return await this.shared.start(sceneName, nodeId, onDone, scope, label); } finally { this._inShared = false; }
  }

  // A story scene (scope 'all') is on someone's screen: the host doesn't step the world, so nobody gets
  // hit while the party is reading. Ordinary NPC talks don't pause anything.
  _storyPaused() {
    const sh = this.shared;
    return (!!this.dlg && this._dlgScope === 'all') || sh?.active?.scope === 'all' || sh?.watching?.scope === 'all';
  }

  async _startLocal(sceneName, nodeId, onDone) {
    if (this.dlg) return;
    this._dlgSceneName = sceneName;
    const scene = await loadScene(sceneName);
    const sink = {
      flag: (k, v) => this._flag(k, v),
      item: (item, n = 1) => { if (this.mode === 'client') this.net.send({ t: 'item', who: this.character, item, n }); else { Inv.add(this.save.party[this.character], `item.${item}`, n); this._syncParty(); } this._toast(`★ ${ITEMS[`item.${item}`]?.name ?? item}${n > 1 ? ' ×' + n : ''}`); },
      pay: (n) => { this.save.world.money = Math.max(0, (this.save.world.money ?? 0) - n); this._partyDirty = true; this._toast(`-$${n}`); },
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
        if (n >= 1 && n <= 9 && !this.menu && !this.puzzle) this.selectHot(n - 1);
        return;
      }
      if (ev.key === 'e' || ev.key === 'E' || ev.key === ' ' || ev.key === 'Enter') {
        if (!this.dlg.choices.length && (this._typeShown ?? 0) < (this._typeFull?.length ?? 0)) { this._typeShown = this._typeFull.length; this._drawDialogue(); return; }
        if (!this.dlg.choices.length && this._pages && this._page < this._pages.length - 1) {   // long line: next page first
          this._page++; this._typeFull = this._pages[this._page]; this._typeShown = 0; this._lineAt = this.time.now; this._drawDialogue(); return;
        }
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
    // Trevor's call portrait (assets/ui/john-pork-call.png, f9a4d75); the drawn sprite only if it's missing.
    if (this.textures.exists('john-pork-call')) {
      const ih = ph - 54, iw = Math.round(ih * 264 / 180);
      panel.lineStyle(1, 0xf2a6b8, 0.8).strokeRect(W / 2 - iw / 2 - 2, py + 34, iw + 4, ih + 4);
      root.add(this.add.image(W / 2, py + 36, 'john-pork-call').setOrigin(0.5, 0).setDisplaySize(iw, ih));
    } else if (this.anims.exists('pork')) { const face = this.add.sprite(W / 2, py + ph - 26, 'principals').play('pork').setOrigin(0.5, 1).setScale(2); root.add(face); }
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
    if (!who) { this.dlgPortraitBg.setVisible(false); this.dlgPortrait.setVisible(false); this.dlgInitial.setText(''); this._porkTalking = false; this.dlgBg.setStrokeStyle(1, 0xf2a6b8); return; }   // narration: no portrait
    this.dlgPortraitBg.setVisible(true);
    this._porkTalking = isPork;
    this.dlgBg.setStrokeStyle(1, isPork ? 0xd65db1 : 0xf2a6b8);
    if (isPork && this._dlgSceneName === 'the_call' && this.textures.exists('john-pork-call')) {
      // On the phone: Trevor's call portrait, same as the incoming-call screen.
      this.dlgPortrait.setTexture('john-pork-call').setCrop().setDisplaySize(38, 26).setOrigin(0.5, 0.5).setVisible(true);
      this.dlgInitial.setText('');
    } else if (isPork) {
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
    if (j) this._renderDlgText();
    if (Math.random() < 0.04) this.cameras.main.shake(60, 0.002);
  }

  _tickTypewriter(dt) {
    if (!this.dlg || this._typeFull == null || this._typeShown >= this._typeFull.length) return;
    this._typeShown = Math.min(this._typeFull.length, this._typeShown + dt * (Settings.TEXT_SPEEDS[Settings.get('textSpeed')] ?? 55));
    this._renderDlgText();
  }

  // Minimum time a line stays up before a click can skip it: base + reading time, capped.
  _minLineMs() { return Math.min(1600, 650 + (this.dlg?.line?.text?.length ?? 0) * 12); }

  _choose(i) {
    if (!this.dlg?.choices[i] || this.time.now - (this._lineAt ?? 0) < 450) return;
    if (this.dlg.spectator) { if (this.dlg.decider === this.character) { this.dlg.choose(i); this._toast('…'); } return; }
    if (this._aiDecider && !this.dlg.spectator) return this._toast(`${this._aiDecider.toUpperCase()} decides`);
    if (!this.shared?.canChoose()) return;
    this.shared?.picked(this.character, this.dlg.choices[i].text.replace(/\*/g, ''));
    this.dlg.choose(i); this._drawDialogue();
  }

  _drawDialogue() {
    const d = this.dlg, on = !!d && !d.done;
    if (this._callCard && !this._callCard.closed && (!on || this._callCardFor !== d.nodeId || !d.choices.length)) this._callCard.destroy();
    [this.dlgBg, this.dlgWho, ...this.dlgChoices].forEach((o) => o.setVisible(on));
    this.dlgText.setVisible(false);   // body text is drawn by _renderDlgText (pages + highlights)
    if (!on || d.choices.length) this._hideRich();
    if (!on) { this.dlgTimer?.setVisible(false); this.dlgPortrait.setVisible(false); this.dlgPortraitBg.setVisible(false); this.dlgInitial.setText(''); }
    if (d && d.done) { this.dlg = null; if (this.dlgVoiced) hush(); this.dlgVoiced = false; const cb = this.dlgDone; this.dlgDone = null; cb?.(); return; }
    if (!on) return;
    const choices = d.choices;
    this.dlgTimer?.setVisible(false);
    this._choiceHeader = false;
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
      this.dlgText.setText(''); this._hideRich(); this.dlgMore?.setVisible(false);
      // Directed choices: a small "→ MANUEL" tag, and greyed options on everyone else's screen.
      const decider = d.spectator ? d.decider : (this.shared?.active ? this.shared.deciderFor(d.node) : null);
      const mine = !decider || decider === this.character;
      // A header row above the options (not on top of them): clear for the decider, quiet for everyone else.
      this._choiceHeader = !!(decider && this.mode !== 'solo');
      // An AI roommate's own scene (romance he's courting himself): he picks, after a beat.
      if (this._aiDecider && !d.spectator) {
        this._choiceHeader = true;
        this.dlgWho.setText(`${this._aiDecider.toUpperCase()} IS CHOOSING…`).setColor('#9aa3c7');
        if (this._aiPickFor !== d.nodeId) {
          this._aiPickFor = d.nodeId;
          const node = d.nodeId;
          this.time.delayedCall(1100, () => {
            if (!this.dlg || this.dlg.nodeId !== node || !this.dlg.choices.length) return;
            const opts = this.dlg.choices.map((c, i) => [c, i]).filter(([c]) => !c.timeout);
            const [c, i] = opts[Math.floor(Math.random() * opts.length)] ?? [this.dlg.choices[0], 0];
            this._toast(`${this._aiDecider?.toUpperCase() ?? ''}: "${c.text.replace(/[*"]/g, '')}"`);
            this.dlg.choose(i); this._drawDialogue();
          });
        }
      }
      if (this._choiceHeader) this.dlgWho.setText(mine ? '▶ YOUR CHOICE' : `${decider.toUpperCase()} IS CHOOSING…`).setColor(mine ? '#6fe3e8' : '#9aa3c7');
      this.dlgChoices.forEach((t, i) => t.setText(choices[i] ? `${i + 1}. ${choices[i].text.replace(/\*/g, '')}` : '').setVisible(!!choices[i]).setAlpha(mine && !this._aiDecider ? 1 : 0.45));
      // John Pork's call: the ANSWER / DECLINE choice is shown as a full phone takeover (CallCard).
      const label = (c) => c.text.replace(/[*"]/g, '').trim().toUpperCase();
      const ai = choices.findIndex((c) => label(c) === 'ANSWER'), di = choices.findIndex((c) => label(c) === 'DECLINE');
      if (ai >= 0 && di >= 0) {
        if (!this._callCard || this._callCard.closed || this._callCardFor !== d.nodeId) {
          this._callCard?.destroy(); this._callCardFor = d.nodeId;
          this._callCard = new CallCard(this, { name: 'John Pork', onAnswer: () => this._choose(ai), onDecline: () => this._choose(di) });
        }
        this.dlgChoices.forEach((t) => t.setVisible(false));
      }
    } else {
      const line = d.line;
      this.dlgWho.setText(line?.who ? line.who.toUpperCase() : '').setColor('#ffb347');
      this.dlgText.setColor(line && !line.who ? '#9aa3c7' : '#e8e8f0');
      if (line && line !== this._lastLine) {
        this._lastLine = line; this._lineAt = this.time.now;
        // The guide's Sahur entry: seen once he speaks on screen, whichever route (cameo or boss).
        if (line.who && /sahur/i.test(line.who) && !this.save.flags['act1.sahur.seen']) this._flag('act1.sahur.seen', true);
        if (line.sms) {   // a text message: buzz, and keep it on the phone
          sfx('pickup');
          const texts = (this.save.world.phone ??= { texts: [] }).texts;
          if (!texts.some((t) => t.text === line.text)) texts.push({ from: 'John Pork', text: line.text, at: new Date().toISOString() });
        } else if (line.who && !(this.dlgVoiced && speak(line.who, line.text))) babble(line.who, line.text);
        this._pages = this._paginate((line.text ?? '').replace(/\*([^*]+)\*/g, '$1'), this.dlgMeasure, 4);
        this._page = 0; this._typeFull = this._pages[0]; this._typeShown = 0;
        this._setPortrait(line.who);
      }
      this._dlgBase = line && !line.who ? '#9aa3c7' : '#e8e8f0';
      this._renderDlgText();
      this.dlgChoices.forEach((t) => t.setVisible(false));
    }
    this._layoutDialogue(choices.length > 0);
  }

  // Split text into pages of `maxLines` wrapped lines, measured with the box's own font and width.
  _paginate(text, measure, maxLines) {
    const lines = measure.getWrappedText(text).map((l) => l.replace(/\s+$/, ''));
    const pages = [];
    for (let i = 0; i < lines.length; i += maxLines) pages.push(lines.slice(i, i + maxLines).join('\n'));
    return pages.length ? pages : [''];
  }

  // Two highlight colours (Trevor: quest-important text in its own colour).
  //   HI.quest (cyan): anything a writer wraps in {braces}, the plot's key objects, and every item a
  //   quest stage names. HI.name (gold): people and places. Built once from the maps and quests.
  _hiWords() {
    if (this._hiRx !== undefined) return this._hiRx;
    const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const quest = new Set(['orange balloon', 'the balloon', 'balloon', 'helium', 'sniffer', 'switchyard', 'storm grate', 'the platform', 'Fab #1', 'Fab #2', 'the fab', 'fab', 'toolwall', 'the toolwall']);
    const stageText = QUESTS.flatMap((q) => q.stages.map((st) => st.text.toLowerCase())).join('\n');
    for (const def of Object.values(ITEMS)) if (def.name && def.name.length > 3 && stageText.includes(def.name.toLowerCase())) quest.add(def.name);
    for (const q of QUESTS) for (const id of [q.give?.item, q.reward?.item]) if (id && ITEMS[id]?.name) quest.add(ITEMS[id].name);
    const names = new Set(['Green Line', 'John Pork', 'Room 631', '631']);
    for (const m of Object.values(MAPS)) {
      if (m.name) names.add(m.name.split(',')[0]);
      for (const o of m.objects) if (o.npc && o.label) names.add(o.label.replace(/\s*\(.*\)\s*/g, '').trim());
    }
    const rx = (set, flags) => {
      const list = [...set].filter((w) => w.length > 2 && !/^(Code rotter|Rotter|Student)/.test(w)).sort((a, b) => b.length - a.length).map(esc);
      return list.length ? new RegExp(`(^|[^A-Za-z])(${list.join('|')})(?![A-Za-z])`, flags) : null;
    };
    this._hiRx = { quest: rx(quest, 'gi'), name: rx(names, 'g') };
    return this._hiRx;
  }

  // mask[i]: 0 plain, 1 name/place, 2 quest-important. {braces} are removed and count as quest.
  _hiMask(text) {
    let plain = '', mask = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') { const j = text.indexOf('}', i); if (j > i) { const inner = text.slice(i + 1, j); plain += inner; mask.push(...Array(inner.length).fill(2)); i = j; continue; } }
      plain += text[i]; mask.push(0);
    }
    const { quest, name } = this._hiWords();
    for (const [rx, v] of [[name, 1], [quest, 2]]) {
      if (!rx) continue;
      rx.lastIndex = 0; let m;
      while ((m = rx.exec(plain))) { const st = m.index + m[1].length; for (let k = st; k < st + m[2].length; k++) if (mask[k] < v) mask[k] = v; }
    }
    return { plain, mask };
  }

  // Lay text out as coloured runs (Text objects from `pool`), left to right, line by line.
  // Returns how many pool entries were used; the caller hides the rest.
  _richRuns(pool, text, x0, y0, lineH, style, base, depth, shown = Infinity) {
    const { plain, mask } = this._hiMask(text);
    const color = [base, HI.name, HI.quest];
    let used = 0, line = 0, x = x0, run = '', runV = null;
    const flush = () => {
      if (!run) return;
      let t = pool[used];
      if (!t) { t = this.add.text(0, 0, '', style).setScrollFactor(0).setDepth(depth); pool.push(t); }
      used++;
      t.setText(run).setColor(color[runV ?? 0]).setPosition(x, y0 + line * lineH).setVisible(true);
      x += t.width; run = '';
    };
    for (let i = 0; i < plain.length && i < shown; i++) {
      const ch = plain[i];
      if (ch === '\n') { flush(); line++; x = x0; runV = null; continue; }
      if (runV !== null && mask[i] !== runV) flush();
      runV = mask[i]; run += ch;
    }
    flush();
    for (let k = used; k < pool.length; k++) pool[k].setVisible(false);
    return used;
  }

  _hideRich() { for (const t of this._rich ?? []) t.setVisible(false); }

  // Draw the current page with the typewriter cut-off: runs of normal and highlighted text as
  // separate Text objects laid out left to right, line by line.
  _renderDlgText() {
    if (!this.dlg || this.dlg.choices.length) return this._hideRich();
    const full = this._typeFull ?? '', shown = Math.floor(this._typeShown ?? 0);
    this._rich ??= [];
    this._lineH ??= (() => { this.dlgMeasure.setText('A\nA'); const h2 = this.dlgMeasure.height; this.dlgMeasure.setText('A'); return h2 - this.dlgMeasure.height; })();
    this._richRuns(this._rich, full, this.dlgText.x, this._dlgTop ?? this.dlgText.y, this._lineH, { ...FONT, fontSize: '9px' }, this._dlgBase ?? '#e8e8f0', 9501, shown);
    // "more" marker when this line has another page
    this.dlgMore ??= this.add.text(0, 0, '▼', { ...FONT, fontSize: '8px', color: '#ffb347' }).setOrigin(1, 0).setScrollFactor(0).setDepth(9502);
    const more = this._pages && this._page < this._pages.length - 1 && shown >= full.length;
    this.dlgMore.setVisible(!!more).setAlpha(0.6 + 0.4 * Math.sin(this.time.now / 150));
  }

  // The box grows upward to fit its content (measured against the FULL line, so the typewriter
  // never spills out), and choices stack inside it.
  _layoutDialogue(isChoices) {
    const W = VIEW.w, H = VIEW.h, bottom = H - 6;
    let h;
    if (isChoices) {
      h = 14 + (this._choiceHeader ? 12 : 0) + this.dlgChoices.filter((t) => t.visible).reduce((sum, t) => sum + t.height + 3, 0);
    } else {
      this.dlgMeasure.setText('A\nA\nA\nA');   // a full 4-line page: the box never jumps between lines
      h = 24 + this.dlgMeasure.height;
    }
    h = Math.max(60, Math.min(H - 40, Math.ceil(h)));
    const top = bottom - h;
    this.dlgBg.setSize(W - 40, h).setPosition(W / 2, top + h / 2);
    this.dlgBg.geom.setSize?.(W - 40, h); this.dlgBg.updateDisplayOrigin?.();
    this.dlgWho.setY(top + 6);
    this.dlgTimer?.setPosition(W - 30, top + 6);
    this.dlgText.setY(top + 17); this._dlgTop = top + 17;
    this.dlgMore?.setPosition(W - 30, top + h - 12);
    let y = top + 7 + (isChoices && this._choiceHeader ? 12 : 0);
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
        if (this.shared?.onMsg(msg, peer) || this.perf?.onHostMsg(peer, msg) || this.romance?.onHostMsg(peer, msg) || this.gear?.onHostMsg(peer, msg) || this.eggs?.onHostMsg(peer, msg) || this.approach?.onHostMsg(peer, msg)) return;
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
        if (msg.t === 'ability') this._raiseAbility(this._charOf(peer), msg.key);
        if (msg.t === 'equip') this._equip(this._charOf(peer), msg.id);
        if (msg.t === 'mate') this._mateBreak();
        if (msg.t === 'hotSel') this._setHot(this._charOf(peer), msg.i);
        if (msg.t === 'rest') this._restAtSave(peer, msg.obj);
        if (msg.t === 'use') { this._useWhat = msg.id ?? null; this._use(this._charOf(peer), peer); }
        if (msg.t === 'morph') this._morph(peer);
        if (msg.t === 'search') { const o = this.map.objects.find((x) => x.id === msg.id && x.loot); if (o) this._search(o, this._charOf(peer)); }
        if (msg.t === 'zip') { const o = this.map.objects.find((x) => x.id === msg.id && x.zip); if (o) this._zip(o); }
        if (msg.t === 'useSlot') { this._useSlot = msg.i | 0; this._use(this._charOf(peer), peer); }
        if (msg.t === 'move' && this.save.party[this._charOf(peer)]) { Inv.moveSlot(this.save.party[this._charOf(peer)], msg.a | 0, msg.b | 0, !!msg.half); this._syncParty(); }
        if (msg.t === 'buy') this._buy(this._charOf(peer), msg.shop, msg.idx);
        if (msg.t === 'sell') this._sell(this._charOf(peer), msg.slot | 0);
        if (msg.t === 'scooter') this._scooter(peer);
      });
      this.net.on('leave', (peer) => {
        // A roommate who drops out keeps walking with the party as a companion.
        const p = this.sim.players.get(peer); this.sim.removePlayer(peer);
        if (p) { this.sim.addPlayer(`ai:${p.character}`, p.character); const a = this.sim.players.get(`ai:${p.character}`); Object.assign(a, { x: p.x, y: p.y, hp: p.hp, rot: p.rot ?? 0, rotQuiet: p.rotQuiet ?? 0, analogCharm: p.analogCharm }); this.sim.setMods(a.id, playerMods(this.save.party[p.character], p.character)); }
      });
      this.time.addEvent({ delay: 50, loop: true, callback: () => this.net.broadcast({ t: 'snap', snap: this._lastSnap ?? this.sim.snapshot() }) });
      this.time.addEvent({ delay: 500, loop: true, callback: () => this._broadcastWorld() });
      this.net.on('join', () => { this._worldSig = null; });
    } else if (this.mode === 'client') {
      this.net.on('msg', (msg) => {
        if (this.shared?.onMsg(msg) || this.romance?.onClientMsg(msg) || this.cameos?.onClientMsg(msg) || this.crush?.onClientMsg(msg) || this.fart?.onClientMsg(msg)) return;
        if (msg.t === 'snap') { this.snapBuf.push({ at: performance.now(), snap: msg.snap }); if (this.snapBuf.length > 20) this.snapBuf.shift(); }
        if (msg.t === 'say') this._say(msg.text);
        if (msg.t === 'party') { this.save.party = msg.party; this.save.world.money = msg.money; this._refreshMenu(); }
        if (msg.t === 'world') this._applyWorld(msg);
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
    const hasTile = (k) => this.textures.exists(k);   // connected-tile frames, when the art provides them
    map.layout.forEach((row, ty) => [...row].forEach((ch, tx) => rt.draw(tileKey(ch, tx, ty, map.layout, hasTile), tx * TILE, ty * TILE)));
    const g = this.mapGfx = this.add.graphics().setDepth(-9);
    // Depth pass (task 13): contact shadow where floor meets wall. Lit from the top left, so walls cast
    // down onto the floor below them and right onto the floor beside them. Water and void are skipped.
    {
      const open = (x, y) => x >= 0 && y >= 0 && x < map.w && y < map.h && !map.solid(x, y) && !'~ '.includes(map.layout[y][x]);
      const wallAt = (x, y) => x >= 0 && y >= 0 && x < map.w && y < map.h && map.solid(x, y) && !map.doors?.has(`${x},${y}`) && map.layout[y][x] !== '~';
      for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
        if (!open(x, y)) continue;
        const px = x * TILE, py = y * TILE;
        if (wallAt(x, y - 1)) { g.fillStyle(0x000000, 0.34).fillRect(px, py, TILE, 2); g.fillStyle(0x000000, 0.16).fillRect(px, py + 2, TILE, 3); }
        if (wallAt(x - 1, y)) { g.fillStyle(0x000000, 0.22).fillRect(px, py, 2, TILE); g.fillStyle(0x000000, 0.1).fillRect(px + 2, py, 2, TILE); }
      }
      // Wall faces: a dark base where a wall meets the floor in front of it, and a thin lit edge on the
      // top of any wall that has floor above it (the cap catching the light).
      for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
        if (!wallAt(x, y)) continue;
        const px = x * TILE, py = y * TILE;
        if (open(x, y + 1)) { g.fillStyle(0x000000, 0.28).fillRect(px, py + TILE - 2, TILE, 2); g.fillStyle(0xffffff, 0.07).fillRect(px, py + 1, TILE, 1); }
        if (open(x, y - 1)) g.fillStyle(0xffffff, 0.12).fillRect(px, py, TILE, 1);
        if (open(x + 1, y) && !wallAt(x + 1, y)) g.fillStyle(0xffffff, 0.06).fillRect(px + TILE - 1, py, 1, TILE);
      }
      // Roads: worn centre-line paint, dashed, stopping at junctions (kerbs and gutters are tile art).
      for (const d of laneDashes(map.layout, TILE)) g.fillStyle(0xd8d0b8, 0.42).fillRect(d.x, d.y, d.w, d.h);
    }
    for (const im of this.propSprites ?? []) im.destroy();
    for (const t of this.propTimers ?? []) t.remove();
    this.propSprites = []; this.propTimers = []; this.propById = {};
    // Depth pass (task 13): striped awnings over shopfronts (map.awnings), drawn above anyone standing
    // under them, with their shade on the pavement below. Colours are palette names.
    for (const aw of map.awnings ?? []) {
      const PAL = { warm3: 0xb9853f, bone: 0xe8e2d0, screen0: 0x0f4a5c, steel: 0x7a8794, concrete2: 0x5b6862 };
      const [c1, c2] = aw.c.map((k) => PAL[k] ?? 0x7a8794), x0 = aw.x * TILE, y0 = aw.y * TILE - 6, w = aw.w * TILE;
      const shade = this.add.graphics().setDepth(-8); shade.fillStyle(0x000000, 0.28).fillRect(x0 + 2, y0 + 12, w, 5); this.propSprites.push(shade);
      const g = this.add.graphics().setDepth(aw.y * TILE + TILE + 2);
      for (let x = 0; x < w; x += 4) g.fillStyle((x / 4) % 2 ? c2 : c1).fillRect(x0 + x, y0, Math.min(4, w - x), 9);
      g.fillStyle(0x000000, 0.25).fillRect(x0, y0 + 6, w, 3);                          // the fold, in shadow
      for (let x = 0; x < w; x += 4) g.fillStyle((x / 4) % 2 ? c2 : c1).fillRect(x0 + x + 1, y0 + 9, 2, 2);   // scalloped hem
      g.fillStyle(0xffffff, 0.12).fillRect(x0, y0, w, 1);                              // lit top edge
      g.fillStyle(0x17142b).fillRect(x0 - 1, y0, 1, 10).fillRect(x0 + w, y0, 1, 10);     // frame ends
      this.propSprites.push(g);
    }
    // Depth pass (task 13): leaf canopies over trees that have open ground to their north, at the tree's
    // base depth, so anyone walking behind a tree is partly hidden by it (art: fg.canopy in props).
    if (this.textures.exists('props') && this.textures.get('props').has('fg.canopy')) {
      const open = (x, y) => y >= 0 && x >= 0 && x < map.w && !map.solid(x, y);
      map.layout.forEach((row, ty) => [...row].forEach((ch, tx) => {
        if (ch !== 'T' || !open(tx, ty - 1)) return;
        const frame = (tx * 7 + ty * 13) % 2 ? 'fg.canopy#1' : 'fg.canopy';
        this.propSprites.push(this.add.image(tx * TILE + 8, ty * TILE + TILE - 1, 'props', frame).setOrigin(0.5, 1).setDepth(ty * TILE + TILE - 2).setFlipX(((tx * 3 + ty) % 4) < 2));
      }));
    }
    for (const t of Object.values(this.leverLabels ?? {})) t.destroy(); this.leverLabels = {}; this.leverGfx?.clear();
    const props = this.textures.exists('props') ? this.textures.get('props') : null;
    for (const s of this.doorVis ?? []) s.vis.destroy();
    this.doorVis = [];
    // Depth pass (task 13): a soft contact shadow under everything that stands on the floor, offset a
    // little right and down as if lit from the top left. One graphics object per map, under the props.
    const propShadow = this.add.graphics().setDepth(3); this.propSprites.push(propShadow);
    const shadowUnder = (cx, by, w) => { propShadow.fillStyle(0x000000, 0.5).fillEllipse(cx + 1, by - 1, w, Math.max(3, Math.round(w / 4))); propShadow.fillStyle(0x000000, 0.28).fillEllipse(cx + 2, by, w + 4, Math.max(4, Math.round(w / 3))); };
    for (const o of map.objects) {
      if (o.romance || o.selfDrawn || o.lever) continue;     // drawn by src/game/romance.js / gear.js / _drawLevers
      const art = o.art ?? o.id;   // several objects can share one drawing
      if (o.door) {
        // Fable's door art when present (frames '<id>' and '<id>#open'); drawn placeholder otherwise.
        const artKey = o.art ?? o.id;
        // Doors sit inside their wall tile: 24px-tall art is fitted to the 16px tile so it never
        // pokes above the wall into the room behind.
        // Proper in-wall door art lives in the 16x16 'doors' sheet; older 24px prop art is squashed to fit.
        const sheet = this.textures.exists('doors') && this.textures.get('doors').has(artKey) ? 'doors' : props?.has(artKey) ? 'props' : null;
        const art = sheet ? this.add.image(o.x * TILE, o.y * TILE + TILE, sheet, artKey).setOrigin(0, 1).setDepth(o.floor ? 2 : o.y * TILE + TILE - 4) : null;
        if (art && art.height > TILE) art.setDisplaySize(TILE, TILE);
        const vis = art ?? this.add.graphics().setDepth(o.floor ? 2 : o.y * TILE + TILE - 4);
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
        const bim = this.add.image(o.x * TILE + TILE / 2, o.y * TILE + TILE, 'big', art).setOrigin(0.5, 1).setDepth(o.floor ? 2 : o.y * TILE + TILE - 4);
        if (!o.floor) shadowUnder(o.x * TILE + TILE / 2, o.y * TILE + TILE, 26);
        this.propSprites.push(bim); this.propById[o.id] = { im: bim, sheet: 'big', art };
        continue;
      }
      if (props?.has(art)) {
        // Hand-drawn prop: 16x24, standing on its tile. A "#1" frame means a slow two-frame loop.
        const im = this.add.image(o.x * TILE, o.y * TILE + TILE, 'props', art).setOrigin(0, 1).setDepth(o.floor ? 2 : o.y * TILE + TILE - 4);
        if (!o.floor && !o.npc) shadowUnder(o.x * TILE + TILE / 2, o.y * TILE + TILE, 12);
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
    // The whole area is on screen (the apartment, small rooms): the minimap adds nothing and would sit on the room.
    this.mapFits = mw <= vw && mh <= vh;
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

  // What each roommate has in hand: the selected hotbar slot for humans, the equipped weapon for AI.
  _heldKind(c, ai) {
    if (ai) return c.equipped?.weapon ? 'melee' : null;
    const def = ITEMS[c.inventory?.[c.hotSel ?? 0]?.id];
    return def?.slot === 'weapon' ? 'melee' : def?.slot === 'ranged' ? 'gun' : null;
  }
  _syncHeld() {
    if (this.mode === 'client') return;
    for (const p of this.sim.players.values()) p.held = this._heldKind(this.save.party[p.character], String(p.id).startsWith('ai:'));
  }
  // Select a hotbar slot (1-9 / wheel). A weapon or gun in that slot becomes the one you hold.
  selectHot(i) {
    const c = this.save.party[this.character]; if (!c) return;
    i = ((i % 9) + 9) % 9;
    this._hotFlash = { i, at: this.time.now };
    this._showHeldName(c.inventory[i]);
    if (this.mode === 'client') { c.hotSel = i; this.net.send({ t: 'hotSel', i }); return; }
    this._setHot(this.character, i);
  }
  _setHot(who, i) {
    const c = this.save.party[who]; if (!c) return;
    c.hotSel = Math.max(0, Math.min(8, i | 0));
    const def = ITEMS[c.inventory[c.hotSel]?.id];
    if (def && (def.slot === 'weapon' || def.slot === 'ranged') && canWear(def, who)) c.equipped[def.slot] = def === ITEMS[c.inventory[c.hotSel].id] ? c.inventory[c.hotSel].id : c.equipped[def.slot];
    this._syncParty();
  }
  // Minecraft-style: the name of what's now in your hand, just above the hotbar, fading after a moment.
  _showHeldName(it) {
    const h = this.hot; if (!h) return;
    const def = ITEMS[it?.id];
    this.heldName ??= this.add.text(VIEW.w / 2, h.y0 - 4, '', { ...FONT, fontSize: '8px', color: '#e8e8f0', stroke: '#0b0d16', strokeThickness: 3 }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(9003);
    this.tweens.killTweensOf(this.heldName);
    if (!def) { this.heldName.setAlpha(0); return; }
    this.heldName.setText(`${def.name}${it.qty > 1 ? ` ×${it.qty}` : ''}`).setColor(def.unique ? '#ffd27f' : '#e8e8f0').setAlpha(1);
    this.tweens.add({ targets: this.heldName, alpha: 0, delay: 1300, duration: 500 });
  }

  // Left click with a non-weapon in hand uses it (eat, throw, play, read), at most every 0.35 s.
  _useHeld() {
    const c = this.save.party[this.character]; if (!c) return false;
    const it = c.inventory[c.hotSel ?? 0], def = ITEMS[it?.id];
    if (!def || def.slot === 'weapon' || def.slot === 'ranged') return false;
    if (this.time.now - (this._heldUseAt ?? 0) < 350) return true;
    this._heldUseAt = this.time.now;
    this.menuUseSlot(c.hotSel ?? 0);
    return true;
  }

  // Host -> clients: flags and quest progress, whenever they change (checked twice a second).
  _broadcastWorld() {
    if (this.mode !== 'host') return;
    const msg = { t: 'world', flags: this.save.flags, quests: questState(this.save), guide: this._guide() };
    const sig = JSON.stringify(msg);
    if (sig === this._worldSig) return;
    this._worldSig = sig; this.net.broadcast(msg);
  }
  _applyWorld(msg) {
    const before = questState(this.save), was = JSON.parse(JSON.stringify(before));
    Object.assign(this.save.flags, msg.flags ?? {});
    if (msg.guide) this.save.world.guide = msg.guide;
    this._drawLevers();
    this.save.world.quests = msg.quests ?? this.save.world.quests;
    const now = questState(this.save);
    for (const q of QUESTS) {
      const a = was[q.id] ?? {}, b = now[q.id]; if (!b || !questVisible(q, this.character)) continue;
      if (!a.started && b.started && !b.done) { this._questBanner('NEW QUEST', q.title, [q.stages[b.stage]?.text, q.why].filter(Boolean).join('\n')); this._trackedQuest = q.id; }
      else if (b.started && !b.done && b.stage > (a.stage ?? 0)) this._questBanner('QUEST UPDATED', q.title, q.stages[b.stage]?.text ?? '');
      if (!a.done && b.done) { this._questBanner('QUEST COMPLETE', q.title, [q.reward?.money ? `+$${q.reward.money}` : '', q.reward?.xp ? `+${q.reward.xp} xp` : ''].filter(Boolean).join('   ')); if (q.reward?.line) this._say(q.reward.line); }
    }
    this._refreshMenu();
  }

  // Field guide (Terraria's bestiary): enemies unlock on sight, NPCs when you talk to them; kills reveal more.
  _guide() { const g = (this.save.world.guide ??= {}); g.e ??= {}; g.n ??= {}; return g; }
  _tickGuide() {
    if (this.mode === 'client' || (this._guideT = (this._guideT ?? 0) + 1) % 30) return;
    const g = this._guide();
    for (const e of this.sim.enemies.values()) {
      if (g.e[e.kind]) continue;
      for (const p of this.sim.players.values()) if (Math.hypot(p.x - e.x, p.y - e.y) < 150) {
        g.e[e.kind] = { seen: 1, kills: 0, name: e.def?.name };
        if (p.id === this.localId || !isAi(p.id)) this._toast(`New in the field guide: ${e.def?.name ?? e.kind} [ESC → GUIDE]`);
        break;
      }
    }
  }

  // The casino board game (task #27). Any map object with `boardgame: '<opponent>'` opens it; the result
  // sets lattice.played / lattice.won (and lattice.won.<opponent id>) for the story. ?lattice opens it at once.
  openBoardGame(opponent = 'The Dealer', id = 'dealer', onEnd = null) {
    if (this.boardGame && !this.boardGame.closed) return;
    this.boardGame = new BoardGame(this, { opponent, seed: `${this.save.world.seed}:${id}:${this.save.flags[`lattice.games.${id}`] ?? 0}`, onEnd: (won) => {
      this._flag('lattice.played', true); this._flag(`lattice.games.${id}`, Number(this.save.flags[`lattice.games.${id}`] ?? 0) + 1);
      if (won) { this._flag('lattice.won', true); this._flag(`lattice.won.${id}`, true); }
      onEnd?.(won);
    } });
  }

  _syncParty() {
    this._syncHeld();
    if (this.mode !== 'client' && !this.save.flags['q.armed'] && Object.values(this.save.party).some((c) => c.equipped?.weapon)) this.save.flags['q.armed'] = true;   // armed any way at all
    for (const p of this.sim.players.values()) {
      const c = this.save.party[p.character];
      this.sim.setMods(p.id, playerMods(c, p.character));
      p.analogCharm = !!ITEMS[c.equipped?.charm]?.analog;
    }
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
    if (i < 0 || !c.inventory[i] || !(ITEMS[c.inventory[i].id]?.heal || ITEMS[c.inventory[i].id]?.caffeine)) return;
    const usedId = c.inventory[i].id;
    const it = ITEMS[Inv.takeSlot(c, i)];
    if (it.caffeine) { this.sim.caffeinate(peerId, it.caffeine); this._toast(`${who} slams the ${it.name.toLowerCase()}. Wide awake for ${it.caffeine}s.`); this._syncParty(); return; }   // D-017
    const healAmt = Math.round((it.heal ?? 0) * (usedId === 'item.mate_flask' ? 1 + (playerMods(c, who).mateHeal ?? 0) : 1));   // mate holster
    this.sim.heal(peerId, healAmt);
    if (it.pill) {
      const p = this.sim.players.get(peerId);
      if (p) { p.pillT = it.pill; p.sta = 999; p.staT = 0; }   // the sim clamps stamina to its max on the next step
      const line = { manuel: 'Manuel takes the blue pill. "For stamina. It says so on the box."', trevor: 'Trevor takes the blue pill and logs it in a spreadsheet.', michael: 'Michael takes the blue pill. "Nobody tell her."' }[who] ?? `${who} takes the blue pill.`;
      this._toast(`${line} Dodges are free for ${it.pill}s.`);
      this._syncParty(); return;
    }
    this._toast(`${who} has the ${it.name.toLowerCase()}. +${healAmt} HP`);
    this._syncParty();
  }

  // ---------- in-game menu (src/game/ui/GameMenu.js) ----------
  get menu() { return this.gameMenu?.tab ?? (this.puzzle && !this.puzzle.closed ? 'puzzle' : this.boardGame && !this.boardGame.closed ? 'lattice' : null); }
  _makeMenu() {
    this.gameMenu = new GameMenu(this);
    const kb = this.input.keyboard;
    kb.on('keydown-ESC', () => { if (this.dlg) return; if (this.gameMenu?.held != null) { this.gameMenu.held = null; this.gameMenu.refresh(); return; } if (this.puzzle && !this.puzzle.closed) { this.puzzle.destroy(); this.puzzle = null; return; } this.menu ? this._closeMenu() : this.gameMenu.show('inventory'); });
    kb.on('keydown-I', () => { if (!this.dlg) this.menu === 'inventory' ? this._closeMenu() : this.gameMenu.show('inventory'); });
    kb.on('keydown-K', () => { if (!this.dlg) this.menu === 'skills' ? this._closeMenu() : this.gameMenu.show('skills'); });
    kb.on('keydown-J', () => { if (!this.dlg) this.menu === 'quests' ? this._closeMenu() : this.gameMenu.show('quests'); });
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
    if (def.slot === 'instrument') return this.perf.use(id);
    if (def.throwable) return this.perf.throwPotion(id);
    if (def.slot === 'gift') return this._say(`${def.name}\n${def.text}\n\n(A gift. Hand it over by talking to someone.)`);
    if (def.slot === 'junk') return this._say(`${def.name}\n${def.text}`);
    if (def.slot === 'consumable') { if (this.mode === 'client') this.net.send({ t: 'use', id }); else { this._useWhat = id; this._use(this.character, this.localId); } return; }
    if (this.mode === 'client') this.net.send({ t: 'equip', id }); else this._equip(this.character, id);
  }
  // Slot actions (inventory grid + hotbar). Host-authoritative like everything else.
  menuUseSlot(i) {
    const c = this.save.party[this.character], it = c?.inventory[i]; if (!it) return;
    this._hotFlash = { i, at: this.time.now };
    const def = ITEMS[it.id]; if (!def) return;
    if (def.throwable) return this.menuUse(it.id);
    if (def.slot === 'consumable') {
      if (this.mode === 'client') this.net.send({ t: 'useSlot', i }); else { this._useSlot = i; this._use(this.character, this.localId); }
      return;
    }
    if ([...EQUIP_SLOTS, 'instrument', 'gift'].includes(def.slot)) return this.menuUse(it.id);
    if (def.slot === 'junk' || def.slot === 'key') this._say(`${def.name}\n${def.text}`);
  }
  menuMove(a, b, half) { if (this.mode === 'client') this.net.send({ t: 'move', a, b, half }); else { Inv.moveSlot(this.save.party[this.character], a, b, half); this._syncParty(); } }
  // Manuel's Haggler's Eye: the best haggler in the party gets everyone the discount.
  priceFor(who, base) { const h = Math.max(0, ...Object.entries(this.save.party).map(([k, c]) => playerMods(c, k).haggle ?? 0)); return Math.max(1, Math.round(base * (1 - h))); }
  menuSell(slot) { if (this.mode === 'client') this.net.send({ t: 'sell', slot }); else this._sell(this.character, slot); }
  _sell(who, slot) {
    const c = this.save.party[who], it = c?.inventory[slot]; if (!it) return;
    if (Object.values(c.equipped || {}).includes(it.id) && Inv.count(c, it.id) <= 1) return this._toast('Take it off first.');
    const price = sellPrice(it.id); if (!price) return this._toast('Wick won\'t take that.');
    Inv.takeSlot(c, slot); this.save.world.money = (this.save.world.money ?? 0) + price;
    sfx('pickup'); this._toast(`Sold: ${ITEMS[it.id]?.name} (+$${price})`); this._syncParty();
  }
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
  menuAbility(key) { if (this.mode === 'client') this.net.send({ t: 'ability', key }); else this._raiseAbility(this.character, key); }
  _raiseAbility(who, key) {
    const c = this.save.party[who];
    if (!c || !(c.abilityPoints > 0) || !ABILITY_KEYS.includes(key)) return;
    c.abilities ??= { ...(BASE_SCORES[who] ?? {}) };
    if ((c.abilities[key] ?? 10) >= MAX_SCORE) return;
    c.abilities[key] = (c.abilities[key] ?? 10) + 1; c.abilityPoints--;
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
    if (!c || !def || !Inv.has(c, id) || !EQUIP_SLOTS.includes(def.slot)) return;
    if (!canWear(def, who)) return this._announce(`${def.name}: only ${def.owner[0].toUpperCase() + def.owner.slice(1)} can wear that.`);
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
      'CONTINUITY: Resident of ASTER 631. Noted.', 'CONTINUITY: Please do not look directly at the light.', 'CONTINUITY: Your curfew is a suggestion. For now.',
      'CONTINUITY: A containment review for the College Park service area is scheduled. Things are stable.', 'CONTINUITY: Coderot exposure in this sector is within tolerance. Tolerance has been revised.'];
    // The containment-review line is the stakes setup: always the 2nd scan, never after the outbreak is contained.
    const contained = !!this.save.flags['act1.outbreak.contained'], review = LINES[LINES.length - 2];
    const pool = contained ? LINES.filter((l) => l !== review) : LINES;
    this._toast(n === 2 && !contained ? review : pool[(n - 1) % pool.length]);
  }

  // Recurring people (human note: "memorable characters"): an NPC's `later` list holds lines for
  // after story beats, [{ if: '<condition>', text }]. The LAST entry whose condition holds wins, so
  // list them in story order. Conditions use the dialogue evaluator (flags, &&, not, money...).
  _sayLater(near) {
    if (!near.later?.length) return false;
    const ctx = this._dialogueCtx();
    const hit = [...near.later].reverse().find((l) => evalCond(l.if, ctx));
    if (!hit) return false;
    this._say(`${near.label.toUpperCase()}\n${hit.text}`);
    return true;
  }

  // Hidden mechanic (fast travel): ziplines. E at an anchor and the party rides the cable to the
  // other end. The first ride is a secret. Host-authoritative: the sim positions move.
  _zip(o) {
    if (this.mode === 'client') { this.net.send({ t: 'zip', id: o.id }); return; }
    if (this._zipping) return;
    const [tx, ty] = o.zip, x1 = tx * TILE + 8, y1 = ty * TILE + 8;
    const riders = [...this.sim.players.values()].filter((p) => !p.downed);
    const from = riders.map((p) => ({ p, x: p.x, y: p.y }));
    this._zipping = true; sfx('swing');
    if (!this.save.flags['secrets.zipline.found']) { this._flag('secrets.zipline.found', true); this._toast('★ Secret: the zipline (fast travel across the plaza)'); }
    const t0 = this.time.now, dur = 1400;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => {
      const k = Math.min(1, (this.time.now - t0) / dur), e = k * k * (3 - 2 * k);
      from.forEach(({ p, x, y }, i) => { p.x = x + (x1 + (i - 1) * 10 - x) * e; p.y = y + (y1 - y) * e - Math.sin(Math.PI * k) * 6; p.vx = p.vy = 0; });
      if (k >= 1) { tick.remove(); this._zipping = false; }
    } });
  }

  // Easter egg (docs/SECRETS.md, real-life lore from Manuel): the purple cylinder. One searchable
  // container in the world is hiding it. Whoever finds it hides it again somewhere else, so it is
  // never in the same place twice, and it turns up even in a container that is already picked clean.
  // Text only; it is a plain purple cylinder and nothing is drawn (D-015).
  _cylinderSpots() {
    return (this._cylSpots ??= Object.values(MAPS).flatMap((m) => m.objects.filter((x) => x.loot).map((x) => ({ map: m.id, id: x.id, where: m.name ?? m.id }))));
  }
  _cylinderSpot(n = Number(this.save.flags['secrets.cylinder.moves'] || 0)) {
    const spots = this._cylinderSpots(); if (!spots.length) return null;
    const pick = (k) => Math.floor(new Rng(`${this.save.world.seed}:cylinder:${k}`).next() * spots.length);
    let i = pick(n);
    if (n > 0 && i === pick(n - 1)) i = (i + 1) % spots.length;   // never hidden back in the place it was just found
    return spots[i];
  }
  _cylinderHere(o) { const s = this._cylinderSpot(); return !!s && s.map === this.map.id && s.id === o.id; }
  _findCylinder(who) {
    const f = this.save.flags, n = Number(f['secrets.cylinder.moves'] || 0) + 1;
    this._flag('secrets.cylinder.moves', n); this._flag('secrets.cylinder.found', true);
    this._flag(`secrets.cylinder.by.${who}`, Number(f[`secrets.cylinder.by.${who}`] || 0) + 1);
    const line = {
      manuel: 'MANUEL: "I cast that. Two-part silicone. It came out of the mold perfect and I have regretted nothing."',
      trevor: 'TREVOR: "Why is it warm."',
      michael: 'MICHAEL: "I\'m not touching it." He is already holding it.',
    }[who] ?? '';
    const next = this._cylinderSpot(n);
    const tally = ['manuel', 'trevor', 'michael'].map((k) => `${k[0].toUpperCase()}${k.slice(1)} ${Number(f[`secrets.cylinder.by.${k}`] || 0)}`).join(' · ');
    return `\n\nUnderneath everything else: the purple cylinder. Cast silicone, a little dusty, exactly the shape you remember.\n${line}\nHouse rule: whoever finds it hides it again. It goes somewhere worse${next ? `, out by ${next.where}` : ''}.\nFound so far: ${tally}`;
  }

  // Procedural loot: search a container once; what's inside is seeded by the world seed + object id.
  _search(o, who = this.character) {
    if (this.mode === 'client') { this.net.send({ t: 'search', id: o.id }); return; }
    const key = `loot.${this.map.id}.${o.id}`, base = o.text ?? o.label;
    const cyl = this._cylinderHere(o) ? this._findCylinder(who) : '';
    if (this.save.flags[key]) return this._say(`${base}\n\nPicked clean.${cyl}`);
    const L = LOOT[o.loot]; if (!L) return this._say(base);
    this._flag(key, true);
    const rng = new Rng(`${this.save.world.seed}:${key}`);
    const total = L.table.reduce((t, e) => t + e[1], 0), got = new Map();
    for (let i = 0; i < L.rolls; i++) {
      let r = rng.next() * total; const [id, , lo, hi] = L.table.find((e) => (r -= e[1]) < 0) ?? L.table[0];
      got.set(id, (got.get(id) ?? 0) + lo + Math.floor(rng.next() * (hi - lo + 1)));
    }
    const c = this.save.party[L.to ?? who], parts = [];   // L.to: it belongs to one roommate, whoever opens it
    for (const [id, n] of got) {
      if (id === 'money') { this.save.world.money = (this.save.world.money ?? 0) + n; parts.push(`$${n}`); }
      else { Inv.add(c, id, n); parts.push(`${ITEMS[id]?.name ?? id}${n > 1 ? ' ×' + n : ''}`); }
    }
    this._partyDirty = true; this._syncParty?.(); sfx('pickup');
    const into = L.to && L.to !== who ? `Into ${L.to[0].toUpperCase()}${L.to.slice(1)}'s bag` : 'You find';
    this._say(`${base}\n\n${into}: ${parts.join(', ')}.${cyl}`);
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
        if (!Inv.remove(c, q.give.item)) {
          // Empty-handed: the reminder, then on the next press whatever they have to say about the story
          // so far (`later`), alternating. Otherwise an open hand-in quest silences the giver for good.
          const turn = ((this._refuseTurn ??= {})[near.id] = !this._refuseTurn[near.id]);
          if (!turn && this._sayLater(near)) return true;
          this._say(`${who}\n${q.give.refuse ?? '...'}`); return true;
        } this._flag(q.give.flag, true); this._syncParty(); this._tickQuests(true); return true;
      }
      if (q.report && f[q.report.needs] && !f[q.report.flag]) { this._flag(q.report.flag, true); this._tickQuests(true); return true; }
    }
    return false;
  }

  _tickQuests(force = false) {
    if (this.mode === 'client') return;   // the host advances quests; clients get them in 'world' syncs
    if (!force && (this._qT = (this._qT ?? 0) + 1) % 60) return;
    const f = this.save.flags, qs = questState(this.save);
    for (const q of QUESTS) {
      const st = qs[q.id];
      if (st.done) continue;
      const mine = questVisible(q, this.character);
      if (!st.started && q.start?.(f)) { st.started = true; if (mine) { this._questBanner('NEW QUEST', q.title, [q.stages[0]?.text, q.why].filter(Boolean).join('\n')); this._trackedQuest = q.id; } }
      if (!st.started) continue;
      while (st.stage < q.stages.length && q.stages[st.stage].done(f, this.save)) {
        st.stage++;
        if (st.stage < q.stages.length && mine) { this._questBanner('QUEST UPDATED', q.title, q.stages[st.stage].text); this._trackedQuest = q.id; }
      }
      if (st.stage >= q.stages.length) {
        st.done = true;
        if (this.mode !== 'client') { this.save.world.money = (this.save.world.money ?? 0) + (q.reward?.money ?? 0); for (const [who, c] of Object.entries(this.save.party)) if (questVisible(q, who)) c.xp += q.reward?.xp ?? 0; if (q.reward?.item) Inv.add(this.save.party[q.owner ?? this.character], q.reward.item); this._partyDirty = true; }
        if (mine) this._questBanner('QUEST COMPLETE', q.title, [q.reward?.money ? `+$${q.reward.money}` : '', q.reward?.xp ? `+${q.reward.xp} xp` : '', q.reward?.item ? ITEMS[q.reward.item]?.name : ''].filter(Boolean).join('   '));
        if (this._trackedQuest === q.id) this._trackedQuest = null;
        if (q.reward?.line && mine) this._say(q.reward.line);
      }
    }
  }

  // Quest banners: top centre, slide in, queued so none are lost. Gold heading, plain detail.
  // Side-view cutscene (CinematicScene) over a paused world; resumes when it ends or is skipped.
  async playCinematic(name, onDone) {
    let mod;
    try { mod = await import(`../../content/cinematics/${name}.js`); } catch { console.info(`[cinematic] none named ${name}`); return onDone?.(); }
    const ctx = { flags: this.save.flags, character: this.character, present: this.humanRoommates?.() ?? [this.character] };
    this.scene.pause();
    this.scene.launch('Cinematic', { cine: mod.default, ctx, onDone: () => { this.scene.resume(); onDone?.(); } });
    this.scene.bringToTop('Cinematic');
  }

  // First-time controls card (shown once per save, after the cold open). Click to close, like quest cards.
  _controlsHint() {
    if (this.save.flags['tut.controls']) return;
    this._flag('tut.controls', true);
    this._questBanner('HOW TO PLAY', 'Controls', CONTROLS_TEXT);
  }

  _questBanner(kind, title, detail) {
    (this._qbQueue ??= []).push({ kind, title, detail });
    if (!this._qbBusy) this._nextQuestBanner();
  }

  _nextQuestBanner() {
    const b = this._qbQueue?.shift(); if (!b) { this._qbBusy = false; return; }
    this._qbBusy = true;
    const W = VIEW.w, w = 230, x = W / 2, y0 = -40, y1 = 26;
    const done = b.kind === 'QUEST COMPLETE';
    const c = this.add.container(x, y0).setScrollFactor(0).setDepth(9400);
    const head = this.add.text(0, 6, b.kind, { heading: true, fontSize: '7px', color: done ? '#7fb069' : '#ffb347' }).setOrigin(0.5, 0);
    const title = this.add.text(0, 15, b.title, { heading: true, fontSize: '11px', color: '#ffd27f' }).setOrigin(0.5, 0);
    // NEW QUEST / QUEST UPDATED: the first line is the objective (quest colour), the rest is context.
    const [objLine, ...rest] = String(b.detail ?? '').split('\n');
    const objective = !done && b.detail;
    const det = this.add.text(0, 30, objective ? objLine : (b.detail ?? ''), { ...FONT, fontSize: '8px', color: objective ? HI.quest : '#e8e8f0', align: 'center', wordWrap: { width: w - 16 } }).setOrigin(0.5, 0);
    if (objective && rest.length) { const more = this.add.text(0, 30 + det.height + 2, rest.join('\n'), { ...FONT, fontSize: '8px', color: '#c9cde0', align: 'center', wordWrap: { width: w - 16 } }).setOrigin(0.5, 0); det.setData('more', more); }
    // New quests and quest updates stay up until clicked (Trevor); completions slide away on their own.
    const sticky = b.kind === 'NEW QUEST' || b.kind === 'QUEST UPDATED' || b.kind === 'HOW TO PLAY';   // click to close (Trevor)
    const more = det.getData('more'), detH = b.detail ? det.height + (more ? more.height + 2 : 0) + 4 : 0;
    const hint = sticky ? this.add.text(0, 30 + detH, 'click or E to close', { ...FONT, fontSize: '7px', color: '#9aa3c7' }).setOrigin(0.5, 0) : null;
    const h = 36 + detH + (sticky ? 10 : 0);
    const bg = this.add.graphics();
    bg.fillStyle(0x0b0d16, 0.92).fillRoundedRect(-w / 2, 0, w, h, 4).lineStyle(1, done ? 0x7fb069 : 0xffb347, 0.9).strokeRoundedRect(-w / 2, 0, w, h, 4);
    c.add([bg, head, title, det, ...(more ? [more] : []), ...(hint ? [hint] : [])]);
    sfx(done ? 'pickup' : 'swing');
    this.tweens.add({ targets: c, y: y1, duration: 260, ease: 'Back.out' });
    const leave = () => { this._qbSticky = null; this.tweens.add({ targets: c, y: y0 - h, alpha: 0, duration: 260, onComplete: () => { c.destroy(); this._nextQuestBanner(); } }); };
    if (sticky) this._qbSticky = { x0: x - w / 2, x1: x + w / 2, y0: y1, y1: y1 + h, leave };
    else this.time.delayedCall(3400, leave);
  }

  // The objective you're working on, always on screen (main quest unless a side quest just moved).
  _trackedObjective() {
    const qs = questState(this.save);
    const pick = (id) => { const q = QUESTS.find((x) => x.id === id), st = q && qs[q.id]; return q && st?.started && !st.done ? `· ${q.stages[st.stage]?.text ?? ''}` : null; };
    return pick(this._trackedQuest) ?? pick(QUESTS.find((q) => q.main)?.id) ?? '';
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
      return this._say('The third bust turns to face the flag. For a second the whole room feels like it\'s being looked at, from three directions, kindly. Something small and porcelain is lying on the floor that wasn\'t there before. (Porcelain John Pork pin)');
    }
    this._say(`You turn it to face the flag. (${seq.length} of 3)`);
  }

  // Puzzle state shows in the art: busts turned toward the flag, the hallway clock face swung open.
  // Switchyard levers drawn so you can see which way each is thrown (Trevor): a base plate and a
  // handle leaning LEFT or RIGHT, with the letter above. Redrawn whenever a lever moves.
  _drawLevers() {
    const levers = this.map.objects.filter((o) => o.lever);
    if (!levers.length) { this.leverGfx?.clear(); return; }
    this.leverGfx ??= this.add.graphics();
    this.leverLabels ??= {};
    const g = this.leverGfx.clear();
    for (const o of levers) {
      const right = (this.save.flags[`act1.switch.${o.lever}`] ?? 'left') === 'right';
      const bx = o.x * TILE + 8, by = o.y * TILE + 13;
      g.setDepth(by);
      g.fillStyle(0x2a2d3a).fillRect(bx - 6, by - 2, 12, 4);                     // base plate
      g.fillStyle(0x4a4f63).fillRect(bx - 2, by - 4, 4, 3);                      // pivot
      const tx = bx + (right ? 7 : -7), ty = by - 13;
      g.lineStyle(2, 0xb8bcc8).lineBetween(bx, by - 3, tx, ty);                 // handle
      g.fillStyle(right ? 0x7fb069 : 0xffb347).fillCircle(tx, ty, 2.5);         // knob
      const lab = (this.leverLabels[o.id] ??= this.add.text(0, 0, '', { ...FONT, fontSize: '6px', color: '#e8e8f0', stroke: '#0b0d16', strokeThickness: 2 }).setOrigin(0.5, 1));
      lab.setText(`${o.lever.toUpperCase()} ${right ? '▶' : '◀'}`).setPosition(bx, by - 17).setDepth(by + 1);
    }
  }

  _refreshPuzzleProps() {
    const f = this.save.flags, seq = (f['puz.busts.seq'] ?? '').split(',');
    this._drawLevers();
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
    this._drawLevers();
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
      this.save.flags['act1.boss.defeated'] = true; this.save.flags['act1.outbreak.contained'] = true;   // scene 07: the boss falling contains the outbreak (Act 2 reads this)
      this._announce('You answer. The drumming stops mid-beat. The tall wooden figure tilts its head, listening to something only it can hear, and walks back into the dark.');
      // The sim clears its event list at the start of every step, so the 'kill' event answerSahur()
      // pushes from this key handler never reaches _fx. Start the ending from here instead.
      if (!this._endingPlayed) { this._endingPlayed = true; this.time.delayedCall(2600, () => { this._closeSayAll(); this._playEnding(true); }); }
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
    this.mapLabel = this.add.text(6, 4, '', { ...FONT, color: '#9aa3c7', backgroundColor: 'rgba(11,13,22,0.72)', padding: { x: 3, y: 1 } }).setScrollFactor(0).setDepth(9000);   // backed, so it reads over wall props
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
    const sel = c.hotSel ?? 0;
    const sig = JSON.stringify([c.inventory.slice(0, 9), c.equipped, hide, flash, sel]);
    if (sig === h.sig) return;
    h.sig = sig;
    h.g.clear(); h.g.setVisible(!hide);
    const eq = new Set(Object.values(c.equipped || {}));
    for (let i = 0; i < 9; i++) {
      const x = h.x0 + i * (h.S + 2), it = c.inventory[i];
      h.g.fillStyle(i === flash ? 0x3a3150 : 0x0b0d16, 0.85).fillRect(x, h.y0, h.S, h.S);
      h.g.lineStyle(1, it && eq.has(it.id) ? 0x7fb069 : 0x5d6487, 0.9).strokeRect(x + 0.5, h.y0 + 0.5, h.S - 1, h.S - 1);
      if (i === sel) h.g.lineStyle(2, 0xffd27f, 1).strokeRect(x - 0.5, h.y0 - 0.5, h.S + 1, h.S + 1);   // in hand
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

  _save(message = '✓ saved') {
    if (this.mode === 'client') return;
    this._toast('saving…');
    autosave(this.save).then(() => this._toast(message));
  }

  _restAtSave(peer, objectId) {
    if (this.mode === 'client') return;
    const actor = this.sim.players.get(peer), bed = this.sim.map.objects.find((o) => o.id === objectId && o.action === 'save');
    if (!actor || !bed || this.sim.map.id !== 'room631'
      || Math.hypot(actor.x - (bed.x * TILE + 8), actor.y - (bed.y * TILE + 8)) > 34) return;
    const rested = this.sim.restAtSave(peer, objectId);
    for (const p of this.sim.players.values()) this.save.party[p.character].rot = p.rot ?? 0;
    this._save(rested ? '✓ saved · rest eased the code rot' : '✓ saved');
    if (peer !== this.localId) this.net?.send(peer, { t: 'say', text: rested ? 'Rested. Code rot exposure halved.' : '✓ saved' });
  }

  // Descriptions stay up until E or a click outside the box.
  // The say box grows upward to fit its text (object descriptions, quest lines, hints), like the
  // dialogue box; past ~60% of the screen it caps and the font steps down a size.
  // The say box (object text, quest pitches, hints): same text size always, paged at 6 lines;
  // E or a click turns the page, and closes it after the last one.
  _say(text) {
    const W = VIEW.w, H = VIEW.h, bottom = H - 5;
    this._sayPages = this._paginate(tr(String(text ?? '')), this.boxText, 6); this._sayPage = 0;   // translate before wrapping
    this.boxText.setText(this._sayPages[0] + (this._sayPages.length > 1 ? `   ▼ 1/${this._sayPages.length}` : '')).setVisible(true).setAlpha(0);
    const h = Math.max(34, this.boxText.height + 14);
    this.box.setSize(W - 20, h).setPosition(W / 2, bottom - h / 2).setVisible(true);
    this.box.geom?.setSize?.(W - 20, h); this.box.updateDisplayOrigin?.();
    this.boxText.setY(bottom - h + 7);
    this.sayOpen = true;
    this._drawSayRich();
  }
  _drawSayRich() {
    this._sayRich ??= [];
    if (!this.sayOpen && !this.boxText.visible) { for (const t of this._sayRich) t.setVisible(false); return; }
    this._sayLineH ??= (() => { const m = this.add.text(0, 0, 'A\nA', { ...FONT, fontSize: '8px' }).setVisible(false); const h2 = m.height; m.setText('A'); const h = h2 - m.height; m.destroy(); return h; })();
    this._richRuns(this._sayRich, this.boxText.text, this.boxText.x, this.boxText.y, this._sayLineH, { ...FONT, fontSize: '8px' }, '#e8e8f0', 9002);
  }
  _closeSayAll() { this._sayPages = null; this.box.setVisible(false); this.boxText.setVisible(false); this.sayOpen = false; this._drawSayRich(); }
  _closeSay() {
    if (this._sayPages && this._sayPage < this._sayPages.length - 1) {   // next page first
      this._sayPage++;
      const n = this._sayPages.length, last = this._sayPage === n - 1;
      this.boxText.setText(this._sayPages[this._sayPage] + (last ? '' : `   ▼ ${this._sayPage + 1}/${n}`));
      this._drawSayRich();
      return;
    }
    this._closeSayAll();
  }

  _objectAt(wx, wy) {
    return this.map.objects.find((o) => wx >= o.x * TILE - 2 && wx < o.x * TILE + TILE + 2 && wy >= o.y * TILE - 2 && wy < o.y * TILE + TILE + 2);
  }

  _onClick(ptr) {
    if (!this.ready || ptr.button !== 0) return;
    const { x: sx, y: sy } = toView(ptr);
    const qb = this._qbSticky;
    if (qb && sx >= qb.x0 && sx <= qb.x1 && sy >= qb.y0 && sy <= qb.y1) { this.input2.blockAttack = true; qb.leave(); return; }
    if (this.dlg) {
      this.input2.blockAttack = true;
      return;   // clicks never advance dialogue (E does); choices are clicked directly
    }
    if (this.menu) {
      this.input2.blockAttack = true;
      if (this.menu !== 'puzzle' && this.menu !== 'lattice' && !this.gameMenu.contains(sx, sy)) this._closeMenu();
      return;
    }
    if (!this.sayOpen && !this.dlg && !this.menu && this._useHeld()) { this.input2.blockAttack = true; return; }
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
      this._tickGuide();
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
        this.sim.step(STEP, inputs);   // dialogue never pauses combat (Trevor); levels keep enemies away from scenes instead
        events = events.concat(this.sim.events);
        this.acc -= STEP; first = false;
      }
      this._handleInteract(me);
      for (const p of this.sim.players.values()) this.save.party[p.character].rot = p.rot ?? 0;
      this._hostEvents(events);
      snap = this._lastSnap = { ...this.sim.snapshot(), events, doors: [...this.map.doors.values()].filter((d) => d.open).map((d) => d.id) };
    }
    if (snap.map !== this.map.id && MAPS[snap.map]) { this._showMap(MAPS[snap.map]); this._onEnterMap(MAPS[snap.map]); if (this.mode === 'client') this.cameras.main.fadeIn(220, 5, 6, 12); }
    this._lastRendered = snap;
    if (this.mode === 'client' && snap.doors) for (const d of this.map.doors.values()) d.open = snap.doors.includes(d.id);
    this._render(snap);
    setInstrumentFocus(snap, this.localId);
    this.perf?.update(snap, deltaMs / 1000); this.romance?.update(snap, deltaMs / 1000); this.gear?.update(snap); this.eggs?.update(); this.crush?.update(snap); this.fart?.update(snap); this.pacifier?.update(snap);
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
        if (ev.kind) { const g = this._guide().e[ev.kind] ??= { seen: 1, kills: 0 }; g.kills++; }
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
            c.xp -= c.level * XP_PER_LEVEL; c.level++; c.skillPoints++; c.abilityPoints = (c.abilityPoints ?? 0) + 2;   // D-017
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

  _spawnBot() {
    if (this.mode === 'client' || !this.save.flags['q.bot.built'] || this.sim.allies?.length) return;
    const owner = [...this.sim.players.values()].find((p) => p.character === 'trevor') ?? this.sim.players.get(this.localId);
    if (owner) this.sim.addAlly({ owner: owner.id, x: owner.x - 12, y: owner.y + 10, kind: 'bot' });
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
    for (const o of this.map.objects) { if (o.goneFlag && this.save.flags[o.goneFlag]) { this.propById?.[o.id]?.im.setVisible(false); continue; } const d = Math.hypot(o.x * TILE + 8 - me.x, o.y * TILE + 8 - me.y); if (d <= nd) { nd = d; nearest = o; } }
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
    if (near.npc && this.mode !== 'client') this._guide().n[near.id] ??= { name: near.label.replace(/\s*\(.*\)\s*/g, '').trim(), where: this.map.name ?? this.map.id };
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
    if (near.npc && this.perf?.asleep(near)) { this._say(`${near.label} is fast asleep.`); return; }
    if (this.romance?.interact(near) || this.gear?.interact(near)) return;
    if (this.approach?.intercept(near)) return;   // D-017: choose how to approach an NPC
    // Story first, quest second: the first talk plays the scene; after that a quest step (pitch,
    // hand-in, report) takes the interaction if one is waiting, otherwise the scene replays.
    if (near.talk && near.npc) {
      const met = `met.${near.id}`;
      if (this.save.flags[met] && this._questInteract(near)) return;
      if (this.save.flags[met] && this._sayLater(near)) return;
      if (!this.save.flags[met]) this._flag(met, true);
    }
    // A scene that is finished for good (e.g. the sniffer is printed) answers with one line after that.
    if (near.talk && near.doneFlag && this.save.flags[near.doneFlag]) { this._say(near.doneText ?? near.text ?? ''); return; }
    if (near.talk) { const [scene, node] = near.talk.split(':'); this.startDialogue(scene, node || null, near.after ? () => this._flag(near.after, true) : null); return; }
    if (near.action === 'ending') { this._playEnding(); return; }
    if (near.action === 'fab') { this._openFab(); return; }
    if (this._questInteract(near)) return;
    if (near.npc && this._sayLater(near)) return;
    if (near.zip) { this._zip(near); return; }
    if (near.loot) { this._search(near); return; }
    if (near.grant) {
      if (this.save.flags[near.grantFlag ?? `got.${near.id}`]) { this._say(near.doneText ?? near.text ?? ''); return; }
      this._flag(near.grantFlag ?? `got.${near.id}`, true); this._grant(near.grant); this._say(near.text ?? ''); return;
    }
    if (/^obj\.switch_[abc]$/.test(near.id)) { this._lever(near.id.slice(-1)); return; }
    if (near.id === 'obj.vending') { this._kickVending(near); return; }
    if (CLOCKS.includes(near.id)) { this._windClock(near); return; }
    if (BUST_ORDER.includes(near.id)) { this._turnBust(near); return; }
    if (near.id === 'obj.manuel_table') { this._say(near.text + BUST_HINT); return; }
    if (near.id === 'obj.guitar' && this.character === 'michael') { this.perf?.useFixed(near); return; }   // he only knows the lullaby
    if (near.id === 'obj.shrimp_tank') { this._say(near.text + '\n\n' + this._shrimpReading()); return; }
    if (near.id === 'obj.old_phone') {   // egg, see docs/SECRETS.md
      const n = (this._phoneLooks = (this._phoneLooks ?? 0) + 1), mine = OLD_PHONE[this.character] ?? [];
      if (!this.save.flags['secrets.nacre.found']) this._flag('secrets.nacre.found', true);
      this._say(`${OLD_PHONE.base}\n\n${mine.length ? mine[(n - 1) % mine.length] : ''}${n > 2 ? '\n\n' + OLD_PHONE.later : ''}`); return;
    }
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
    if (near.boardgame) { this.openBoardGame(near.boardgame, near.id); return; }
    if (near.action === 'toolwall' && this.mode !== 'client') {
      // One pry bar for every roommate who has no weapon yet; it goes in their hand.
      const got = [];
      for (const [who, c] of Object.entries(this.save.party)) {
        if (c.inventory.some((x) => ITEMS[x?.id]?.slot === 'weapon')) continue;
        // Taken off the wall into your hand: the first free hotbar slot (new items otherwise go to the backpack).
        const free = c.inventory.slice(0, 9).findIndex((x) => !x);
        if (free >= 0) c.inventory[free] = { id: 'item.pry_bar', qty: 1 }; else if (Inv.add(c, 'item.pry_bar') > 0) continue;
        c.equipped.weapon ??= 'item.pry_bar'; got.push(who);
        if (free >= 0) c.hotSel = free;
      }
      this._flag('q.armed', true); this._tickQuests(true);
      this._syncParty();
      this._say(got.length ? `${near.text}\n\nYou each take a {pry bar}. (Select it on the hotbar with 1-9 or the wheel; left click swings what's in your hand.)` : `${near.text}\n\nEveryone's already armed.`);
      return;
    }
    if (near.botInstall && this.mode !== 'client' && this.save.flags['q.bot.looked'] && !this.save.flags['q.bot.built']) {
      const PARTS = ['item.bot_drive', 'item.bot_weapon', 'item.bot_brain'];
      const holder = (id) => Object.values(this.save.party).find((c) => Inv.has(c, id));
      if (PARTS.every(holder)) {
        for (const id of PARTS) Inv.remove(holder(id), id);
        this._flag('q.bot.built', true); this._syncParty(); this._spawnBot(); this._tickQuests(true);
        this.cameras.main.shake(120, 0.004); sfx('pickup');
        return;
      }
      const missing = PARTS.filter((id) => !holder(id)).map((id) => ITEMS[id].name.toLowerCase());
      this._say(`${near.text}\n\nStill needs: ${missing.join(', ')}. (Print them at the fab.)`);
      return;
    }
    this._say(near.text);
    if (near.flag) {
      if (this.mode === 'client') this.net.send({ t: 'flag', key: near.flag });
      else this.save.flags[near.flag] = true;
    }
    if (near.action === 'save') {
      if (this.mode === 'client') this.net.send({ t: 'rest', obj: near.id });
      else this._restAtSave(this.localId, near.id);
    }
  }

  // Hidden: see the sealed docs.
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
    (this.charShadow ??= this.add.graphics().setDepth(3)).clear();
    for (const p of snap.players) if (!p.dn) this.charShadow.fillStyle(0x000000, 0.55).fillEllipse(Math.round(p.x) + 1, Math.round(p.y) + 3, 11, 4);
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
        if (p.f === 'up' || p.f === 'down') {
          // Seen end-on: the deck runs up the screen under the rider; the bars are ahead of them.
          const ahead = p.f === 'up' ? -1 : 1;
          sg.fillStyle(0x1a1a22).fillRect(p.x - 1.5, p.y - 3, 3, 10);                     // deck
          sg.fillStyle(col).fillRect(p.x - 1.5, p.y - 3, 1, 10);
          sg.fillStyle(0x2b2b33).fillRect(p.x - 1, p.y - 5, 2, 2).fillRect(p.x - 1, p.y + 7, 2, 2);   // wheels
          if (ahead > 0) {   // riding toward the camera: the stem and bars are in front of the body
            sg.lineStyle(1, 0x9aa3c7).lineBetween(p.x, p.y + 7, p.x, p.y - 6).lineBetween(p.x - 4, p.y - 6, p.x + 4, p.y - 6);
            sg.setDepth(p.y + 3);
          } else {
            sg.lineStyle(1, 0x9aa3c7).lineBetween(p.x, p.y - 5, p.x, p.y - 14).lineBetween(p.x - 4, p.y - 14, p.x + 4, p.y - 14);
            sg.setDepth(p.y - 1);
          }
        } else {
          sg.fillStyle(0x1a1a22).fillRect(p.x - 7, p.y + 3, 14, 2);                       // deck
          sg.fillStyle(col).fillRect(p.x - 7, p.y + 2, 14, 1);
          sg.fillStyle(0x2b2b33).fillCircle(p.x - 6, p.y + 5, 1.5).fillCircle(p.x + 6, p.y + 5, 1.5); // wheels
          sg.lineStyle(1, 0x9aa3c7).lineBetween(p.x + 6 * fx, p.y + 3, p.x + 6 * fx, p.y - 9);       // stem
          sg.setDepth(p.y + 1);
        }
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
    this.decoySpr ??= [];
    (snap.decoys || []).forEach((d, i) => {   // Manuel's decoy bust: wet clay, cracked once it has soaked most of its hits
      const spr = (this.decoySpr[i] ??= this.add.image(0, 0, 'props', 'decoy.bust').setOrigin(0.5, 1));
      spr.setVisible(true).setFrame(d.cr ? 'decoy.bust#crack' : 'decoy.bust').setPosition(d.x, d.y + 2).setDepth(d.y);
    });
    for (const s of this.decoySpr.slice((snap.decoys || []).length)) s.setVisible(false);
    for (const a of snap.allies || []) {   // Trevor's combat robot (prop art, small), hp bar when hurt
      this.allySpr ??= [];
      const i = (snap.allies || []).indexOf(a);
      const spr = (this.allySpr[i] ??= this.add.image(0, 0, 'props', 'bot.live').setOrigin(0.5, 1).setScale(0.75));
      const moved = spr.lastX !== undefined && Math.hypot(a.x - spr.lastX, a.y - spr.lastY) > 0.2; spr.lastX = a.x; spr.lastY = a.y;
      spr.setFrame(!a.dn && moved && Math.floor(this.time.now / 140) % 2 ? 'bot.live#1' : 'bot.live').setFlipX(moved ? a.x < (spr.prevX ?? a.x) : spr.flipX); spr.prevX = a.x;
      spr.setPosition(a.x, a.y + 3).setDepth(a.y).setAlpha(a.dn ? 0.4 : 1).setAngle(a.st === 'ram' ? Math.sin(this.time.now / 30) * 8 : 0);
      if (a.hp < a.mhp && !a.dn) this.shotGfx.fillStyle(0x1c1f33).fillRect(a.x - 6, a.y - 12, 12, 2).fillStyle(0x7fb069).fillRect(a.x - 6, a.y - 12, 12 * (a.hp / a.mhp), 2);
    }
    for (const s of (this.allySpr ?? []).slice((snap.allies || []).length)) s.setVisible(false);
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
    this._tickRotBarks(snap);
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
    this._areaFrameBottom = oy + mh + 2;   // where the drawn frame ends (the objective tracker sits under it)
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
    if (this.mapFits) { this.minimapBottom = null; return; }
    if (this.menu || this.dlg) return;
    const w = Math.min(100, this.map.w * 2), h = Math.min(40, this.map.h * 2);
    this.drawAreaMap(g, VIEW.w - w - 6, 44, w, h, snap);
    this.minimapBottom = this._areaFrameBottom ?? 44 + h;
    g.setAlpha(this._hudAlpha('mini', { x: VIEW.w - w - 8, y: 42, w: w + 4, h: this.minimapBottom - 40 }));
  }

  /** Local player's position in HUD (VIEW) coordinates, or null. */
  _playerOnScreen() {
    const s = this.sprites.get(this.localId), v = this.cameras.main.worldView;
    if (!s || !v.width) return null;
    return { x: ((s.x - v.x) / v.width) * VIEW.w, y: ((s.y - v.y) / v.height) * VIEW.h };
  }

  /** HUD panels fade out of the way while the player is under them; eased per panel `key`. */
  _hudAlpha(key, r) {
    const p = this._playerOnScreen(), pad = 14;
    const under = p && r && p.x > r.x - pad && p.x < r.x + r.w + pad && p.y > r.y - pad && p.y < r.y + r.h + pad;
    const a = (this._hudA ??= {});
    a[key] = (a[key] ?? 1) + ((under ? 0.2 : 1) - (a[key] ?? 1)) * 0.2;
    return a[key];
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
    text = esLine(text);                                            // Spanish when chosen (src/content/lines_es.js)
    const s = this.sprites.get(playerId);
    if (!s || !text || this.dlg || this.menu || this.time.now < (this._barkQuietUntil ?? 0)) return;
    this._barkQuietUntil = this.time.now + 9000;                    // one voice at a time, and room between them
    const t = this.add.text(s.x, s.y - 30, text, { ...FONT, fontSize: '6px', color: '#e8e8f0', backgroundColor: '#0b0d16cc', padding: { x: 2, y: 1 } }).setOrigin(0.5, 1).setDepth(7000);
    const follow = this.time.addEvent({ delay: 30, loop: true, callback: () => t.active && s.active && t.setPosition(s.x, s.y - 30) });
    this.tweens.add({ targets: t, alpha: 0, delay: 2600, duration: 500, onComplete: () => { follow.remove(); t.destroy(); } });
  }

  _barkFrom(kind, snap, { not = null, by = null } = {}) {
    const players = (snap?.players ?? []).filter((p) => !p.dn && p.id !== not);
    const p = by ? players.find((x) => x.id === by) : players[Math.floor(Math.random() * players.length)];
    if (p) this._bark(p.id, this._freshBark(BARKS[kind], p.c));
  }

  // Never the same line twice in a row: remember the last few said and pick around them (the pools are
  // small, and a repeated one-liner is what reads as filler).
  _freshBark(table, who) {
    const pool = [...(table?.[who] ?? []), ...(table?.any ?? [])];
    if (!pool.length) return null;
    const recent = (this._recentBarks ??= []), fresh = pool.filter((t) => !recent.includes(t));
    const pick = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length || pool.length))];
    recent.push(pick); if (recent.length > 6) recent.shift();
    return pick;
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
      this._nextIdleBark = this.time.now + 60000 + Math.random() * 50000;   // about once every minute and a half
      const up = snap.players.filter((p) => !p.dn);
      const p = up[Math.floor(Math.random() * up.length)];
      if (p) this._bark(p.id, this._freshBark(p.mo && BARKS.idleMorph[p.c] ? BARKS.idleMorph : BARKS.idle, p.c));
    }
  }

  _tickRotBarks(snap) {
    if (this.dlg || this.menu || this.time.now < (this._barkQuietUntil ?? 0)) return;
    this._rotBarks ??= new Map();
    for (const p of snap.players) {
      const stage = p.rot >= 60 ? 2 : p.rot >= 25 ? 1 : 0;
      if (!stage || p.dn) { this._rotBarks.delete(p.id); continue; }
      const old = this._rotBarks.get(p.id);
      if (old?.stage === stage && this.time.now < old.next) continue;
      this._bark(p.id, stage === 2 ? 'code rot. code rot.' : 'Left. Left.');
      this._rotBarks.set(p.id, { stage, next: this.time.now + 30000 });
      break;
    }
  }

  _fx(ev, snap) {
    this.romance?.onEvent(ev, snap); this.gear?.onEvent(ev); this.eggs?.onEvent(ev); this.perf?.onEvent(ev);
    if (['hit', 'kill', 'shot', 'swing'].includes(ev.t) && (ev.by === this.localId || ev.id === this.localId)) sfx(ev.t);
    if (ev.t === 'hurt' && ev.id === this.localId) sfx('hurt');
    if (ev.t === 'kill' && !ev.boss && Math.random() < 0.15) this._barkFrom('kill', snap, { by: ev.by });
    if (ev.t === 'hurt' && Math.random() < 0.08) this._barkFrom('allyHurt', snap, { not: ev.id });
    if (ev.t === 'drum') { this.cameras.main.shake(40, ev.beat % 4 === 0 ? 0.006 : 0.002); sfx('hit'); }
    if (ev.t === 'boss' && !ev.sahur && this.mode !== 'client') this.save.flags['act1.boss.wardenName'] = ev.name;
    if (ev.t === 'kill' && ev.boss && this.mode !== 'client') { this.save.flags['act1.boss.defeated'] = true; this.save.flags['act1.outbreak.contained'] = true; }
    if (ev.t === 'kill' && ev.boss && !this._endingPlayed) { this._endingPlayed = true; this.time.delayedCall(900, () => this._playEnding(true)); }
    if (ev.t === 'phase') { this.cameras.main.shake(300, 0.01); this._say(ev.phase === 3 ? 'The Warden overloads. The platform starts rendering wrong.' : 'It changes how it moves.'); }
    if (ev.t === 'tell' && ev.kind) {
      // Boss pattern tells (bossPatterns.js): red = can't deflect or parry, dodge it; amber = deflectable.
      const g = this.add.graphics().setDepth(5500), dur = (ev.dur ?? 0.7) * 1000, col = ev.red ? 0xff4d4d : 0xffb347;
      if (ev.kind === 'charge' || ev.kind === 'beam') {
        const len = ev.kind === 'charge' ? 120 : 160;
        if (ev.kind === 'beam') for (const d of [-0.9, 0.9]) g.lineStyle(1, col, 0.5).lineBetween(ev.x, ev.y - 8, ev.x + Math.cos(ev.a + d) * len, ev.y - 8 + Math.sin(ev.a + d) * len);
        g.lineStyle(ev.kind === 'charge' ? 10 : 3, col, 0.4).lineBetween(ev.x, ev.y - 8, ev.x + Math.cos(ev.a) * len, ev.y - 8 + Math.sin(ev.a) * len);
      } else if (ev.kind === 'ring') {
        g.lineStyle(2, col, 0.7).strokeCircle(ev.x, ev.y - 8, 18);
      } else if (ev.kind === 'spray') {
        g.lineStyle(2, col, 0.7).beginPath().arc(ev.x, ev.y - 8, 26, ev.a - 0.4, ev.a + 0.4).strokePath();
      } else if (ev.kind === 'spiral') {
        g.lineStyle(2, col, 0.7);
        for (let i = 0; i < 3; i++) g.beginPath().arc(ev.x, ev.y - 8, 12 + i * 6, ev.a + i * 2.1, ev.a + i * 2.1 + 1.6).strokePath();
      } else if (ev.kind === 'puddle') {
        for (const p of snap.players) g.lineStyle(1, col, 0.8).strokeCircle(p.x, p.y, 16);
      } else if (ev.kind === 'summon') {
        for (const dx of [-14, 14]) g.lineStyle(1, col, 0.8).strokeCircle(ev.x + dx, ev.y + 10, 6);
      } else if (ev.kind === 'blink') {
        g.lineStyle(1, col, 0.8).strokeCircle(ev.x, ev.y - 8, 10).strokeCircle(ev.x, ev.y - 8, 4);
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
    // Combat feel (docs/research/combat.md): pops for finishers, deflects, perfect dodges, slams.
    const pop = (x, y, text, color) => { const t = this.add.text(x, y, text, { heading: true, fontSize: '7px', color }).setOrigin(0.5).setDepth(6060); this.tweens.add({ targets: t, y: y - 10, alpha: 0, duration: 650, onComplete: () => t.destroy() }); };
    if (ev.t === 'swing' && ev.combo === 3) this.cameras.main.shake(70, 0.003);
    if (ev.t === 'dashstrike') this.cameras.main.shake(50, 0.002);
    if (ev.t === 'parry') { pop(ev.x, ev.y - 18, 'PARRY', '#6fe3e8'); this.cameras.main.shake(90, 0.004); sfx('pickup'); }
    if (ev.t === 'deflect') { pop(ev.x, ev.y - 6, 'DEFLECT', '#6fe3e8'); sfx('swing'); }
    if (ev.t === 'perfect') { pop(ev.x, ev.y - 24, 'PERFECT', '#ffd27f'); this.cameras.main.flash(80, 255, 210, 127); sfx('pickup'); }
    if (ev.t === 'slam') { pop(ev.x, ev.y - 16, 'SLAM', '#ffb347'); this.cameras.main.shake(110, 0.005); }
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
      // Both the arc and the weapon follow the swinger for the whole swing (BagelMeister #401): drawn
      // around their own origin and moved to the player's current position every frame.
      const at = () => this._lastRendered?.players?.find((q) => q.id === ev.id) ?? p;
      const g = this.add.graphics().setDepth(p.y + 1).setPosition(p.x, p.y - 8);
      const r = Math.max(12, (ev.r ?? 20) - 4), half = (ev.arc ?? 1.8) / 2;   // the weapon's real reach and arc
      g.lineStyle(2, 0xe8e8f0, 0.8).beginPath().arc(0, 0, r, ev.a - half, ev.a + half).strokePath();
      this.tweens.add({ targets: g, alpha: 0, duration: 140, onUpdate: () => { const q = at(); g.setPosition(q.x, q.y - 8).setDepth(q.y + 1); }, onComplete: () => g.destroy() });
      // The weapon itself sweeps through the arc (Trevor: swinging the crowbar swings a crowbar). Icons are drawn
      // handle bottom-left to head top-right, so +45 degrees points the head outward along the swing.
      const weapon = this.save.party[p.c]?.equipped?.weapon;
      if (weapon && this.textures.get('icons')?.has?.(weapon)) {
        const im = this.add.image(p.x, p.y - 8, 'icons', weapon).setOrigin(0.15, 0.85).setDepth(p.y + 2);
        const from = ev.a - half, to = ev.a + half, flip = Math.cos(ev.a) < 0;   // swing toward the facing side
        const sweep = { t: 0 };
        this.tweens.add({ targets: sweep, t: 1, duration: ev.combo === 3 ? 190 : 140, ease: 'Cubic.out',
          onUpdate: () => { const ang = flip ? to - (to - from) * sweep.t : from + (to - from) * sweep.t; const q = at(); im.setRotation(ang + Math.PI / 4).setPosition(q.x, q.y - 8).setDepth(q.y + 2); },
          onComplete: () => this.tweens.add({ targets: im, alpha: 0, duration: 80, onUpdate: () => { const q = at(); im.setPosition(q.x, q.y - 8); }, onComplete: () => im.destroy() }) });
      }
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
    // Exposure is only shown while present, below the teammate cards.
    this.hudRot ??= this.add.text(7, 0, '', { ...FONT, fontSize: '6px', color: '#e8e2d0' }).setScrollFactor(0).setDepth(9002);
    const rot = me?.rot ?? 0, ry = 44 + (snap.players.length - 1) * 7;
    this.hudRot.setPosition(7, ry).setText(`CODE ROT ${Math.ceil(rot)}%`).setVisible(rot > 0);
    if (rot > 0) {
      g.fillStyle(0x0d0b1a, 0.9).fillRect(4, ry - 1, 112, 8);
      g.fillStyle(0x332e57).fillRect(76, ry + 1, 34, 4);
      g.fillStyle(rot >= 60 ? 0xd417c8 : 0xc8e619).fillRect(76, ry + 1, 34 * Math.min(1, rot / 100), 4);
    }
    // Ammo for the gun you carry, left of the hotbar (combat brief #8): count, or RELOADING.
    this.hudAmmo ??= this.add.text(0, 0, '', { ...FONT, fontSize: '8px', color: '#e8e8f0', stroke: '#0b0d16', strokeThickness: 3 }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(9003);
    const gunId = c.equipped?.ranged, gunDef = ITEMS[gunId]?.gun;
    if (gunId && this.hot && !this.menu && !this.dlg) {
      const clip = gunDef?.clip ?? 6, am = me?.am ?? clip;
      this.hudAmmo.setText(me?.rl > 0 ? 'RELOADING' : `${'▮'.repeat(Math.min(am, 8))}${am > 8 ? '+' : ''} ${am}/${clip}`).setColor(me?.rl > 0 ? '#ffb347' : '#e8e8f0')
        .setPosition(this.hot.x0 - 6, this.hot.y0 + this.hot.S / 2).setVisible(true);
    } else this.hudAmmo.setVisible(false);
    // Top-right: XP and money, compact.
    const lines = [`xp ${c.xp}/${c.level * XP_PER_LEVEL}${c.skillPoints ? `   ◆ ${c.skillPoints} skill pt [K]` : ''}`, `$${this.save.world.money ?? 0}${snap.enemies?.length ? `   coderot ${snap.enemies.length}` : ''}`];
    this.hudText.setText(lines.join('\n'));
    this.objText ??= this.add.text(VIEW.w - 6, 60, '', { ...FONT, fontSize: '7px', color: '#ffd27f', align: 'right', stroke: '#0b0d16', strokeThickness: 2, wordWrap: { width: 130 } }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);
    // Only the key hint under the minimap (Trevor: the objective line was too much UI). Objectives live in the quests menu.
    this.objText.setText('[J] quests').setColor('#9aa3c7').setY(this.minimapBottom ? this.minimapBottom + 4 : 28).setVisible(!this.menu && !this.dlg);
    const ob = this.objText.getBounds();
    this.objText.setAlpha(this._hudAlpha('obj', { x: VIEW.w - 6 - ob.width, y: this.objText.y, w: ob.width, h: ob.height }));
    // The player card (and teammate bars) fade the same way.
    const ca = this._hudAlpha('card', { x: 4, y: 4, w: 112, h: 46 + 7 * Math.max(0, snap.players.length - 1) });
    for (const o of [g, this.hudPortrait, this.hudName, this.hudLv, this.hudSkill]) o?.setAlpha(ca);
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
