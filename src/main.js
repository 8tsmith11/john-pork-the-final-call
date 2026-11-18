import { BootScene } from './game/scenes/BootScene.js';
import { TitleScene } from './game/scenes/TitleScene.js';
import { WorldScene } from './game/scenes/WorldScene.js';
import { LobbyScene } from './game/scenes/LobbyScene.js';

export { GAME_VERSION } from './version.js';

const params = new URLSearchParams(location.search);

window.game = new Phaser.Game({
  // ?renderer=canvas forces the Canvas renderer (old GPUs, headless tests).
  type: params.get('renderer') === 'canvas' ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 270,
  pixelArt: true,
  backgroundColor: '#0b0d16',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, LobbyScene, WorldScene],
});
