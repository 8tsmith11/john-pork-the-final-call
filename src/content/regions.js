// The world in rings (docs/design/02-world-atlas.md; scope in docs/design/10-scope.md). Each region opens
// in its act; `maps` lists the built areas that belong to it. x/y place it on the schematic world view
// (0..1, east right, north up-screen), not to scale. Readable only: what happens there is sealed.
export const RINGS = [
  { ring: 1, act: 1, name: 'The neighborhood', es: 'El barrio', r: 0.15 },
  { ring: 2, act: 2, name: 'The county and the bay', es: 'El condado y la bahía', r: 0.29 },
  { ring: 3, act: 3, name: 'The Corridor and the Enclave', es: 'El Corredor y el Enclave', r: 0.44 },
];

export const REGIONS = [
  // Ring one: College Park (Act 1)
  { id: 'aster', short: 'ASTER', shortEs: 'ASTER', ring: 1, act: 1, name: 'ASTER', es: 'ASTER', x: 0.48, y: 0.52, maps: ['room631', 'aster_hall', 'aster_lobby', 'aster_basement', 'aster_roof', 'apt_637', 'apt_638', 'apt_636', 'aster_5f', 'aster_laundry'] },
  { id: 'plaza', short: 'Metro & Green Line', shortEs: 'Metro y Línea Verde', ring: 1, act: 1, name: 'The metro plaza and the Green Line', es: 'La plaza del metro y la Línea Verde', x: 0.51, y: 0.56, maps: ['metro_plaza', 'tunnel_1', 'platform', 'diner'] },
  { id: 'campus', short: 'Campus', shortEs: 'Campus', ring: 1, act: 1, name: 'The campus', es: 'El campus', x: 0.44, y: 0.58, maps: ['compute_hall_b', 'campus_quad', 'dining_hall', 'robotics_lab', 'auditorium'] },
  { id: 'route1', short: 'Route 1', shortEs: 'Ruta 1', ring: 1, act: 1, name: 'Route 1 and the airfield', es: 'La Ruta 1 y el aeródromo', x: 0.53, y: 0.47, maps: [] },
  { id: 'lake', short: 'Lake Artemesia', shortEs: 'Lago Artemesia', ring: 1, act: 1, name: 'Lake Artemesia and the Paint Branch', es: 'El lago Artemesia y el Paint Branch', x: 0.57, y: 0.57, maps: ['lake'] },
  // Ring two: the county and the bay (Act 2)
  { id: 'greenbelt', short: 'Greenbelt', shortEs: 'Greenbelt', ring: 2, act: 2, name: 'Greenbelt and the dishes', es: 'Greenbelt y las antenas', x: 0.6, y: 0.43, maps: ['greenbelt', 'route1_north', 'gb_dishes', 'gb_coop', 'gb_center'] },
  { id: 'beltsville', short: 'Beltsville', shortEs: 'Beltsville', ring: 2, act: 2, name: 'Beltsville: the farms', es: 'Beltsville: las granjas', x: 0.5, y: 0.35, maps: ['beltsville', 'bv_barn', 'bv_lab'] },
  { id: 'refuge', short: 'The refuge', shortEs: 'El refugio', ring: 2, act: 2, name: 'The refuge', es: 'El refugio', x: 0.63, y: 0.32, maps: ['refuge', 'rf_settlement', 'rf_fringe', 'rf_marsh'] },
  { id: 'meade', short: 'The Meade', shortEs: 'El Meade', ring: 2, act: 2, name: 'The Meade', es: 'El Meade', x: 0.72, y: 0.38, maps: ['meade', 'meade_inside', 'md_lot'] },
  { id: 'baltimore', short: 'Baltimore', shortEs: 'Baltimore', ring: 2, act: 2, name: 'Baltimore: the port', es: 'Baltimore: el puerto', x: 0.7, y: 0.15, maps: ['baltimore', 'bmore_stacks', 'bmore_clinic', 'bmore_rows', 'bmore_refinery', 'bmore_hall', 'bmore_authority'] },
  { id: 'annapolis', short: 'Annapolis', shortEs: 'Annapolis', ring: 2, act: 2, name: 'Annapolis and the bay', es: 'Annapolis y la bahía', x: 0.84, y: 0.55, maps: ['annapolis', 'ann_harbor', 'ann_statehouse', 'ann_chapel', 'ann_bridge'] },
  // Ring three: the Corridor and the Enclave (Act 3)
  { id: 'corridor', short: 'The Corridor', shortEs: 'El Corredor', ring: 3, act: 3, name: 'The Corridor', es: 'El Corredor', x: 0.32, y: 0.4, maps: ['corridor', 'beltway', 'cor_sealed', 'cor_town', 'cor_substation', 'cor_cooling', 'cor_waterworks'] },
  { id: 'gaithersburg', short: 'Gaithersburg', shortEs: 'Gaithersburg', ring: 3, act: 3, name: 'Gaithersburg: the standards', es: 'Gaithersburg: los estándares', x: 0.22, y: 0.3, maps: ['gaithersburg', 'gt_clockroom', 'gt_labs'] },
  { id: 'frederick', short: 'Frederick', shortEs: 'Frederick', ring: 3, act: 3, name: 'Frederick and the Smelter', es: 'Frederick y la Fundición', x: 0.1, y: 0.14, maps: ['frederick', 'fr_switchyard', 'fr_market'] },
  { id: 'enclave', short: 'The Enclave', shortEs: 'El Enclave', ring: 3, act: 3, name: 'The Enclave', es: 'El Enclave', x: 0.42, y: 0.8, maps: ['enclave', 'en_archive', 'en_mall', 'en_metro'] },
];

export const regionOfMap = (mapId) => REGIONS.find((r) => r.maps.includes(mapId)) ?? null;

/** How a region shows on the world view for this act: 'here' | 'open' | 'closed' (this act, not built or cordoned) | 'locked'. */
export function regionState(region, act, mapId) {
  if (region.maps.includes(mapId)) return 'here';
  if (region.act > act) return 'locked';
  return region.maps.length ? 'open' : 'closed';
}
