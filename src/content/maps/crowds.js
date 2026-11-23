// [SCAFFOLD] Townsfolk for rings two and three (scope: docs/design/10-scope.md, Act 2: 35 NPCs, Act 3: 25; Trevor:
// "this game must be much larger scale"). Each is one line from the atlas's "People" for the region. They're
// placed near a hint tile, on the nearest free walkable tile (no wall, no object), so a grid edit can't bury one.
// The polish pass gives them sprites, real lines (EN/ES), moods, and jobs or quests.

const ART = ['npc.rotter_1', 'npc.rotter_2', 'npc.rotter_3'];

// [map, hint x, hint y, id suffix, label, line, polished]. A line without `polished` still shows as "[scaffold]".
const CROWD = [
  // ---- Act 1 (the new campus areas; act1_more.js). Polished (hub #30 follow-up); Spanish in src/i18n/es-plaza.js ----
  ['diner', 6, 7, 'diner_regular', 'A regular at the counter', '"Don\'t take that stool. That\'s Earl\'s." The plate in front of it is going cold. "He\'s running late." He salts his own eggs, then reaches over and salts Earl\'s.', true],
  ['campus_quad', 8, 5, 'quad_student', 'A student on the brick path', '"Stay on the bricks. Code rot comes up through the grass, everybody knows that." He picks his way along the path and skips every cracked brick, which is most of them.', true],
  ['dining_hall', 20, 3, 'dining_student', 'A student with a waffle', '"I rate every one a two, so it learns." He eats around the university seal and sets it at the edge of his plate, next to the other five.', true],
  ['robotics_lab', 6, 6, 'lab_grad', 'A grad student asleep at a bench', 'Asleep on his folded arms, safety glasses still on. By his elbow, a wheel motor with a sticky note: BORROWED, WILL PUT BACK. Without waking up he says, "It still drives. Just in circles."', true],
  // ---- Act 2 ----
  ['route1_north', 8, 6, 'r1n_family', 'A family with a handcart', '"We heard Baltimore has work. We heard it from a man who heard it."'],
  ['route1_north', 30, 3, 'r1n_trooper', 'An off-duty trooper', '"I\'m not on shift. If I were, I\'d stop you. I\'m not."'],
  ['greenbelt', 6, 4, 'gb_minutes', 'A minute-taker', '"I write down everything the committee says. I\'m on volume four hundred."'],
  ['greenbelt', 24, 9, 'gb_dissenter', 'The committee member who disagrees', '"Whatever they told you, I voted against it."'],
  ['greenbelt', 13, 9, 'gb_kid', 'A kid with a kite', '"The dishes move when the wind doesn\'t. I checked."'],
  ['gb_dishes', 20, 6, 'gb_archivist', 'An Archivist', '"We keep the tapes because they\'re clean. Not because we\'re allowed to."'],
  ['gb_coop', 5, 4, 'gb_shopper', 'A co-op member', '"Members get a discount of zero percent. It\'s the principle."'],
  ['beltsville', 14, 7, 'bv_tech', 'A tissue technician', '"Tissue that doesn\'t take. We have a word for it. We don\'t say it."'],
  ['beltsville', 27, 3, 'bv_shell_waiting', 'A shell awaiting assignment', '"I am awaiting assignment." By any test you can run, a person.'],
  ['bv_barn', 6, 6, 'bv_handler', 'A night handler', '"Don\'t tap the tanks. They tap back."'],
  ['refuge', 16, 5, 'rf_settler', 'A settler with an axe', '"No signal out here. You\'ll sleep better. First night, you won\'t."'],
  ['refuge', 27, 2, 'rf_birder', 'A birder in a blind', '"Shh. Forty years and I\'ve never seen a bird look at a phone."'],
  ['rf_settlement', 14, 6, 'rf_lamplighter', 'The lamplighter', '"Every lamp, every night. It takes three hours. It\'s my favorite three hours."'],
  ['rf_settlement', 22, 6, 'rf_copyist', 'A copyist', '"I\'m on page two hundred. The horse is on page forty. Don\'t tell my father."'],
  ['meade', 8, 4, 'md_analyst_out', 'An analyst on a smoke break', '"I haven\'t been home in four years. I keep my car running, just in case."'],
  ['meade', 20, 6, 'md_officer', 'An officer', '"Move along. Not because you\'re in trouble. Because standing still is suspicious."'],
  ['baltimore', 8, 6, 'bmore_smuggler', 'A smuggler', '"Helium, mostly. Sometimes people. Never phones."'],
  ['baltimore', 26, 6, 'bmore_caller', 'A Caller', '"He called me too. I picked up. I\'m better now. Mostly."'],
  ['baltimore', 12, 10, 'bmore_kid', 'A kid on the marble steps', '"My gran scrubs these every morning. Outbreak or no outbreak."'],
  ['baltimore', 30, 3, 'bmore_muralist', 'A muralist', '"I painted Pork with five fingers. People keep telling me. I know."'],
  ['bmore_stacks', 20, 1, 'bmore_tenant', 'A container tenant', '"Fifth floor, the blue one. Best view in the stacks. The harbor and the fire."'],
  ['bmore_stacks', 9, 4, 'bmore_dockhand', 'A dockhand shell', '"Union card." He shows it to you. It\'s laminated twice.'],
  ['bmore_clinic', 4, 3, 'bmore_patient', 'A patient in line', '"I\'m not sick. I just like being somewhere with a line."'],
  ['annapolis', 6, 2, 'ann_midshipman', 'A midshipman with no navy', '"We still drill. Nobody tells us to stop. Nobody tells us anything."'],
  ['annapolis', 24, 2, 'ann_waterman', 'A waterman', '"Tide\'s wrong again. It\'s right about the crabs, though."'],
  ['ann_harbor', 8, 5, 'ann_sailor', 'A sailor on a second-floor mooring', '"I tied up to my old bedroom window. Felt right."'],
  // Baltimore district (districts.js)
  ['bmore_rows', 6, 4, 'bmore_scrubber', 'A gran scrubbing the steps', '"Outbreak or no outbreak. You keep your steps."'],
  ['bmore_rows', 22, 6, 'bmore_pigeon', 'A man feeding pigeons', '"They came back before the people did. They always do."'],
  ['bmore_refinery', 20, 4, 'bmore_signkeeper', 'The sign keeper', '"Ships steer by that sign. Rotters too, I think. Something in it hums."'],
  ['bmore_hall', 6, 1, 'bmore_scribe', 'The scribe of the book', '"I write down what they heard. I don\'t judge. I spell-check."'],
  ['bmore_hall', 18, 3, 'bmore_singer', 'A singer in the back row', '"The choir comes in late on purpose. It\'s about being called."'],
  ['bmore_authority', 10, 3, 'bmore_ca_clerk', 'A Continuity clerk', '"Every container is accounted for. Don\'t ask me which accounts."'],
  // Corridor district (districts.js)
  ['cor_town', 14, 6, 'cor_mayor', 'The last mayor', '"I signed the sale. Ask anyone. They\'ll tell you. Loudly."'],
  ['cor_town', 26, 4, 'cor_porch', 'A woman on her porch', '"My porch light comes on when the hall decides it\'s night."'],
  ['cor_substation', 20, 3, 'cor_switcher', 'A switching engineer', '"Half the log is me. The other half signs itself auto. Auto has better handwriting."'],
  ['cor_cooling', 18, 5, 'cor_steamfitter', 'A steamfitter', '"The towers breathe. In, out. Lately they\'ve been holding their breath."'],
  ['cor_waterworks', 14, 5, 'cor_riverkeeper', 'The riverkeeper', '"I kept the river forty years. Now I keep the pipe."'],
  // ---- Act 3 ----
  ['beltway', 30, 2, 'bw_commuter', 'A commuter who missed the exit', '"Missed my exit in 2089. I keep going around. It\'ll come back."'],
  ['corridor', 12, 1, 'cor_lawyer', 'A water-rights lawyer', '"Your river? Read the contract. It was never your river."'],
  ['corridor', 24, 4, 'cor_tech', 'A hall technician', '"Hall six went dark and kept running. We don\'t go in hall six."'],
  ['corridor', 5, 9, 'cor_townie', 'A townie from the town that sold its river', '"We got a check. The check was very large. The river was larger."'],
  ['cor_sealed', 24, 7, 'cor_scavenger', 'A scavenger', '"The racks are still warm. That\'s how you know to leave."'],
  ['gaithersburg', 14, 3, 'gt_liaison', 'A Continuity liaison', '"I\'m here to help the metrologists. They\'re terrifying."'],
  ['gaithersburg', 4, 7, 'gt_deer', 'A groundskeeper', '"The deer fence keeps the deer in. Nobody remembers why."'],
  ['gt_clockroom', 16, 3, 'gt_intern', 'An intern with a stopwatch', '"I check the master clock against my stopwatch. My stopwatch wins."'],
  ['frederick', 4, 5, 'fr_shopkeeper', 'A shopkeeper', '"We\'re an ordinary town. Please say that, if anyone asks."'],
  ['frederick', 10, 7, 'fr_priest', 'A priest by the spire', '"The bells are on a timer. The timer is on the campus network. I ring them by hand now."'],
  ['frederick', 30, 5, 'fr_staff', 'Campus staff, off shift', '"I can\'t tell you what I do. I can tell you I don\'t sleep."'],
  ['frederick', 15, 3, 'fr_child', 'A frightened kid', '"Grandma used to work up the hill. She won\'t say what at."'],
  ['fr_switchyard', 16, 3, 'fr_lineman', 'A lineman', '"Wind in the switchyard sounds like a choir. Don\'t listen too long."'],
  ['enclave', 6, 7, 'en_attested', 'An attested resident', '"We\'re very happy here. We\'re told regularly."'],
  ['enclave', 26, 3, 'en_embassy_au', 'Analog Union embassy staff', '"We write everything down. On paper. They hate that."'],
  ['enclave', 10, 3, 'en_embassy_ss', 'Sovereign Stack embassy staff', '"We\'re here to observe. We\'re observing you now."'],
  ['enclave', 22, 8, 'en_jogger', 'A jogger on the path', '"Path only. Never the grass. I\'ve jogged past the grass for eleven years."'],
  ['en_archive', 4, 3, 'en_reader', 'A reader in the stacks', '"Every version of every address. Some days I read them all, in order."'],
  ['en_archive', 19, 6, 'en_guard', 'An archive guard', '"Nothing can rot the parchment. My job is mainly people."'],
  ['gt_labs', 8, 5, 'gt_checker', 'A faction clock-checker', '"I\'m here to check our clocks against theirs. Ours are wrong. I\'m going to say they\'re right."'],
  ['meade_inside', 22, 4, 'md_list_reader', 'An analyst at the far desk', '"Don\'t look at the wall. Everybody looks at the wall."'],
  ['meade_inside', 4, 7, 'md_night_clerk', 'A night clerk', '"I file the intercepts. I don\'t read them. I read them."'],
];

