// Map registry: id -> map. Saves store the id (world.area), never an index.
import { room631 } from './room631.js';
import { asterHall, asterLobby } from './aster.js';
import { metroPlaza } from './collegepark.js';
import { tunnel1, platform } from './tunnels.js';

export const MAPS = Object.fromEntries([room631, asterHall, asterLobby, metroPlaza, tunnel1, platform].map((m) => [m.id, m]));

// Where each map sits on the shared world map (tile units). Level design (gonman) can set
// `world: {x, y}` on a map to override. Interiors sit beside their building's entrance.
export const WORLD_LAYOUT = {
  metro_plaza: { x: 0, y: 0 }, aster_lobby: { x: -38, y: -4 }, aster_hall: { x: -46, y: -16 }, room631: { x: -34, y: -33 },
  tunnel_1: { x: -4, y: 15 }, platform: { x: 48, y: 13 },
};
export const worldPos = (m) => m.world ?? WORLD_LAYOUT[m.id] ?? { x: 0, y: 0 };
