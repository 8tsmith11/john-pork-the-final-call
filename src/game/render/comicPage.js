// Draws comic pages for the comic scene mode (src/game/comic.js): painted panel backgrounds, sprites,
// inked frames, caption boxes, speech balloons, sound lettering, and the page turn. Art direction:
// docs/art/comic-pages.md. Geometry and styles: ./comicLayout.js.
//
// The pages play in their own Phaser scene ('Comic') launched on top of the world, so they get the
// keyboard to themselves: while a page is up the world's keyboard is switched off (and its keys
// reset, so nobody keeps walking), and the comic scene's full-screen hit zone takes the clicks.
// Nothing here touches the world's state; the mode decides what page is showing.
import { VIEW, setupCameras } from '../../view.js';
import { getLang } from '../../i18n.js';
import { audioOut } from '../../audio/audio.js';
import { PAGE, FOOTER_Y, panelRects, PAL, num, PAPER, LETTERING, LETTER, letterText, footerHint, actionForKey, bgPixels, cropFor, tailFor, clampBox } from './comicLayout.js';

const SCENE_KEY = 'Comic';
const ATLAS = 'comic';
const TURN_MS = 320;      // one page turn
const STEP_PX = 8;        // the turning page moves in whole 8-pixel steps (a pixel-art turn, not a smear)
const FLAP_PX = 18;       // widest the back of the turning page gets
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function makeComicView(world, onInput) { return new ComicView(world, onInput); }

let SceneClass = null;
function comicSceneClass() {
  SceneClass ??= class ComicScene extends Phaser.Scene {
    constructor() { super(SCENE_KEY); }
    init(data) { this.view = data.view; }
    preload() { if (!this.textures.exists(ATLAS)) this.load.atlas(ATLAS, 'assets/sprites/comic.png', 'assets/sprites/comic.json'); }
    create() { this.view.attach(this); }
  };
  return SceneClass;
}

const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

class ComicView {
  constructor(world, onInput) {
    this.world = world; this.onInput = onInput;
    this.state = null;      // { comic, pages, page, opts }
    this.scene = null;      // the running ComicScene
    this.starting = false;
    this.locked = false;
    this.tok = 0;
    this.page = null;       // { root, timers } on screen
  }

  // ---------- what the mode calls ----------

  open(comic, pages, page, opts = {}) {
    this.state = { comic, pages, page, opts };
    this.tok++;
    const sp = this.world?.scene;
    if (typeof Phaser === 'undefined' || !sp?.add) return;
    this._lock(true);
    if (this.scene) { this.scene.cameras.main.resetFX?.(); this.scene.cameras.main.setAlpha?.(1); this._draw(true); return; }
    if (this.starting) return;
    this.starting = true;
    if (!sp.get(SCENE_KEY)) sp.add(SCENE_KEY, comicSceneClass(), true, { view: this });
    else sp.launch(SCENE_KEY, { view: this });
    sp.bringToTop(SCENE_KEY);
  }

  turnTo(page, dir) {
    if (!this.state) return;
    this.state.page = page;
    if (this.scene) this._turn(dir);
  }

  close() {
    this.state = null;
    this._lock(false);
    const sc = this.scene, tok = ++this.tok;
    if (!sc) return;   // still starting: attach() sees no state and stops it
    if (reducedMotion()) { this._stop(); return; }
    sc.cameras.main.fadeOut(180, 0, 0, 0);
    sc.time.delayedCall(200, () => { if (this.tok === tok && !this.state) this._stop(); });
  }

  /** The world is shutting down (a reload or quit): put everything back. */
  destroy() {
    this.state = null;
    this._lock(false);
    this._stop();
  }

  // ---------- the scene ----------

  attach(scene) {
    this.scene = scene; this.starting = false;
    scene.events.once('shutdown', () => { this._clearTurn(); this._dropPage(this.page); this.page = null; if (this.scene === scene) this.scene = null; });
    if (!this.state) { this._stop(); return; }
    setupCameras(scene);
    const zone = scene.add.zone(0, 0, VIEW.w, VIEW.h).setOrigin(0).setInteractive().setDepth(100);
    zone.on('pointerdown', (ptr) => { if (!ptr || ptr.button === 0) this.onInput('next'); });
    scene.input.keyboard.on('keydown', (ev) => {
      if (ev.repeat) return;
      const action = actionForKey(ev.key);
      if (action) this.onInput(action);
    });
    this._draw(true);
  }

  _stop() {
    const sp = this.world?.scene;
    this.starting = false;
    try { if (sp?.get?.(SCENE_KEY)) sp.stop(SCENE_KEY); } catch { /* the game is going away */ }
  }

