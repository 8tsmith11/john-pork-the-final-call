// Map registry: id -> map. Saves store the id (world.area), never an index.
import { room631 } from './room631.js';
import { asterHall, asterLobby } from './aster.js';
import { metroPlaza } from './collegepark.js';
import { tunnel1, platform } from './tunnels.js';
import { lake } from './lake.js';
import { computeHallB } from './campus.js';
import { diner, asterBasement, asterRoof, campusQuad, diningHall, roboticsLab, auditorium } from './act1_more.js';
import { route1North, greenbelt, beltsville, refuge, meade, baltimore, annapolis } from './act2_regions.js';
import { beltway, corridor, gaithersburg, frederick, enclave } from './act3_regions.js';
import { gbDishes, gbCoop, bvBarn, rfSettlement, bmoreStacks, bmoreClinic, annHarbor } from './act2_more.js';
import { addCrowds } from './crowds.js';
import { bmoreRows, bmoreRefinery, bmoreHall, bmoreAuthority, corTown, corSubstation, corCooling, corWaterworks } from './districts.js';
import { corSealed, gtClockroom, frSwitchyard, enArchive, meadeInside } from './act3_more.js';

export const MAPS = Object.fromEntries([room631, asterHall, asterLobby, metroPlaza, tunnel1, platform, lake, computeHallB, diner, asterBasement, asterRoof, campusQuad, diningHall, roboticsLab, auditorium,
  route1North, greenbelt, beltsville, refuge, meade, baltimore, annapolis,
  beltway, corridor, gaithersburg, frederick, enclave,
  gbDishes, gbCoop, bvBarn, rfSettlement, bmoreStacks, bmoreClinic, annHarbor,
  corSealed, gtClockroom, frSwitchyard, enArchive, meadeInside,
  bmoreRows, bmoreRefinery, bmoreHall, bmoreAuthority, corTown, corSubstation, corCooling, corWaterworks].map((m) => [m.id, m]));
addCrowds(MAPS);   // [SCAFFOLD] townsfolk for rings two and three (crowds.js)

// Where each map sits on the shared world map (tile units). Level design (gonman) can set
// `world: {x, y}` on a map to override. Interiors sit beside their building's entrance.
export const WORLD_LAYOUT = {
  metro_plaza: { x: 0, y: 0 }, aster_lobby: { x: -38, y: -4 }, aster_hall: { x: -46, y: -16 }, room631: { x: -34, y: -33 },
  tunnel_1: { x: -4, y: 15 }, platform: { x: 48, y: 13 }, lake: { x: 86, y: 18 }, compute_hall_b: { x: 0, y: 52 }, diner: { x: 70, y: -12 }, aster_basement: { x: -38, y: 14 }, aster_roof: { x: -46, y: -30 },
  campus_quad: { x: 0, y: 70 }, dining_hall: { x: -30, y: 70 }, robotics_lab: { x: 36, y: 70 }, auditorium: { x: 36, y: 88 },
  route1_north: { x: 40, y: -40 }, greenbelt: { x: 0, y: -70 }, beltsville: { x: 40, y: -90 }, refuge: { x: 100, y: -80 },
  meade: { x: 150, y: -60 }, baltimore: { x: 80, y: -160 }, annapolis: { x: 180, y: 10 },
  gb_dishes: { x: 0, y: -100 }, gb_coop: { x: -30, y: -70 }, bv_barn: { x: 40, y: -110 }, rf_settlement: { x: 100, y: -100 },
  bmore_stacks: { x: 120, y: -160 }, bmore_clinic: { x: 50, y: -160 }, ann_harbor: { x: 215, y: 10 },
  cor_sealed: { x: -120, y: -75 }, gt_clockroom: { x: -90, y: -130 }, fr_switchyard: { x: -120, y: -140 }, en_archive: { x: -60, y: 50 }, meade_inside: { x: 150, y: -30 },
  bmore_rows: { x: 120, y: -190 }, bmore_refinery: { x: 110, y: -220 }, bmore_hall: { x: 140, y: -220 }, bmore_authority: { x: 160, y: -190 },
  cor_town: { x: -120, y: -10 }, cor_substation: { x: -130, y: 20 }, cor_cooling: { x: -90, y: -10 }, cor_waterworks: { x: -150, y: -10 },
  beltway: { x: -60, y: -40 }, corridor: { x: -120, y: -40 }, gaithersburg: { x: -90, y: -100 }, frederick: { x: -160, y: -140 }, enclave: { x: -60, y: 20 },
};
export const worldPos = (m) => m.world ?? WORLD_LAYOUT[m.id] ?? { x: 0, y: 0 };