/** Adds the crowd to built maps (mutates map.objects). Returns how many were placed. */
export function addCrowds(maps) {
  let n = 0;
  CROWD.forEach(([mapId, hx, hy, id, label, line, polished], i) => {
    const m = maps[mapId]; if (!m) throw new Error(`crowds: no map ${mapId}`);
    const taken = new Set(m.objects.flatMap((o) => Array.from({ length: o.w ?? 1 }, (_, k) => `${o.x + k},${o.y}`)));
    const free = (x, y) => x > 0 && y > 0 && x < m.w - 1 && y < m.h - 1 && !m.solid(x, y) && !taken.has(`${x},${y}`) && !m.blocked?.has(`${x},${y}`);
    const seen = new Set([`${hx},${hy}`]), q = [[hx, hy]];
    let at = null;
    while (q.length && !at) {
      const [x, y] = q.shift();
      if (free(x, y)) { at = [x, y]; break; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (!seen.has(k) && x + dx >= 0 && y + dy >= 0 && x + dx < m.w && y + dy < m.h) { seen.add(k); q.push([x + dx, y + dy]); } }
    }
    if (!at) throw new Error(`crowds: no free tile near ${mapId} ${hx},${hy}`);
    m.objects.push({ id: `npc.${id}`, x: at[0], y: at[1], npc: true, art: ART[i % 3], label, age: /\bkid\b/.test(label) ? 'child' : 'adult', mood: ['still', 'fidget', 'nod'][i % 3], text: polished ? line : `[scaffold] ${line}` });
    n++;
  });
  return n;
}