  // The world's keyboard is off while a page is up. Keys are reset both ways so a key held when the
  // page opened doesn't keep the roommate walking, and a click that closed it doesn't swing.
  _lock(on) {
    if (this.locked === on) return;
    this.locked = on;
    const w = this.world, kb = w?.input?.keyboard;
    if (!kb) return;
    kb.resetKeys?.();
    kb.enabled = !on;
    if (!on && w.input.activePointer?.leftButtonDown?.() && w.input2) w.input2.blockAttack = true;
  }

  // ---------- pages ----------

  _draw(fresh) {
    this._clearTurn();
    this._dropPage(this.page);
    this.page = this._build(this.state.page);
    if (fresh && !reducedMotion()) {
      this.page.panels.forEach((g, i) => { g.setAlpha(0); this.scene.tweens.add({ targets: g, alpha: 1, duration: 140, delay: 60 + i * 90 }); });
      this.scene.cameras.main.fadeIn(160, 0, 0, 0);
    }
  }

  _turn(dir) {
    const sc = this.scene;
    this._clearTurn();
    const old = this.page, neu = this._build(this.state.page);
    this.page = neu;
    swish(dir);
    if (!old || reducedMotion()) { this._dropPage(old); return; }
    const top = dir > 0 ? old : neu;          // forward: the old page is pulled away; back: the last one comes back over
    top.root.setDepth(2); (dir > 0 ? neu : old).root.setDepth(1);
    const back = PAPER[this.state.comic.paper ?? 'bone']?.back ?? 'concrete3';
    const flap = sc.add.graphics().setDepth(3);
    const place = (p) => {
      const k = dir > 0 ? p : 1 - p;
      const x = -Math.round((k * VIEW.w) / STEP_PX) * STEP_PX;
      top.root.x = x;
      const edge = x + VIEW.w, fw = Math.round(FLAP_PX * Math.sin(Math.PI * k));
      flap.clear();
      if (fw > 0 && edge < VIEW.w) {
        flap.fillStyle(num('night0'), 0.35).fillRect(edge + fw, 0, 4, VIEW.h);
        flap.fillStyle(num(back), 1).fillRect(edge, 0, fw, VIEW.h);
        flap.fillStyle(num('night0'), 1).fillRect(edge + fw - 1, 0, 1, VIEW.h);
      }
    };
    place(0);
    const finish = () => { if (this.turning?.tween !== tween) return; this.turning = null; flap.destroy(); this._dropPage(old); if (neu.root.active) neu.root.setPosition(0, 0).setDepth(1); };
    const tween = sc.tweens.addCounter({ from: 0, to: 1, duration: TURN_MS, ease: 'Sine.easeInOut', onUpdate: (tw) => place(tw.getValue()), onComplete: finish });
    this.turning = { tween, finish };
  }

  _clearTurn() {
    const t = this.turning;
    if (!t) return;
    t.tween.stop?.();
    t.finish();
  }

  _dropPage(p) {
    if (!p) return;
    for (const t of p.timers) t.remove?.();
    p.root.destroy();
  }

  _build(index) {
    const sc = this.scene, { comic, pages, opts } = this.state;
    const page = pages[Math.max(0, Math.min(pages.length - 1, index))];
    const paper = PAPER[comic.paper ?? 'bone'] ?? PAPER.bone;
    const root = sc.add.container(0, 0).setDepth(1), timers = [], panels = [];
    root.add(sc.add.rectangle(0, 0, VIEW.w, VIEW.h, num(paper.ground)).setOrigin(0));
    panelRects(page).forEach((r, i) => { if (r) panels.push(this._panel(root, page.panels[i], r, paper, timers, hash(`${comic.id}/${index}/${i}`))); });
    const lang = getLang(), foot = { fontFamily: 'monospace', fontSize: '7px', color: PAL[paper.folio] };
    root.add(sc.add.text(PAGE.x, FOOTER_Y, `${index + 1} / ${pages.length}`, foot).setOrigin(0, 0.5));
    root.add(sc.add.text(PAGE.x + PAGE.w, FOOTER_Y, footerHint(lang, { index, total: pages.length, host: opts.host !== false, skippable: opts.skippable !== false }), foot).setOrigin(1, 0.5));
    return { root, timers, panels };
  }

