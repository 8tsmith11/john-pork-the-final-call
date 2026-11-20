// Cinematics: side-view, letterboxed cutscenes that play like a video (Trevor: "the cutscene should be
// like a video, not top down"). A cinematic is a shot list (src/content/cinematics/*.js); each shot has
// a backdrop, a camera move, cast on a side-view stage, and an optional subtitled, spoken line.
// It's generated live, so shots can branch on the run (`if: (ctx) => ...`) and subtitles go through tr().
//
// Shot fields (all optional except bg):
//   bg: backdrop id (render/backdrops.js)          dur: seconds (default 3, longer if the line needs it)
//   cam: { from: { x, zoom }, to: { x, zoom } }     x = pan in view px (0 = left edge), zoom 1 = full frame
//   cast: [{ who, x, y, face: 'left'|'right', anim: 'idle'|'walk', to: x, scale }]   x/y in view px
//   say: { who, text, es }                          fade: 'in' | 'out' | 'both' (black), else a hard cut
//   title: big centred text (act cards)              if: (ctx) => bool, to skip a shot for this run
//   paint: a painted shot (src/game/render/cinePaint.js spec { layers }), drawn every frame under the cast
//   shake: camera shake strength for the shot (0.002 small .. 0.02 huge)
// Cinematic fields: noClick (only ESC skips, so a timed score stays in sync), score (src/audio/score.js name).
import { VIEW, setupCameras } from '../../view.js';
import { tr, getLang } from '../../i18n.js';
import { speak, hush } from '../../audio/audio.js';
import * as Settings from '../../settings.js';
import { BACKDROPS, BACKDROP_W } from '../render/backdrops.js';
import { painter } from '../render/cinePaint.js';
import { playScore } from '../../audio/score.js';
import { audioOut, setMusicDuck } from '../../audio/audio.js';

const BAR = 30;   // letterbox bar height (view px): 480x210 picture, about 2.3:1
const NAME_COLOR = { trevor: '#7fa7e8', michael: '#e8857e', manuel: '#9ccc6b' };

export class CinematicScene extends Phaser.Scene {
  constructor() { super('Cinematic'); }

  init(data) {
    this.cine = data.cine; this.ctx = data.ctx ?? {}; this.onDone = data.onDone;
    this.shots = this.cine.shots.filter((s) => !s.if || s.if(this.ctx));
  }

  create() {
    setupCameras(this);
    const { w, h } = VIEW;
    this.add.rectangle(0, 0, w, h, 0x000000).setOrigin(0).setDepth(-10);
    this.stage = this.add.container(0, 0);
    this.add.rectangle(0, 0, w, BAR, 0x000000).setOrigin(0).setDepth(900);
    this.add.rectangle(0, h - BAR, w, BAR, 0x000000).setOrigin(0).setDepth(900);
    this.sub = this.add.text(w / 2, h - BAR / 2, '', { fontFamily: 'VT323', fontSize: '11px', color: '#f0ece2', align: 'center', wordWrap: { width: w - 60 } }).setOrigin(0.5).setDepth(910);
    this.titleText = this.add.text(w / 2, h / 2, '', { fontFamily: 'Pixelify Sans', fontSize: '18px', color: '#f2e6c9', align: 'center' }).setOrigin(0.5).setDepth(905);
    this.add.text(w - 6, 6, tr(this.cine.noClick ? 'ESC: skip' : 'click: next · ESC: skip'), { fontFamily: 'VT323', fontSize: '7px', color: '#5a5d6b' }).setOrigin(1, 0).setDepth(910);
    if (!this.cine.noClick) this.input.on('pointerdown', () => this._next());
    if (this.cine.score) { setMusicDuck(true); this.score = playScore(audioOut()?.ctx, this.cine.score); }   // the area music steps back
    this.input.keyboard.on('keydown-ESC', () => this._finish());
    if (!this.cine.noClick) this.input.keyboard.on('keydown-SPACE', () => this._next());
    this.i = -1; this._next();
  }

