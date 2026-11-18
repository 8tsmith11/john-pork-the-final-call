// Map registry: id -> map. Saves store the id (world.area), never an index.
import { room631 } from './room631.js';
import { asterHall, metroPlaza, tunnel1 } from './act1.js';

export const MAPS = Object.fromEntries([room631, asterHall, metroPlaza, tunnel1].map((m) => [m.id, m]));
