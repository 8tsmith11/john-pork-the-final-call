import { BootScene } from './game/scenes/BootScene.js';
import { TitleScene } from './game/scenes/TitleScene.js';
import { WorldScene } from './game/scenes/WorldScene.js';
import { LobbyScene } from './game/scenes/LobbyScene.js';

export { GAME_VERSION } from './version.js';
import { VIEW } from './view.js';

// Crisp text: every Text renders at the canvas zoom (see src/view.js).
const _text = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, t, style) {
  return _text.call(this, x, y, t, { resolution: VIEW.zoom, ...(style || {}) });
};

const params = new URLSearchParams(location.search);

window.game = new Phaser.Game({
  // ?renderer=canvas forces the Canvas renderer (old GPUs, headless tests).
  type: params.get('renderer') === 'canvas' ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: VIEW.w * VIEW.zoom,
  height: VIEW.h * VIEW.zoom,
  pixelArt: true,
  backgroundColor: '#0b0d16',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, LobbyScene, WorldScene],
});