  _next() {
    if (this._busy) return;
    this.timer?.remove(); this.tweens.killAll(); hush();
    this.i++;
    if (this.i >= this.shots.length) return this._finish();
    const shot = this.shots[this.i], prev = this.shots[this.i - 1];
    const fadeIn = shot.fade === 'in' || shot.fade === 'both' || this.i === 0;
    if (prev && (prev.fade === 'out' || prev.fade === 'both')) {
      this._busy = true;
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => { this._busy = false; this._show(shot, true); });
    } else this._show(shot, fadeIn);
  }

  _show(shot, fadeIn) {
    const { w, h } = VIEW;
    this.stage.removeAll(true);
    // A painted shot draws every frame (update()); it sits under the cast, over the backdrop.
    this.paint = shot.paint ? { fn: painter(shot.paint), g: this.add.graphics(), t0: this.time.now, dur: (shot.dur ?? 3) * 1000 } : null;
    this.shakeAmt = shot.shake ?? 0;   // shakes the picture only, so the letterbox bars hold still
    // Backdrop layers, far to near, with parallax by factor.
    const layers = (BACKDROPS[shot.bg] ?? BACKDROPS.black)(this).map((L) => ({ ...L, img: this.add.image(0, 0, L.key).setOrigin(0) }));
    for (const L of layers) this.stage.add(L.img);
    if (this.paint) this.stage.add(this.paint.g);
    // Cast: the roommates' side-view frames, scaled up (placeholder until side-view cinematic art lands).
    const cast = (shot.cast ?? []).map((c) => {
      const scale = c.scale ?? 3, dir = 'right';
      const s = this.add.sprite(c.x, c.y ?? 222, c.who, `idle_${dir}_0`).setOrigin(0.5, 1).setScale(scale).setFlipX(c.face === 'left');
      const anim = `${c.who}_${c.anim === 'walk' || c.to != null ? 'walk' : 'idle'}_${dir}`;
      if (this.anims.exists(anim)) s.play(anim);
      this.stage.add(s);
      return { c, s };
    });
    // Line and title.
    const es = getLang() === 'es';
    const line = shot.say ? ((es && shot.say.es) || tr(shot.say.text)) : '';
    const who = shot.say?.who;
    const name = who ? tr(who[0].toUpperCase() + who.slice(1)) : '';
    this.sub.setText(line ? (name ? `${name}: ${line}` : line) : '');
    this.sub.setColor(NAME_COLOR[who] ?? '#f0ece2');
    this.titleText.setText(shot.title ? tr(shot.title) : '');
    if (line && who && Settings.get('voice') > 0) speak(who, line);
    // Duration: long enough to read the line (about 14 characters a second), at least `dur`.
    const dur = Math.max(shot.dur ?? 3, line ? 1.2 + line.length / 14 : 0);
    // Camera: pan (x) and zoom around the frame centre; layers move by their parallax factor.
    const cam = { x: shot.cam?.from?.x ?? shot.cam?.to?.x ?? 0, zoom: shot.cam?.from?.zoom ?? 1 };
    const to = { x: shot.cam?.to?.x ?? cam.x, zoom: shot.cam?.to?.zoom ?? cam.zoom };
    const maxX = BACKDROP_W - w;
    const apply = () => {
      const z = cam.zoom, px = Math.max(0, Math.min(maxX, cam.x));
      for (const L of layers) L.img.setPosition(-px * L.factor, 0);
      for (const { s } of cast) s.x = s.getData('x') - px;
      this.stageBase = { x: w / 2 - (w / 2) * z, y: h / 2 - (h / 2) * z };
      this.stage.setScale(z).setPosition(this.stageBase.x, this.stageBase.y);
    };
    for (const { c, s } of cast) s.setData('x', c.x);
    apply();
    this.tweens.add({ targets: cam, x: to.x, zoom: to.zoom, duration: dur * 1000, ease: 'Sine.easeInOut', onUpdate: apply });
    for (const { c, s } of cast) if (c.to != null) this.tweens.add({ targets: { v: c.x }, v: c.to, duration: dur * 1000, onUpdate: (tw, t) => { s.setData('x', t.v); apply(); }, onComplete: () => { const a = `${c.who}_idle_right`; if (this.anims.exists(a)) s.play(a); } });
    if (fadeIn) this.cameras.main.fadeIn(350, 0, 0, 0);
    this.timer = this.time.delayedCall(dur * 1000, () => this._next());
  }

  update() {
    if (this.shakeAmt && this.stageBase) { const m = this.shakeAmt * 480; this.stage.setPosition(this.stageBase.x + (Math.random() - 0.5) * m, this.stageBase.y + (Math.random() - 0.5) * m); }
    const p = this.paint; if (!p) return;
    p.fn(p.g, Math.min(1, (this.time.now - p.t0) / p.dur), this.time.now);
  }

  _finish() {
    if (this._done) return;
    this._done = true; this.timer?.remove(); hush();
    if (this.score) { this.score.stop(); this.score = null; setMusicDuck(false); }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => { const cb = this.onDone; this.scene.stop(); cb?.(); });
  }
}