  _panel(root, panel, [rx, ry, w, h], paper, timers, seed) {
    const sc = this.scene;
    const g = sc.add.container(PAGE.x + rx, PAGE.y + ry);
    root.add(g);
    if (panel.bg) g.add(sc.add.image(0, 0, this._bgTexture(panel.bg, w, h, seed)).setOrigin(0));
    else g.add(sc.add.rectangle(0, 0, w, h, num('night1')).setOrigin(0));
    for (const d of panel.draw ?? []) if (!d.over) g.add(this._shape(d));
    for (const a of panel.art ?? []) this._art(g, a, w, h, timers);
    for (const d of panel.draw ?? []) if (d.over) g.add(this._shape(d));
    g.add(this._frame(w, h, paper));
    for (const t of panel.text ?? []) this._text(g, t, w, h);
    return g;
  }

  _bgTexture(preset, w, h, seed) {
    const tm = this.scene.textures, key = `comic_bg_${preset}_${w}x${h}_${seed}`;
    if (tm.exists(key)) return key;
    const tex = tm.createCanvas(key, w, h), ctx = tex.getContext(), img = ctx.createImageData(w, h);
    img.data.set(bgPixels(preset, w, h, seed));
    ctx.putImageData(img, 0, 0);
    tex.refresh();
    return key;
  }

  _art(g, a, w, h, timers) {
    const sc = this.scene, key = a.key ?? ATLAS, scale = a.scale ?? 1;
    if (!sc.textures.exists(key)) return;
    const tex = sc.textures.get(key);
    if (!tex.has(a.frame)) return;
    const f = tex.get(a.frame), fw = f.width, fh = f.height, y = a.y ?? 0, step = fw * scale;
    const xs = [];
    if (a.repeat === 'x') { for (let x = (((a.x ?? 0) % step) - step) % step; x < w; x += step) xs.push(x); } else xs.push(a.x ?? 0);
    const ims = [];
    for (const x of xs) {
      const c = cropFor(x, y, fw, fh, scale, w, h);
      if (!c) continue;
      const im = sc.add.image(x, y, key, a.frame).setOrigin(0).setScale(scale).setFlipX(!!a.flip);
      if (!c.full) im.setCrop(c.x, c.y, c.w, c.h);
      g.add(im); ims.push(im);
    }
    const anim = (a.anim ?? []).filter((n) => tex.has(n));
    if (anim.length > 1 && ims.length) {
      let i = 0;
      timers.push(sc.time.addEvent({ delay: 1000 / (a.fps ?? 4), loop: true, callback: () => { i = (i + 1) % anim.length; for (const im of ims) if (im.active) im.setFrame(anim[i], false, false); } }));
    }
  }

  // Plain ink shapes: { rect: [x, y, w, h] } or { line: [x0, y0, x1, y1], width }; color is a palette name.
  _shape(d) {
    const gr = this.scene.add.graphics(), c = num(d.color ?? 'night0'), a = d.alpha ?? 1;
    if (d.rect) gr.fillStyle(c, a).fillRect(...d.rect);
    if (d.line) {
      const [x0, y0, x1, y1] = d.line, lw = d.width ?? 1;
      if (y0 === y1) gr.fillStyle(c, a).fillRect(Math.min(x0, x1), y0, Math.abs(x1 - x0) + 1, lw);
      else if (x0 === x1) gr.fillStyle(c, a).fillRect(x0, Math.min(y0, y1), lw, Math.abs(y1 - y0) + 1);
      else gr.lineStyle(lw, c, a).lineBetween(x0, y0, x1, y1);
    }
    return gr;
  }

  // The inked frame: 2 px of ink on the panel's edge, and on dark paper a 1 px keyline just outside it.
  _frame(w, h, paper) {
    const gr = this.scene.add.graphics();
    if (paper.key) gr.fillStyle(num(paper.key)).fillRect(-1, -1, w + 2, 1).fillRect(-1, h, w + 2, 1).fillRect(-1, 0, 1, h).fillRect(w, 0, 1, h);
    gr.fillStyle(num(paper.ink)).fillRect(0, 0, w, 2).fillRect(0, h - 2, w, 2).fillRect(0, 2, 2, h - 4).fillRect(w - 2, 2, 2, h - 4);
    return gr;
  }

