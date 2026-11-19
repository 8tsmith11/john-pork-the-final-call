// Map registry: id -> map. Saves store the id (world.area), never an index.
import { room631 } from './room631.js';
import { asterHall, asterLobby } from './aster.js';
import { metroPlaza } from './collegepark.js';
import { tunnel1, platform } from './tunnels.js';
import { lake } from './lake.js';
import { computeHallB } from './campus.js';
import { diner, asterBasement, asterRoof, campusQuad, diningHall, roboticsLab } from './act1_more.js';
import { route1North, greenbelt, beltsville, refuge, meade, baltimore, annapolis } from './act2_regions.js';

export const MAPS = Object.fromEntries([room631, asterHall, asterLobby, metroPlaza, tunnel1, platform, lake, computeHallB, diner, asterBasement, asterRoof, campusQuad, diningHall, roboticsLab,
  route1North, greenbelt, beltsville, refuge, meade, baltimore, annapolis].map((m) => [m.id, m]));

// Where each map sits on the shared world map (tile units). Level design (gonman) can set
// `world: {x, y}` on a map to override. Interiors sit beside their building's entrance.
export const WORLD_LAYOUT = {
  metro_plaza: { x: 0, y: 0 }, aster_lobby: { x: -38, y: -4 }, aster_hall: { x: -46, y: -16 }, room631: { x: -34, y: -33 },
  tunnel_1: { x: -4, y: 15 }, platform: { x: 48, y: 13 }, lake: { x: 86, y: 18 }, compute_hall_b: { x: 0, y: 52 }, diner: { x: 70, y: -12 }, aster_basement: { x: -38, y: 14 }, aster_roof: { x: -46, y: -30 },
  campus_quad: { x: 0, y: 70 }, dining_hall: { x: -30, y: 70 }, robotics_lab: { x: 36, y: 70 },
  route1_north: { x: 40, y: -40 }, greenbelt: { x: 0, y: -70 }, beltsville: { x: 40, y: -90 }, refuge: { x: 100, y: -80 },
  meade: { x: 150, y: -60 }, baltimore: { x: 80, y: -160 }, annapolis: { x: 180, y: 10 },
};
export const worldPos = (m) => m.world ?? WORLD_LAYOUT[m.id] ?? { x: 0, y: 0 };
