import { BootScene } from './game/scenes/BootScene.js';
import { TitleScene } from './game/scenes/TitleScene.js';
import { CinematicScene } from './game/scenes/CinematicScene.js';
import { WorldScene } from './game/scenes/WorldScene.js';
import { LobbyScene } from './game/scenes/LobbyScene.js';

export { GAME_VERSION } from './version.js';
import { VIEW } from './view.js';
import { tr } from './i18n.js';

// Crisp text: every Text renders at the canvas zoom (see src/view.js), in the game's pixel fonts.
// 'monospace' in a style means body text (VT323); `heading: true` uses Pixelify Sans. VT323 runs
// small for its pixel size, so body sizes are scaled up to stay readable.
const _text = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, t, style = {}) {
  const st = { resolution: VIEW.zoom, ...style };
  const px = parseFloat(st.fontSize ?? '8') || 8;
  if (st.heading) { st.fontFamily = "'Pixelify Sans', monospace"; }
  else if (!st.fontFamily || st.fontFamily === 'monospace') { st.fontFamily = "'VT323', monospace"; st.fontSize = `${Math.round(px * 1.45)}px`; }
  delete st.heading;
  return _text.call(this, x, y, tr(t), st);
};
// Language: every string a Text shows goes through tr() (src/i18n.js), at creation and on setText.
const _setText = Phaser.GameObjects.Text.prototype.setText;
Phaser.GameObjects.Text.prototype.setText = function (v) { return _setText.call(this, Array.isArray(v) ? v.map(tr) : tr(v)); };

const params = new URLSearchParams(location.search);

await Promise.all([document.fonts.load("16px 'VT323'"), document.fonts.load("16px 'Pixelify Sans'")]).catch(() => {});

window.game = new Phaser.Game({
  // ?renderer=canvas forces the Canvas renderer (old GPUs, headless tests).
  type: params.get('renderer') === 'canvas' ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: VIEW.w * VIEW.zoom,
  height: VIEW.h * VIEW.zoom,
  pixelArt: true,
  backgroundColor: '#0b0d16',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, LobbyScene, WorldScene, CinematicScene],
});
