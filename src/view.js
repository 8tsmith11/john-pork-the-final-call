// Rendering scale. The game canvas is 1920x1080 so text renders crisp; the world is drawn at 4x
// (a 480x270 view of 16px pixel art). All game and UI coordinates stay in 480x270 "view" units.
export const VIEW = { w: 480, h: 270, zoom: 4 };

/**
 * World scenes: the main camera zooms/follows the world; a second UI camera (origin 0, zoom 4)
 * draws everything with scrollFactor 0. Each object is assigned to exactly one camera.
 */
export function setupCameras(scene, { world = false } = {}) {
  const main = scene.cameras.main.setZoom(VIEW.zoom);
  if (!world) { main.setOrigin(0, 0).setScroll(0, 0); return { main, ui: main }; }
  const ui = scene.cameras.add(0, 0, VIEW.w * VIEW.zoom, VIEW.h * VIEW.zoom).setOrigin(0, 0).setZoom(VIEW.zoom);
  ui.transparent = true;
  const seen = new WeakSet();
  const assign = () => {
    for (const obj of scene.children.list) {
      if (seen.has(obj)) continue;
      seen.add(obj);
      if (obj.scrollFactorX === 0) main.ignore(obj); else ui.ignore(obj);
    }
  };
  scene.events.on('prerender', assign);
  scene.events.on('postupdate', assign);
  return { main, ui };
}

/** Convert a pointer's screen position to UI (view) coordinates. */
export const toView = (ptr) => ({ x: ptr.x / VIEW.zoom, y: ptr.y / VIEW.zoom });