  _text(g, t, w, h) {
    const sc = this.scene, lang = getLang(), s = letterText(t, lang);
    if (!s) return;
    if (t.kind === 'sfx') {
      g.add(sc.add.text(t.x ?? w / 2, t.y ?? h / 2, s, { heading: true, fontSize: `${t.size ?? 10}px`, color: PAL[t.color ?? 'warm4'] ?? PAL.warm4, stroke: PAL.night0, strokeThickness: 2 })
        .setOrigin(0.5).setAngle(t.angle ?? 0));
      return;
    }
    const st = t.kind === 'balloon' ? LETTERING[t.style ?? 'speech'] : t.kind === 'stamp' ? LETTERING.stamp : LETTERING[t.style ?? 'narration'];
    if (!st) return;
    const [px, py] = LETTER.pad, inset = LETTER.captionInset;
    const maxW = t.w ?? (t.kind === 'balloon' ? LETTER.wrap : Math.min(w - inset * 2, 200));
    const txt = sc.add.text(0, 0, s, { fontFamily: 'monospace', fontSize: `${LETTER.size}px`, color: PAL[st.text], align: t.kind === 'balloon' ? 'center' : 'left', wordWrap: { width: Math.max(16, maxW - px * 2) } });
    const bw = Math.ceil(txt.width) + px * 2, bh = Math.ceil(txt.height) + py * 2;
    const { x, y } = clampBox(t.x ?? inset, t.y ?? (t.at === 'bottom' ? h - bh - inset : inset), bw, bh, w, h);
    const gr = sc.add.graphics();
    box(gr, x, y, bw, bh, st);
    if (st.tail && t.tail) tail(gr, { x, y, w: bw, h: bh }, t.tail, w, h, st);
    txt.setPosition(x + px, y + py);
    g.add(gr); g.add(txt);
  }
}

// A lettering box: a 1 px line round a fill, corners cut by a pixel for speech, the line dashed for whispers.
function box(gr, x, y, w, h, st) {
  const ink = num(st.line), fill = num(st.fill);
  if (st.cut) {
    gr.fillStyle(ink).fillRect(x + 1, y, w - 2, h).fillRect(x, y + 1, w, h - 2);
    gr.fillStyle(fill).fillRect(x + 2, y + 1, w - 4, h - 2).fillRect(x + 1, y + 2, w - 2, h - 4);
  } else {
    gr.fillStyle(ink).fillRect(x, y, w, h);
    gr.fillStyle(fill).fillRect(x + 1, y + 1, w - 2, h - 2);
  }
  if (st.dash) {
    gr.fillStyle(fill);
    for (let i = x + 3; i < x + w - 3; i += 4) gr.fillRect(i, y, 2, 1).fillRect(i, y + h - 1, 2, 1);
    for (let j = y + 3; j < y + h - 3; j += 4) gr.fillRect(x, j, 1, 2).fillRect(x + w - 1, j, 1, 2);
  }
}

// A balloon's tail: an inked wedge from the side facing the speaker to the point it names, opened
// into the balloon so it reads as one shape. A speaker outside the panel gets a tail to the frame.
function tail(gr, b, target, pw, ph, st) {
  const { side, base, tip: [tx, ty] } = tailFor(b, target, pw, ph);
  const ink = num(st.line), fill = num(st.fill);
  const inner = (ex, ey) => { const dx = ex - tx, dy = ey - ty, l = Math.hypot(dx, dy) || 1; return [tx + (dx / l) * 2, ty + (dy / l) * 2]; };
  if (side === 'bottom' || side === 'top') {
    const e = side === 'bottom' ? b.y + b.h : b.y, [ix, iy] = inner(base, e);
    gr.fillStyle(ink).fillTriangle(base - 4, e, base + 4, e, tx, ty);
    gr.fillStyle(fill).fillTriangle(base - 3, e, base + 3, e, ix, iy);
    gr.fillRect(base - 3, side === 'bottom' ? b.y + b.h - 2 : b.y, 7, 2);
  } else {
    const e = side === 'right' ? b.x + b.w : b.x, [ix, iy] = inner(e, base);
    gr.fillStyle(ink).fillTriangle(e, base - 4, e, base + 4, tx, ty);
    gr.fillStyle(fill).fillTriangle(e, base - 3, e, base + 3, ix, iy);
    gr.fillRect(side === 'right' ? b.x + b.w - 2 : b.x, base - 3, 2, 7);
  }
}

// The page-turn sound: a short paper swish on the effects bus (so it follows the Effects volume and ?mute).
function swish(dir) {
  const out = audioOut();
  if (!out) return;
  const { ctx, dest } = out, t = ctx.currentTime, len = 0.16;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) { const k = i / d.length; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * k) * (1 - k * 0.5); }
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.Q.value = 0.8;
  f.frequency.setValueAtTime(dir > 0 ? 2600 : 1400, t); f.frequency.exponentialRampToValueAtTime(dir > 0 ? 1100 : 2400, t + len);
  g.gain.value = 0.5;
  src.connect(f); f.connect(g); g.connect(dest); src.start(t);
}
