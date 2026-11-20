// Report missing Spanish coverage in the content tables: node tools/i18n/es_audit.mjs
import { setLang, tr } from '../../src/i18n.js';
import { ES_631 } from '../../src/i18n/es-631.js';
import { ES_ASTER } from '../../src/i18n/es-aster.js';
import { ES_HUD } from '../../src/i18n/es-hud.js';
import { ES_ITEMS } from '../../src/i18n/es-items.js';
import { ES_PLAZA } from '../../src/i18n/es-plaza.js';
import { ES_QUESTS } from '../../src/i18n/es-quests.js';
import { ES_TUNNELS_LAKE } from '../../src/i18n/es-tunnels-lake.js';
import { ES_BALTIMORE } from '../../src/i18n/es-baltimore.js';
import { BARKS } from '../../src/content/barks.js';
import { GUIDE_PEOPLE } from '../../src/content/guide.js';
import { ITEMS } from '../../src/content/items.js';
import { LINES_ES } from '../../src/content/lines_es.js';
import { MAPS } from '../../src/content/maps/index.js';
import { NPC_LIFE, NPC_FART } from '../../src/content/npc_life.js';
import { QUESTS } from '../../src/content/quests.js';
import { BUTT_LINES } from '../../src/game/bigButt.js';
import { LINES, PIXEL_LINES } from '../../src/game/crowd.js';
import { FART_LINES } from '../../src/game/fart.js';

const mapSources = {
  room631: 'room631.js',
  aster_hall: 'aster.js',
  aster_lobby: 'aster.js',
  metro_plaza: 'collegepark.js',
  tunnel_1: 'tunnels.js',
  platform: 'tunnels.js',
  lake: 'lake.js',
  compute_hall_b: 'campus.js',
  diner: 'act1_more.js',
  aster_basement: 'act1_more.js',
  aster_roof: 'act1_more.js',
  campus_quad: 'act1_more.js',
  dining_hall: 'act1_more.js',
  robotics_lab: 'act1_more.js',
  auditorium: 'act1_more.js',
  route1_north: 'act2_regions.js',
  greenbelt: 'act2_regions.js',
  beltsville: 'act2_regions.js',
  refuge: 'act2_regions.js',
  meade: 'act2_regions.js',
  baltimore: 'act2_regions.js',
  annapolis: 'act2_regions.js',
  beltway: 'act3_regions.js',
  corridor: 'act3_regions.js',
  gaithersburg: 'act3_regions.js',
  frederick: 'act3_regions.js',
  enclave: 'act3_regions.js',
  gb_dishes: 'act2_more.js',
  gb_coop: 'act2_more.js',
  bv_barn: 'act2_more.js',
  rf_settlement: 'act2_more.js',
  bmore_stacks: 'act2_more.js',
  bmore_clinic: 'act2_more.js',
  ann_harbor: 'act2_more.js',
  cor_sealed: 'act3_more.js',
  gt_clockroom: 'act3_more.js',
  fr_switchyard: 'act3_more.js',
  en_archive: 'act3_more.js',
  meade_inside: 'act3_more.js',
  bmore_rows: 'districts.js',
  bmore_refinery: 'districts.js',
  bmore_hall: 'districts.js',
  bmore_authority: 'districts.js',
  cor_town: 'districts.js',
  cor_substation: 'districts.js',
  cor_cooling: 'districts.js',
  cor_waterworks: 'districts.js',
  apt_637: 'act1_aster.js',
  apt_638: 'act1_aster.js',
  apt_636: 'act1_aster.js',
  aster_5f: 'act1_aster.js',
  aster_laundry: 'act1_aster.js',
  rf_fringe: 'stretch.js',
  rf_marsh: 'stretch.js',
  md_lot: 'stretch.js',
  ann_statehouse: 'stretch.js',
  ann_chapel: 'stretch.js',
  ann_bridge: 'stretch.js',
  bv_lab: 'stretch.js',
  gb_center: 'stretch.js',
  gt_labs: 'stretch.js',
  fr_market: 'stretch.js',
  en_mall: 'stretch.js',
  en_metro: 'stretch.js',
};
const exact = Object.assign(Object.create(null), ES_631, ES_ASTER, ES_HUD, ES_PLAZA, ES_QUESTS, ES_TUNNELS_LAKE, ES_BALTIMORE);
const results = new Map();

function check(file, location, text, inlineSpanish) {
  if (typeof text !== 'string' || !text.trim()) return;
  if (!results.has(file)) results.set(file, { checked: 0, missing: [] });
  const result = results.get(file);
  result.checked++;
  // A listed string can intentionally be spelled the same in both languages.
  if (!inlineSpanish && !Object.hasOwn(exact, text) && tr(text) === text) {
    result.missing.push(`${location}: ${JSON.stringify(text)}`);
  }
}

function checkLines(file, location, value) {
  if (typeof value === 'string') {
    check(file, location, value, Object.hasOwn(LINES_ES, value) && LINES_ES[value]);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) checkLines(file, `${location}.${key}`, child);
  }
}

setLang('es');

for (const map of Object.values(MAPS)) {
  const file = `src/content/maps/${mapSources[map.id] ?? 'index.js'}`;
  check(file, `${map.id}.name`, map.name);
  for (const object of map.objects) {
    const location = `${map.id}/${object.id}`;
    for (const field of ['label', 'text', 'lockedText', 'doneText']) {
      check(file, `${location}.${field}`, object[field]);
    }
    for (const [index, page] of (object.pages ?? []).entries()) {
      check(file, `${location}.pages[${index}]`, page);
    }
    for (const [index, later] of (object.later ?? []).entries()) {
      check(file, `${location}.later[${index}].text`, later.text);
    }
  }
}

for (const [id, item] of Object.entries(ITEMS)) {
  const es = ES_ITEMS[id.replace(/^item\./, '')];
  check('src/content/items.js', `${id}.name`, item.name, es?.[0]);
  check('src/content/items.js', `${id}.text`, item.text, es?.[1]);
}

for (const quest of QUESTS) {
  for (const field of ['title', 'why', 'pitch']) {
    check('src/content/quests.js', `${quest.id}.${field}`, quest[field]);
  }
  check('src/content/quests.js', `${quest.id}.reward.line`, quest.reward?.line);
  for (const [index, stage] of quest.stages.entries()) {
    check('src/content/quests.js', `${quest.id}.stages[${index}].text`, stage.text);
  }
}

for (const entry of GUIDE_PEOPLE) {
  for (const [index, stage] of entry.stages.entries()) {
    check('src/content/guide.js', `${entry.id}.stages[${index}].text`, stage.text, stage.es);
  }
}

checkLines('src/content/barks.js', 'BARKS', BARKS);
checkLines('src/game/crowd.js', 'LINES', LINES);
checkLines('src/game/crowd.js', 'PIXEL_LINES', PIXEL_LINES);
checkLines('src/game/fart.js', 'FART_LINES', FART_LINES);
checkLines('src/game/bigButt.js', 'BUTT_LINES', BUTT_LINES);
for (const [id, life] of Object.entries(NPC_LIFE)) {
  checkLines('src/content/npc_life.js', `NPC_LIFE.${id}.hi`, life.hi);
}
checkLines('src/content/npc_life.js', 'NPC_FART', NPC_FART);

let totalChecked = 0;
let totalMissing = 0;
for (const [file, result] of [...results].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`${file}: ${result.missing.length} missing of ${result.checked} checked`);
  for (const line of result.missing) console.log(`  ${line}`);
  totalChecked += result.checked;
  totalMissing += result.missing.length;
}
console.log(`Total: ${totalMissing} missing of ${totalChecked} checked`);
