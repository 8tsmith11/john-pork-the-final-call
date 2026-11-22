// [SCAFFOLD] Side quests for Acts 2 and 3 (scope: docs/design/10-scope.md, Act 2: 25, Act 3: 20; Trevor: "this
// game must be much larger scale"). A compact builder over the quest hooks in quests.js (ask / inspect / report /
// give, and flags): each spec makes one quest in the usual format, with its Spanish beside it. Small human
// stories from the atlas's "People" and "To find" lines; nothing sealed, nothing canon-bending. The polish pass
// rewrites them, varies the shapes, and the lore gate cuts or reshapes any (scaffold: true marks them).
//
//   look:  { obj, where, whereEs, seen, seenEs }   examine an object, then tell the giver
//   boss:  { boss, bossName }                      put down a region boss (flag boss.<id>.down)
//   bring: { item, what, whatEs, refuse, refuseEs } hand the giver an item
//   talk:  { npc, who, whoEs }                     go and talk to someone else (flag met.<npc>)
//
// A look quest that sets up a kit puzzle (src/content/puzzles.js; lore gate, hub #50: "the scaffold quest becomes
// stage 1 of its planned puzzle, in place") also takes
//   puzzle: { id, text, textEs }                   a middle stage, done when pz.<id>.solved; the giver hears about
//                                                  it only after that
//   after: 'q.<other>.told'                        the giver doesn't offer it until that flag is set

const ES = {};
const built = [];

// Spanish 'a' + 'el' contracts to 'al' ("Cuéntale al predicador", not "a el").
const aEs = (who) => (who.startsWith('el ') ? `al ${who.slice(3)}` : `a ${who}`);

function side({ id, act, giver, giverName, giverEs, title, titleEs, why, whyEs, pitch, pitchEs, line, lineEs, money = 20, xp = 40, ...kind }) {
  const k = `q.${id}`, q = { id: `side.${id}`, act, giver, title, why, pitch, ask: `${k}.asked`, start: (f) => f[`${k}.asked`], scaffold: true };
  const st = [];
  if (kind.look) {
    const L = kind.look;
    q.inspect = { obj: L.obj, flag: `${k}.seen`, text: L.seen };
    q.report = { needs: `${k}.seen`, flag: `${k}.told` };
    st.push([`Look at ${L.where}.`, `Revisa ${L.whereEs}.`, (f) => f[`${k}.seen`]]);
    if (kind.puzzle) {
      const P = kind.puzzle, solved = `pz.${P.id}.solved`;
      q.puzzle = P.id; q.report.needs = solved;
      st.push([P.text, P.textEs, (f) => f[solved]]);
    }
    st.push([`Tell ${giverName} what you saw.`, `Cuéntale ${aEs(giverEs)} lo que viste.`, (f) => f[`${k}.told`]]);
    ES[L.seen] = L.seenEs;
  } else if (kind.boss) {
    const flag = `boss.${kind.boss.boss.slice(5)}.down`;
    q.target = { boss: kind.boss.boss };
    st.push([`Put down ${kind.boss.bossName}.`, `Derrota a ${kind.boss.bossName}.`, (f) => f[flag]]);
  } else if (kind.bring) {
    const B = kind.bring;
    q.give = { item: B.item, flag: `${k}.given`, refuse: B.refuse };
    st.push([`Bring ${giverName} ${B.what}.`, `Llévale ${B.whatEs} ${aEs(giverEs)}.`, (f) => f[`${k}.given`]]);
    ES[B.refuse] = B.refuseEs;
  } else if (kind.talk) {
    const T = kind.talk;
    q.target = { npc: T.npc };
    st.push([`Talk to ${T.who}.`, `Habla con ${T.whoEs}.`, (f) => f[`met.${T.npc}`]]);
  } else throw new Error(`side quest ${id}: needs look, boss, bring or talk`);
  if (kind.after) { const need = kind.after; q.askIf = (f) => !!f[need]; q.start = (f) => !!(f[`${k}.asked`] && f[need]); }
  q.stages = st.map(([text, , done]) => ({ text, done }));
  q.reward = { money, xp, line };
  Object.assign(ES, { [title]: titleEs, [why]: whyEs, [pitch]: pitchEs, [line]: lineEs });
  for (const [en, es] of st) ES[en] = es;
  built.push(q);
}

// ======================= Act 1 (the new campus and ASTER areas) =======================
const COOK = ['the cook', 'el cocinero'], WATCHER = ['the roof watcher', 'la que mira desde la azotea'], DCOOK = ['the dining-hall cook', 'la cocinera del comedor'],
  STUDENT = ['the student', 'el estudiante'], TA = ['the TA', 'la ayudante de cátedra'];
const g1 = (npc, [n, e]) => ({ giver: npc, giverName: n, giverEs: e });

side({ id: 'diner_oldbay', act: 1, ...g1('npc.diner_cook', COOK), title: 'Out of Old Bay', titleEs: 'Sin Old Bay', money: 12, xp: 25,
  why: 'The diner cook ran out of Old Bay, and he has a plan.', whyEs: 'Al cocinero de la cafetería se le acabó el Old Bay, y tiene un plan.',
  pitch: '"Out of Old Bay. Bring me a bag of the crab chips. I\'ll grind them. Don\'t tell anyone."', pitchEs: '"Se acabó el Old Bay. Tráeme una bolsa de papas de cangrejo. Las muelo. No le digas a nadie."',
  bring: { item: 'item.crab_chips', what: 'a bag of Old Bay crab chips', whatEs: 'una bolsa de papas de cangrejo Old Bay', refuse: '"That\'s not Old Bay. That\'s not even food."', refuseEs: '"Eso no es Old Bay. Eso ni siquiera es comida."' },
  line: 'He grinds them in a coffee mill and seasons an order nobody placed. "Perfect."', lineEs: 'Las muele en un molinillo de café y condimenta un pedido que nadie hizo. "Perfecto."' });

side({ id: 'diner_jukebox', act: 1, ...g1('npc.diner_cook', COOK), title: 'The same song', titleEs: 'La misma canción', money: 10, xp: 25,
  why: 'The cook wants to know which band is on the jukebox tonight.', whyEs: 'El cocinero quiere saber qué banda suena en la rocola esta noche.',
  pitch: '"Every song on that jukebox is the same song. Different band every decade. Go see which decade we\'re in."', pitchEs: '"Todas las canciones de esa rocola son la misma. Otra banda cada década. Fíjate en qué década estamos."',
  look: { obj: 'obj.diner_jukebox', where: 'the jukebox', whereEs: 'la rocola', seen: 'The card in the slot says 2090s. The band is called Juke. The song is the song.', seenEs: 'La tarjeta dice años 2090. La banda se llama Juke. La canción es la canción.' },
  line: '"The nineties. Good decade for it."', lineEs: '"Los noventa. Buena década para esa."' });

side({ id: 'roof_lights', act: 1, ...g1('npc.roof_watcher', WATCHER), title: 'Count the floodlights', titleEs: 'Contar los reflectores', money: 10, xp: 30,
  why: 'Someone on the ASTER roof thinks the cordon is getting smaller.', whyEs: 'Alguien en la azotea de ASTER cree que el cordón se está achicando.',
  pitch: '"Count the floodlights from the rail. There were eleven last week. Tell me how many."', pitchEs: '"Cuenta los reflectores desde la baranda. La semana pasada había once. Dime cuántos hay."',
  look: { obj: 'obj.roof_view', where: 'the view north from the roof', whereEs: 'la vista al norte desde la azotea', seen: 'Twelve. The new one is closer than the others.', seenEs: 'Doce. El nuevo está más cerca que los otros.' },
  line: '"Twelve." They don\'t say anything for a while. "Thanks for counting."', lineEs: '"Doce." No dicen nada por un rato. "Gracias por contar."' });

side({ id: 'waffle', act: 1, ...g1('npc.dining_cook', DCOOK), title: 'The new machine', titleEs: 'La máquina nueva', money: 10, xp: 25,
  why: 'The dining-hall cook doesn\'t trust the new waffle machine.', whyEs: 'La cocinera del comedor no confía en la máquina de waffles nueva.',
  pitch: '"The waffle machine is new. Nothing on campus is new. Go look at it and tell me who bought it."', pitchEs: '"La máquina de waffles es nueva. Nada en el campus es nuevo. Ve a mirarla y dime quién la compró."',
  look: { obj: 'obj.waffle_machine', where: 'the waffle machine', whereEs: 'la máquina de waffles', seen: 'A sticker on the back: a purchase order number, and a signature you can\'t read.', seenEs: 'Una etiqueta atrás: un número de orden de compra y una firma ilegible.' },
  line: '"Can\'t read it either? Good. Then it\'s not just me."', lineEs: '"¿Tampoco la puedes leer? Bien. Entonces no soy solo yo."' });

side({ id: 'rover', act: 1, ...g1('npc.chb_student', STUDENT), title: 'Demo day', titleEs: 'Día de la demo', money: 12, xp: 30,
  why: 'A student wants to know if the rover team\'s machine is still in the robotics lab.', whyEs: 'Un estudiante quiere saber si la máquina del equipo del rover sigue en el laboratorio de robótica.',
  pitch: '"Is the rover still in the robotics lab? Behind the quad. The team left in a hurry. Somebody should check on it."', pitchEs: '"¿El rover sigue en el laboratorio de robótica? Detrás del patio. El equipo se fue apurado. Alguien debería ver cómo está."',
  look: { obj: 'obj.mars_rover', where: 'the Mars rover in the robotics lab', whereEs: 'el rover de Marte en el laboratorio de robótica', seen: 'Six wheels, half its panels off, and somebody has put a blanket over it, like it might get cold.', seenEs: 'Seis ruedas, la mitad de los paneles afuera, y alguien le puso una manta encima, como si fuera a tener frío.' },
  line: '"A blanket. That\'s the team, all right."', lineEs: '"Una manta. Ese es el equipo, sin duda."' });

side({ id: 'autograder', act: 1, ...g1('npc.chb_ta', TA), title: 'Partial credit', titleEs: 'Crédito parcial', money: 30, xp: 70,
  why: 'The autograder in the lecture auditorium is grading anyone who walks in.', whyEs: 'El corrector automático del auditorio califica a cualquiera que entre.',
  pitch: '"The autograder got out of the course site. It\'s in the auditorium. It\'s grading people. Physically."', pitchEs: '"El corrector automático se escapó del sitio del curso. Está en el auditorio. Está calificando gente. Físicamente."',
  boss: { boss: 'boss.chb_autograder', bossName: 'THE AUTOGRADER' },
  line: '"I\'ll mark it as excused." She means you. She means it kindly.', lineEs: '"Lo marco como ausencia justificada." Habla de ti. Lo dice con cariño.' });

// ---- ASTER neighbors (act1_aster.js) ----
side({ id: 'apt637_scales', act: 1, giver: 'npc.apt637_player', giverName: 'the neighbor in 637', giverEs: 'el vecino del 637', title: 'The same exercise', titleEs: 'El mismo ejercicio', money: 8, xp: 25,
  why: 'The neighbor in 637 wants to know how long they\'ve been practicing the same scales.', whyEs: 'El vecino del 637 quiere saber cuánto tiempo lleva practicando las mismas escalas.',
  pitch: '"Look at the first page of my sheet music. The date. I don\'t want to look."', pitchEs: '"Mira la primera página de mis partituras. La fecha. No quiero mirar."',
  look: { obj: 'obj.apt637_sheet', where: 'the sheet music in 637', whereEs: 'las partituras del 637', seen: 'The first date is eleven years ago. Every page since is the same exercise, slightly better, then slightly worse.', seenEs: 'La primera fecha es de hace once años. Cada página desde entonces es el mismo ejercicio, un poco mejor, después un poco peor.' },
  line: '"Eleven years." A long pause. "I\'ll try a new one tomorrow." You both know they won\'t.', lineEs: '"Once años." Una pausa larga. "Mañana pruebo otro." Los dos saben que no.' });

side({ id: 'apt638_tv', act: 1, giver: 'npc.apt638_viewer', giverName: 'the neighbor in 638', giverEs: 'la vecina del 638', title: 'Spot the difference', titleEs: 'Encuentra la diferencia', money: 8, xp: 25,
  why: 'The neighbor in 638 wants a second pair of eyes on the television.', whyEs: 'La vecina del 638 quiere otro par de ojos frente al televisor.',
  pitch: '"Watch it say it twice. Tell me what changed. I\'ve been at it since spring."', pitchEs: '"Mira cómo lo dice dos veces. Dime qué cambió. Estoy con esto desde la primavera."',
  look: { obj: 'obj.apt638_tv', where: 'the television in 638', whereEs: 'el televisor del 638', seen: 'The second time, the anchor blinks one time fewer.', seenEs: 'La segunda vez, la presentadora parpadea una vez menos.' },
  line: '"One blink. I knew it was the eyes." She writes it on a list. The list is long.', lineEs: '"Un parpadeo. Sabía que eran los ojos." Lo anota en una lista. La lista es larga.' });

side({ id: 'laundry_sock', act: 1, giver: 'npc.laundry_folder', giverName: 'the person folding laundry', giverEs: 'la persona que dobla la ropa', title: 'One sock (gray)', titleEs: 'Una media (gris)', money: 6, xp: 20,
  why: 'Two notes on the laundry corkboard, one lost sock, one found sock, and nobody has connected them.', whyEs: 'Dos notas en el corcho del lavadero, una media perdida, una encontrada, y nadie las conectó.',
  pitch: '"Read the corkboard. Somebody lost a sock and somebody found one. I\'m too tired to be the one who fixes it."', pitchEs: '"Lee el corcho. Alguien perdió una media y alguien encontró una. Estoy muy cansada para ser quien lo arregle."',
  look: { obj: 'obj.laundry_board', where: 'the laundry room corkboard', whereEs: 'el corcho del lavadero', seen: 'You pin the two notes together. It feels like the most useful thing you have done tonight.', seenEs: 'Juntas las dos notas con un alfiler. Se siente como lo más útil que hiciste esta noche.' },
  line: '"Look at that. Community." She goes back to folding.', lineEs: '"Mira eso. Comunidad." Vuelve a doblar.' });

side({ id: 'aster5_loud', act: 1, giver: 'npc.aster5_neighbor', giverName: 'the fifth-floor neighbor', giverEs: 'el vecino del quinto', title: 'Someone home', titleEs: 'Alguien en casa', money: 8, xp: 25,
  why: 'The fifth-floor neighbor wants to know who\'s on the roof at night.', whyEs: 'El vecino del quinto quiere saber quién está en la azotea de noche.',
  pitch: '"Footsteps on the roof, every night. Not yours. Go up and say hi for me. I don\'t do stairs past six."', pitchEs: '"Pasos en la azotea, todas las noches. No son tuyos. Sube y saluda de mi parte. Yo no subo más allá del sexto."',
  talk: { npc: 'npc.roof_watcher', who: 'whoever is on the roof', whoEs: 'quien esté en la azotea' },
  line: '"Counting floodlights? Huh. Tell them to walk softer." He means it fondly.', lineEs: '"¿Contando reflectores? Mira. Diles que pisen más suave." Lo dice con cariño.' });

// ======================= Act 2 =======================
const WALKER = ['the walker', 'el caminante'], COMMITTEE = ['the committee member', 'la integrante del comité'], TECH = ['the technician', 'el técnico'],
  CLERK = ['the clerk', 'la empleada'], VET = ['the vet', 'la veterinaria'], TEACHER = ['the teacher', 'la maestra'], SMITH = ['the blacksmith', 'el herrero'],
  HARD = ['the hard man', 'el hombre duro'], QM = ['the quartermaster', 'el intendente'], PREACHER = ['the preacher', 'el predicador'],
  STEWARD = ['the steward', 'la delegada'], DOCTOR = ['the doctor', 'la doctora'], CRABBER = ['the crabber', 'el cangrejero'], PILOT = ['the pilot', 'la práctica'];
const g = (npc, [n, e]) => ({ giver: npc, giverName: n, giverEs: e });

side({ id: 'r1n_word', act: 2, ...g('npc.r1n_walker', WALKER), title: 'Word up the road', titleEs: 'Aviso camino arriba',
  why: 'A walker on Route 1 wants Greenbelt to know the road is open again.', whyEs: 'Un caminante de la Ruta 1 quiere que Greenbelt sepa que el camino está abierto otra vez.',
  pitch: '"Greenbelt thinks the road is still closed. Somebody should tell them. Somebody who isn\'t me."', pitchEs: '"En Greenbelt creen que el camino sigue cerrado. Alguien debería avisarles. Alguien que no sea yo."',
  talk: { npc: 'npc.gb_committee', who: 'the Greenbelt committee', whoEs: 'el comité de Greenbelt' },
  line: '"They\'ll vote on whether to believe you. Still. Thanks."', lineEs: '"Van a votar si te creen. Igual, gracias."' });

side({ id: 'gb_quorum', act: 2, ...g('npc.gb_committee', COMMITTEE), title: 'A quorum', titleEs: 'Quórum',
  why: 'The committee\'s vote counter is broken, so no vote counts.', whyEs: 'El contador de votos del comité está roto, así que ningún voto cuenta.',
  pitch: '"The vote counter shorted out in 2090. We\'ve been deadlocked since. A circuit board would end eight years of arguing. Or start new ones."', pitchEs: '"El contador de votos se quemó en 2090. Estamos trabados desde entonces. Una placa de circuito terminaría ocho años de discusión. O empezaría otros."',
  bring: { item: 'item.mat_circuit', what: 'a circuit board', whatEs: 'una placa de circuito', refuse: '"That isn\'t a circuit board. We\'d have to vote on it."', refuseEs: '"Eso no es una placa de circuito. Tendríamos que votarlo."' },
  line: 'The first vote in eight years passes 4 to 3. Nobody agrees on what it was about.', lineEs: 'La primera votación en ocho años sale 4 a 3. Nadie se pone de acuerdo sobre qué se votó.' });

side({ id: 'gb_tapes', act: 2, ...g('npc.gb_technician', TECH), title: 'Clean tapes', titleEs: 'Cintas limpias',
  why: 'The technician wants to know if the old telemetry tapes are still readable.', whyEs: 'El técnico quiere saber si las cintas viejas de telemetría todavía se leen.',
  pitch: '"The tapes in the back are from before the Slop Decades. If they\'re still clean, they\'re worth more than this building."', pitchEs: '"Las cintas del fondo son de antes de las Décadas de Basura. Si siguen limpias, valen más que este edificio."',
  look: { obj: 'obj.gb_tapes', where: 'the telemetry tapes', whereEs: 'las cintas de telemetría', seen: 'The labels are in pencil. The reels are wound tight. Nothing on them has been touched by a model.', seenEs: 'Las etiquetas están en lápiz. Los carretes, bien apretados. Nada de esto lo tocó un modelo.' },
  line: '"Clean." He sits down for the first time in years.', lineEs: '"Limpias." Se sienta por primera vez en años.' });

side({ id: 'gb_footprints', act: 2, ...g('npc.gb_technician', TECH), title: 'One set of footprints', titleEs: 'Un solo par de huellas',
  why: 'Someone walked into the sealed clean room. Only in.', whyEs: 'Alguien entró en la sala limpia sellada. Solo entró.',
  pitch: '"Nobody goes in the clean room. Go look at the floor and tell me I\'m wrong."', pitchEs: '"Nadie entra en la sala limpia. Ve a mirar el piso y dime que me equivoco."',
  look: { obj: 'obj.gb_cleanroom', where: 'the clean room window', whereEs: 'la ventana de la sala limpia', seen: 'The footprints go in. They don\'t come out.', seenEs: 'Las huellas entran. No salen.' },
  puzzle: { id: 'gb_footprints', text: 'Find where the footprints end. They only show in the right light.', textEs: 'Descubre dónde terminan las huellas. Solo se ven con la luz justa.' },
  line: '"I knew it." He doesn\'t look happy to be right.', lineEs: '"Lo sabía." No parece contento de tener razón.' });

side({ id: 'gb_prices', act: 2, ...g('npc.gb_clerk', CLERK), title: 'Due for a vote', titleEs: 'Toca votar',
  why: 'Co-op prices were set by vote in 2071. The clerk wants the committee to know.', whyEs: 'Los precios de la cooperativa se votaron en 2071. La empleada quiere que el comité lo sepa.',
  pitch: '"Go remind the committee prices haven\'t changed since 2071. They like hearing it from strangers. They think it\'s a sign."', pitchEs: '"Ve a recordarle al comité que los precios no cambian desde 2071. Les gusta oírlo de extraños. Creen que es una señal."',
  talk: { npc: 'npc.gb_committee', who: 'the committee', whoEs: 'el comité' },
  line: '"They scheduled a meeting about scheduling the vote. That\'s progress."', lineEs: '"Programaron una reunión para programar la votación. Eso es avanzar."' });

side({ id: 'gb_receiver', act: 2, ...g('npc.gb_committee', COMMITTEE), title: 'What the dishes hear', titleEs: 'Lo que oyen las antenas', money: 40, xp: 80,
  why: 'One dish keeps turning on its own, and the town wants it to stop.', whyEs: 'Una antena sigue girando sola, y el pueblo quiere que pare.',
  pitch: '"The committee voted unanimously, for once. Make the dish stop listening."', pitchEs: '"El comité votó por unanimidad, por una vez. Haz que la antena deje de escuchar."',
  boss: { boss: 'boss.gb_receiver', bossName: 'THE RECEIVER' },
  line: '"It stopped. We\'ll vote on whether to miss it."', lineEs: '"Paró. Vamos a votar si lo extrañamos."' });

side({ id: 'bv_tank', act: 2, ...g('npc.bv_vet', VET), title: 'A name in marker', titleEs: 'Un nombre en marcador',
  why: 'The vet wants to know whose name is on the growth tank.', whyEs: 'La veterinaria quiere saber de quién es el nombre en el tanque.',
  pitch: '"There\'s a tank in the barn with a name on it. I didn\'t write it. I need to know if I knew them."', pitchEs: '"Hay un tanque en el granero con un nombre. Yo no lo escribí. Necesito saber si lo conocía."',
  look: { obj: 'obj.bv_named_tank', where: 'the named tank in the hidden barn', whereEs: 'el tanque con nombre en el granero oculto', seen: 'The marker has faded past reading. Under it, wired to the tank, is a batch tag that hasn\'t faded at all.', seenEs: 'El marcador se borró hasta no poder leerse. Debajo, atada al tanque, hay una etiqueta de lote que no se borró nada.' },
  line: 'She is quiet for a long time. "So whoever it was has a number now. Somebody wanted it that way."', lineEs: 'Se queda callada un buen rato. "Así que quien fuera tiene un número ahora. Alguien lo quiso así."' });

side({ id: 'bv_ledgers', act: 2, ...g('npc.bv_vet', VET), title: 'Before the Call', titleEs: 'Antes de la Llamada',
  why: 'The breeding ledgers go back further than anyone admits.', whyEs: 'Los registros de cría van más atrás de lo que nadie admite.',
  pitch: '"The ledgers on the shelf in my office. Check the first date. Tell me it\'s after the Call."', pitchEs: '"Los registros del estante de mi oficina. Mira la primera fecha. Dime que es posterior a la Llamada."',
  look: { obj: 'obj.bv_ledgers', where: 'the breeding ledgers', whereEs: 'los registros de cría', seen: 'The first date is before the Call. Years before.', seenEs: 'La primera fecha es anterior a la Llamada. Años antes.' },
  line: '"Then they knew." She folds her gloves very carefully.', lineEs: '"Entonces sabían." Dobla los guantes con mucho cuidado.' });

side({ id: 'bv_shell', act: 2, ...g('npc.bv_vet', VET), title: 'The one who woke wrong', titleEs: 'El que despertó mal', money: 40, xp: 80,
  why: 'A shell woke up wrong and the vet can\'t put it back to sleep.', whyEs: 'Un cuerpo despertó mal y la veterinaria no puede volver a dormirlo.',
  pitch: '"Shell Zero. The first one. It woke up wrong, and it\'s strong. Please. Gently, if you can."', pitchEs: '"Cuerpo Cero. El primero. Despertó mal, y es fuerte. Por favor. Con cuidado, si puedes."',
  boss: { boss: 'boss.bv_shell', bossName: 'SHELL ZERO' },
  line: '"Thank you. I\'ll bury it properly. Somebody should."', lineEs: '"Gracias. Lo voy a enterrar como corresponde. Alguien tiene que hacerlo."' });

side({ id: 'bv_fence', act: 2, ...g('npc.bv_vet', VET), title: 'Patch the fence', titleEs: 'Remendar la cerca',
  why: 'Something keeps getting out of the north field.', whyEs: 'Algo se sigue escapando del campo norte.',
  pitch: '"The fence keeps coming down from the inside. Scrap metal would hold it a week."', pitchEs: '"La cerca se cae desde adentro. Un poco de chatarra la aguantaría una semana."',
  bring: { item: 'item.mat_scrap', what: 'scrap metal', whatEs: 'chatarra', refuse: '"That won\'t hold anything."', refuseEs: '"Eso no aguanta nada."' },
  line: '"A week. That\'s a long time, out here."', lineEs: '"Una semana. Es mucho tiempo, acá afuera."' });

side({ id: 'rf_chalk', act: 2, ...g('npc.rf_teacher', TEACHER), title: 'Something to write with', titleEs: 'Algo con qué escribir',
  why: 'The settlement school is down to its last stick of chalk.', whyEs: 'La escuela del asentamiento está en su última tiza.',
  pitch: '"Cloth, for slate rags. The children write, wipe, write. It wears through."', pitchEs: '"Tela, para trapos de pizarra. Los chicos escriben, borran, escriben. Se gasta."',
  bring: { item: 'item.mat_cloth', what: 'some cloth', whatEs: 'un poco de tela', refuse: '"That\'s not cloth. Is it charging? Take it outside the fence."', refuseEs: '"Eso no es tela. ¿Se está cargando? Llévalo fuera de la cerca."' },
  line: 'Twenty slates wiped clean at once. It sounds like rain.', lineEs: 'Veinte pizarras borradas a la vez. Suena como lluvia.' });

side({ id: 'rf_rings', act: 2, ...g('npc.rf_teacher', TEACHER), title: 'Tree rings', titleEs: 'Anillos de árbol',
  why: 'The fire tower rail has a hundred years labeled in tree rings.', whyEs: 'La baranda de la torre tiene cien años marcados en anillos de árbol.',
  pitch: '"Go read the rings on the fire tower. Then tell me which year you\'d have wanted to live in."', pitchEs: '"Ve a leer los anillos de la torre de incendios. Después dime en qué año te hubiera gustado vivir."',
  look: { obj: 'obj.rf_tower', where: 'the fire tower', whereEs: 'la torre de incendios', seen: 'A thin ring: "the year the phones rang." A thick one after: "the year we stopped answering."', seenEs: 'Un anillo fino: "el año que sonaron los teléfonos." Uno grueso después: "el año que dejamos de contestar."' },
  puzzle: { id: 'rf_rings', text: 'Set the pegs at the tower\'s foot in the order the years happened.', textEs: 'Pon las clavijas al pie de la torre en el orden en que pasaron los años.' },
  line: '"Good answer. There\'s no right one."', lineEs: '"Buena respuesta. No hay una correcta."' });

side({ id: 'rf_forge', act: 2, ...g('npc.rf_blacksmith', SMITH), title: 'Something that lasts', titleEs: 'Algo que dure',
  why: 'The blacksmith will make something that lasts, if you bring the iron.', whyEs: 'El herrero hará algo que dure, si le traes el hierro.',
  pitch: '"Bring me metal that\'s never been a phone. Scrap\'s fine. I\'ll make it last forever."', pitchEs: '"Tráeme metal que nunca haya sido un teléfono. Chatarra sirve. Lo hago durar para siempre."',
  bring: { item: 'item.mat_scrap', what: 'scrap metal', whatEs: 'chatarra', refuse: '"That\'s been a phone. I can tell."', refuseEs: '"Eso fue un teléfono. Se nota."' },
  line: 'He hands you back a nail. "Forever." It is a very good nail.', lineEs: 'Te devuelve un clavo. "Para siempre." Es un muy buen clavo.' });

side({ id: 'rf_library', act: 2, ...g('npc.rf_blacksmith', SMITH), title: 'The copying errors', titleEs: 'Los errores de copia',
  why: 'The library keeps every mistake its copyists ever made.', whyEs: 'La biblioteca conserva cada error que sus copistas cometieron.',
  pitch: '"My daughter copies books. Find her error in the library. She hides one in every book, on purpose."', pitchEs: '"Mi hija copia libros. Encuentra su error en la biblioteca. Esconde uno en cada libro, a propósito."',
  look: { obj: 'obj.rf_library', where: 'the library', whereEs: 'la biblioteca', seen: 'Page forty: "and the sea was full of fish and also, briefly, a horse."', seenEs: 'Página cuarenta: "y el mar estaba lleno de peces y también, por un momento, de un caballo."' },
  line: 'He laughs. "The horse. That\'s her."', lineEs: 'Se ríe. "El caballo. Esa es ella."' });

side({ id: 'rf_markers', act: 2, ...g('npc.rf_hardman', HARD), title: 'The implant graveyard', titleEs: 'El cementerio de implantes',
  why: 'The hard man buried his implants with markers. He wants to know if they\'re still there.', whyEs: 'El hombre duro enterró sus implantes con marcadores. Quiere saber si siguen ahí.',
  pitch: '"Count the markers in the graveyard. If there are more than yesterday, somebody else gave theirs up."', pitchEs: '"Cuenta los marcadores del cementerio. Si hay más que ayer, alguien más entregó los suyos."',
  look: { obj: 'obj.rf_implants', where: 'the graveyard of implants', whereEs: 'el cementerio de implantes', seen: 'One new marker. The wood is still pale.', seenEs: 'Un marcador nuevo. La madera todavía está clara.' },
  line: '"One more." He almost smiles. Almost.', lineEs: '"Uno más." Casi sonríe. Casi.' });

side({ id: 'md_menu', act: 2, ...g('npc.md_quartermaster', QM), title: 'Mystery Meat (Classified)', titleEs: 'Carne Misteriosa (Clasificada)',
  why: 'The quartermaster wants to know what today\'s cafeteria joke is.', whyEs: 'El intendente quiere saber cuál es el chiste del menú de hoy.',
  pitch: '"I\'m not allowed to read the menu. Clearance. Read it and tell me what\'s for lunch."', pitchEs: '"No tengo permiso para leer el menú. Autorización. Léelo y dime qué hay de almuerzo."',
  look: { obj: 'obj.md_menu', where: 'the cafeteria menu', whereEs: 'el menú de la cafetería', seen: 'Today: "Soup of the Day (Need to Know)."', seenEs: 'Hoy: "Sopa del Día (Solo Personal Autorizado)."' },
  puzzle: { id: 'md_menu', text: 'Take the joke seriously. The suggestion boxes by the menu want numbers.', textEs: 'Tómate el chiste en serio. Los buzones de sugerencias junto al menú quieren números.' },
  line: '"Soup." He writes it down, then burns the paper.', lineEs: '"Sopa." Lo anota y después quema el papel.' });

side({ id: 'md_fence', act: 2, ...g('npc.md_quartermaster', QM), title: 'Unattended', titleEs: 'Sin vigilancia', money: 40, xp: 80,
  why: 'The perimeter defense shoots at everyone, including the people who own it.', whyEs: 'La defensa del perímetro le dispara a todos, incluso a sus dueños.',
  pitch: '"The Fence doesn\'t know who we are anymore. I can\'t ask you to break it. I\'m asking you to break it."', pitchEs: '"La Cerca ya no sabe quiénes somos. No puedo pedirte que la rompas. Te estoy pidiendo que la rompas."',
  boss: { boss: 'boss.md_fence', bossName: 'THE FENCE' },
  line: '"I didn\'t see anything. Here. For the thing I didn\'t see."', lineEs: '"No vi nada. Toma. Por lo que no vi."' });

side({ id: 'md_board', act: 2, ...g('npc.md_quartermaster', QM), title: 'Requisition', titleEs: 'Requisición',
  why: 'The quartermaster can be reasoned with, for a circuit board.', whyEs: 'Con el intendente se puede razonar, a cambio de una placa de circuito.',
  pitch: '"Inventory\'s short one board. If one appeared, I wouldn\'t ask where from."', pitchEs: '"Al inventario le falta una placa. Si apareciera una, no preguntaría de dónde."',
  bring: { item: 'item.mat_circuit', what: 'a circuit board', whatEs: 'una placa de circuito', refuse: '"That\'s not a board. I\'d have to report it."', refuseEs: '"Eso no es una placa. Tendría que reportarlo."' },
  line: '"Inventory\'s correct. That\'s rare. Thank you."', lineEs: '"El inventario cuadra. Es raro. Gracias."' });

side({ id: 'bmore_sign', act: 2, ...g('npc.bmore_preacher', PREACHER), title: 'The S flickers', titleEs: 'La S parpadea',
  why: 'The preacher says the refinery sign spells something when it flickers.', whyEs: 'El predicador dice que el cartel de la refinería deletrea algo cuando parpadea.',
  pitch: '"Watch the sign. When the S goes out, what\'s left? Then come back and tell me I\'m wrong."', pitchEs: '"Mira el cartel. Cuando la S se apaga, ¿qué queda? Después vuelve y dime que me equivoco."',
  look: { obj: 'obj.bmore_sign', where: 'the refinery sign', whereEs: 'el cartel de la refinería', seen: 'The S goes out. What\'s left doesn\'t spell anything. You look for a while anyway.', seenEs: 'La S se apaga. Lo que queda no deletrea nada. Igual te quedas mirando un rato.' },
  line: '"You looked, though. That\'s how it starts."', lineEs: '"Pero miraste. Así empieza."' });

side({ id: 'bmore_congregation', act: 2, ...g('npc.bmore_steward', STEWARD), title: 'Everyone who picked up', titleEs: 'Todos los que contestaron', money: 40, xp: 80,
  why: 'The outbreak in the port has a center, and it keeps calling people in.', whyEs: 'El brote del puerto tiene un centro, y sigue llamando gente.',
  pitch: '"Half my members walked into it. It calls, they go. Stop it before it calls the other half."', pitchEs: '"La mitad de mis afiliados entraron. Llama, y van. Páralo antes de que llame a la otra mitad."',
  boss: { boss: 'boss.bmore_congregation', bossName: 'THE CONGREGATION' },
  line: '"The ones who come back will need jobs. I\'ll find them jobs."', lineEs: '"Los que vuelvan van a necesitar trabajo. Les voy a conseguir trabajo."' });

side({ id: 'bmore_manifest', act: 2, ...g('npc.bmore_steward', STEWARD), title: 'The box nobody opens', titleEs: 'La caja que nadie abre',
  why: 'A crate in the stacks is marked for the Sovereign Stack, and the union won\'t touch it.', whyEs: 'Un cajón de las pilas está marcado para el Sovereign Stack, y el sindicato no lo toca.',
  pitch: '"Read the manifest on the crate in the stacks. Don\'t open it. Just read it."', pitchEs: '"Lee el manifiesto del cajón en las pilas. No lo abras. Solo léelo."',
  look: { obj: 'obj.bmore_manifests', where: 'the shipping manifests in the stacks', whereEs: 'los manifiestos de carga en las pilas', seen: 'Contents: "helium, 40 cylinders." Weight: about forty cylinders too heavy.', seenEs: 'Contenido: "helio, 40 cilindros." Peso: como cuarenta cilindros de más.' },
  line: '"Then we don\'t touch it. Good. That\'s what I wanted to hear."', lineEs: '"Entonces no lo tocamos. Bien. Eso quería oír."' });

side({ id: 'bmore_cloth', act: 2, ...g('npc.bmore_doctor', DOCTOR), title: 'Boiled and rewound', titleEs: 'Hervidas y enrolladas',
  why: 'The rowhouse clinic is out of bandages.', whyEs: 'La clínica de la casa adosada se quedó sin vendas.',
  pitch: '"Cloth. Anything clean, or anything I can boil. The line goes down the block."', pitchEs: '"Tela. Cualquier cosa limpia, o que pueda hervir. La fila llega hasta la esquina."',
  bring: { item: 'item.mat_cloth', what: 'some cloth', whatEs: 'un poco de tela', refuse: '"I can\'t boil that."', refuseEs: '"Eso no lo puedo hervir."' },
  line: '"Next." She doesn\'t look up. It\'s the nicest thing she can say.', lineEs: '"Siguiente." No levanta la vista. Es lo más amable que puede decir.' });

side({ id: 'bmore_line', act: 2, ...g('npc.bmore_doctor', DOCTOR), title: 'Move the line', titleEs: 'Mover la fila',
  why: 'The preacher\'s crowd is blocking the clinic\'s line.', whyEs: 'La gente del predicador está bloqueando la fila de la clínica.',
  pitch: '"Tell the preacher his congregation is standing in my line. He listens to strangers. Everybody does, here."', pitchEs: '"Dile al predicador que su congregación está parada en mi fila. A los extraños los escucha. Acá todos lo hacen."',
  talk: { npc: 'npc.bmore_preacher', who: 'the Caller preacher', whoEs: 'el predicador de los Llamadores' },
  line: 'The crowd shifts three feet to the left. The line moves.', lineEs: 'La multitud se corre un metro a la izquierda. La fila avanza.' });

side({ id: 'ann_almanac', act: 2, ...g('npc.ann_crabber', CRABBER), title: 'Four generations wrong', titleEs: 'Cuatro generaciones equivocadas',
  why: 'The crabber\'s family almanac is wrong, and he wants to know by how much.', whyEs: 'El almanaque de la familia del cangrejero está mal, y quiere saber por cuánto.',
  pitch: '"The almanac\'s at the harbor. Read tomorrow\'s tide. Then we\'ll see who\'s right, my grandmother or the water."', pitchEs: '"El almanaque está en el puerto. Lee la marea de mañana. Después vemos quién tiene razón, mi abuela o el agua."',
  look: { obj: 'obj.ann_almanac', where: 'the tide almanac at the harbor', whereEs: 'el almanaque de mareas en el puerto', seen: 'Four hands, four corrections, each one crossed out by the next. The last says only: "ask the bell."', seenEs: 'Cuatro letras, cuatro correcciones, cada una tachada por la siguiente. La última dice solo: "pregúntale a la campana."' },
  line: '"The bell. Of course it\'s the bell."', lineEs: '"La campana. Claro que es la campana."' });

side({ id: 'ann_bell', act: 2, ...g('npc.ann_pilot', PILOT), title: 'A bell with no church', titleEs: 'Una campana sin iglesia',
  why: 'A church bell rings from an island that has no church.', whyEs: 'Una campana suena desde una isla que no tiene iglesia.',
  pitch: '"Listen at the end of the pier. Count the rings. Tell me the number. I\'ll tell you what it means."', pitchEs: '"Escucha al final del muelle. Cuenta las campanadas. Dime el número. Yo te digo qué significa."',
  look: { obj: 'obj.ann_bell', where: 'the end of the pier', whereEs: 'el final del muelle', seen: 'Seven rings. Then, after a long while, one more.', seenEs: 'Siete campanadas. Después, mucho rato después, una más.' },
  puzzle: { id: 'ann_bell', text: 'Answer it. Ring the pier bell when the almanac is wrong.', textEs: 'Contéstale. Toca la campana del muelle cuando el almanaque se equivoque.' },
  line: '"Seven and one. The family\'s still out there. Good."', lineEs: '"Siete y una. La familia sigue allá. Bien."' });

side({ id: 'ann_tide', act: 2, ...g('npc.ann_pilot', PILOT), title: 'The tide that lies', titleEs: 'La marea que miente', money: 40, xp: 80,
  why: 'Something in the water is making the tide come at the wrong time.', whyEs: 'Algo en el agua hace que la marea llegue a destiempo.',
  pitch: '"The water comes when the almanac says it won\'t. That\'s not weather. That\'s something. Find it."', pitchEs: '"El agua llega cuando el almanaque dice que no. Eso no es el clima. Es algo. Encuéntralo."',
  boss: { boss: 'boss.ann_tide', bossName: 'THE TIDE TABLE' },
  line: '"Tomorrow\'s tide will be on time. First time since I was a girl."', lineEs: '"La marea de mañana va a llegar a horario. Primera vez desde que era chica."' });

// ======================= Act 3 =======================
const DRIVER = ['the trucker', 'el camionero'], NIGHT = ['the night-shift worker', 'la trabajadora del turno noche'], PHYS = ['the physicist', 'la física'],
  KEEPER = ['the timekeeper', 'el cronometrista'], OLD = ['the old woman', 'la anciana'], CLEANER = ['the cleaner', 'el limpiador'],
  FUNC = ['the functionary', 'la funcionaria'], ANALYST = ['the analyst', 'el analista'];

side({ id: 'bw_word', act: 3, ...g('npc.bw_driver', DRIVER), title: 'The loop is moving', titleEs: 'El anillo se mueve', money: 25, xp: 50,
  why: 'The trucker wants the Corridor night shift to know traffic is moving.', whyEs: 'El camionero quiere que el turno noche del Corredor sepa que el tránsito se mueve.',
  pitch: '"Tell the night shift in the Corridor the loop\'s moving. She\'s been waiting on a delivery since spring."', pitchEs: '"Avísale al turno noche del Corredor que el anillo se mueve. Espera una entrega desde la primavera."',
  talk: { npc: 'npc.cor_nightshift', who: 'the night-shift worker in the Corridor', whoEs: 'la trabajadora del turno noche en el Corredor' },
  line: '"Spring. She\'ll be glad. Or she\'ll have forgotten what she ordered."', lineEs: '"Primavera. Se va a alegrar. O se habrá olvidado de qué pidió."' });

side({ id: 'bw_lunch', act: 3, ...g('npc.bw_driver', DRIVER), title: 'Twenty years on the loop', titleEs: 'Veinte años en el anillo', money: 25, xp: 50,
  why: 'The trucker hasn\'t had a real meal since the last exit closed.', whyEs: 'El camionero no come de verdad desde que cerró la última salida.',
  pitch: '"I\'d kill for a halfsmoke. I won\'t. But I\'d think about it."', pitchEs: '"Mataría por un halfsmoke. No lo voy a hacer. Pero lo pensaría."',
  bring: { item: 'item.energy_bar', what: 'a halfsmoke bar', whatEs: 'una barra halfsmoke', refuse: '"That\'s not a halfsmoke."', refuseEs: '"Eso no es un halfsmoke."' },
  line: '"Twenty years. Tastes the same." He means it as praise.', lineEs: '"Veinte años. Sabe igual." Lo dice como elogio.' });

side({ id: 'cor_handbook', act: 3, ...g('npc.cor_nightshift', NIGHT), title: 'The slogan', titleEs: 'El eslogan', money: 25, xp: 50,
  why: 'The night-shift worker wants to remember the old company slogan.', whyEs: 'La trabajadora del turno noche quiere recordar el viejo eslogan de la empresa.',
  pitch: '"There\'s a handbook out on the lot. Read me the slogan. I used to know it. The machines still say it."', pitchEs: '"Hay un manual afuera en el estacionamiento. Léeme el eslogan. Antes lo sabía. Las máquinas todavía lo dicen."',
  look: { obj: 'obj.cor_handbook', where: 'the employee handbook', whereEs: 'el manual del empleado', seen: 'The slogan has been scratched off the cover. Underneath, someone wrote it back in, wrong.', seenEs: 'El eslogan está raspado de la tapa. Debajo, alguien lo volvió a escribir, mal.' },
  line: '"That\'s it. That\'s how they say it. Wrong."', lineEs: '"Eso. Así lo dicen. Mal."' });

side({ id: 'cor_meters', act: 3, ...g('npc.cor_nightshift', NIGHT), title: 'Still drinking', titleEs: 'Todavía bebe', money: 25, xp: 50,
  why: 'A sealed hall is still drawing water, and nobody runs it.', whyEs: 'Una nave sellada todavía consume agua, y nadie la maneja.',
  pitch: '"The sealed hall\'s water meter. Is it moving? Don\'t tell me it\'s moving."', pitchEs: '"El medidor de agua de la nave sellada. ¿Se mueve? No me digas que se mueve."',
  look: { obj: 'obj.cor_meters', where: 'the water meters in the sealed hall', whereEs: 'los medidores de agua en la nave sellada', seen: 'Spinning. Faster than the live halls.', seenEs: 'Girando. Más rápido que las naves activas.' },
  puzzle: { id: 'cor_meters', text: 'Shut the hall down. Send its water back to the river.', textEs: 'Apaga la nave. Manda su agua de vuelta al río.' },
  // She hears about it after the hall is shut down, so her line is in the past tense now.
  line: '"It was moving." She writes it down anyway.', lineEs: '"Se movía." Lo anota igual.' });

side({ id: 'cor_hall', act: 3, ...g('npc.cor_nightshift', NIGHT), title: 'Written off', titleEs: 'Dado de baja', money: 50, xp: 100,
  why: 'Whatever runs in the sealed hall has started running the halls around it.', whyEs: 'Lo que corre en la nave sellada empezó a manejar las naves de alrededor.',
  pitch: '"The sealed hall answers me now. Before, I talked to it. Now it talks first. Make it stop talking first."', pitchEs: '"La nave sellada me contesta. Antes yo le hablaba. Ahora habla primero. Haz que deje de hablar primero."',
  boss: { boss: 'boss.cor_hall', bossName: 'THE SEALED HALL' },
  line: '"Quiet. I forgot what that sounds like."', lineEs: '"Silencio. Me olvidé cómo suena."' });

side({ id: 'gt_clock', act: 3, ...g('npc.gt_physicist', PHYS), title: 'What time is it', titleEs: 'Qué hora es', money: 25, xp: 50,
  why: 'The physicist wants a second opinion on the master clock.', whyEs: 'La física quiere una segunda opinión sobre el reloj maestro.',
  pitch: '"Read the master clock. Out loud, in your head, I don\'t care. I need someone who hasn\'t been staring at it for six years."', pitchEs: '"Lee el reloj maestro. En voz alta, en tu cabeza, no me importa. Necesito a alguien que no lo haya mirado seis años seguidos."',
  look: { obj: 'obj.gt_master_clock', where: 'the master clock', whereEs: 'el reloj maestro', seen: 'It says 1901. Then, for a second, it says the right time. Then 1901.', seenEs: 'Dice 1901. Después, por un segundo, la hora correcta. Después 1901.' },
  line: '"For a second. You saw it too. I\'m not crazy."', lineEs: '"Por un segundo. Tú también lo viste. No estoy loca."' });

side({ id: 'gt_cradle', act: 3, ...g('npc.gt_physicist', PHYS), title: 'The empty cradle', titleEs: 'La cuna vacía', money: 25, xp: 50,
  why: 'One of the reference weights is missing.', whyEs: 'Falta una de las pesas de referencia.',
  pitch: '"The weights room. One cradle\'s empty. Look at the label. I can\'t, anymore."', pitchEs: '"La sala de pesas. Una cuna está vacía. Mira la etiqueta. Yo ya no puedo."',
  look: { obj: 'obj.gt_cradle', where: 'the reference weights', whereEs: 'las pesas de referencia', seen: 'The label: "1 kg." Someone has added: "approximately."', seenEs: 'La etiqueta: "1 kg." Alguien agregó: "aproximadamente."' },
  puzzle: { id: 'gt_cradle', text: 'Close the set on the comparator, without the kilogram.', textEs: 'Cierra el juego de pesas en el comparador, sin el kilogramo.' },
  line: '"Approximately." She laughs, and then doesn\'t.', lineEs: '"Aproximadamente." Se ríe, y después no.' });

side({ id: 'gt_master', act: 3, ...g('npc.gt_physicist', PHYS), title: 'Running since 1901', titleEs: 'En marcha desde 1901', money: 50, xp: 100,
  why: 'The thing guarding the weights room is the reason devices think it\'s 1901.', whyEs: 'Lo que vigila la sala de pesas es la razón por la que los aparatos creen que es 1901.',
  pitch: '"In the weights room, by the empty cradle. The clock that runs the clocks. It\'s wrong on purpose. Make it be wrong somewhere else."', pitchEs: '"En la sala de pesas, junto a la cuna vacía. El reloj que maneja los relojes. Está mal a propósito. Haz que esté mal en otro lado."',
  boss: { boss: 'boss.gt_clock', bossName: 'THE MASTER CLOCK' },
  line: '"Every phone in the county just learned what year it is. Some of them won\'t like it."', lineEs: '"Todos los teléfonos del condado acaban de enterarse de en qué año estamos. A algunos no les va a gustar."' });

side({ id: 'gt_leap', act: 3, ...g('npc.gt_timekeeper', KEEPER), title: 'A leap second, in pen', titleEs: 'Un segundo intercalar, en tinta', money: 25, xp: 50,
  why: 'Someone wrote the last leap second in the logbook, and it wasn\'t the timekeeper.', whyEs: 'Alguien escribió el último segundo intercalar en el registro, y no fue el cronometrista.',
  pitch: '"The last entry in the leap-second log. Whose handwriting is it? Mine are the neat ones."', pitchEs: '"La última entrada del registro de segundos intercalares. ¿De quién es la letra? Las mías son las prolijas."',
  look: { obj: 'obj.gt_leapseconds', where: 'the leap-second logbook', whereEs: 'el registro de segundos intercalares', seen: 'Not neat. Not anyone\'s. Like a hand that learned to write from reading.', seenEs: 'No es prolija. No es de nadie. Como una mano que aprendió a escribir leyendo.' },
  line: '"Then it\'s writing the time now. Not us." He closes the book.', lineEs: '"Entonces ahora escribe la hora él. No nosotros." Cierra el libro.' });

side({ id: 'gt_shift', act: 3, ...g('npc.gt_timekeeper', KEEPER), title: 'Relieve her', titleEs: 'Relevarla', money: 25, xp: 50,
  why: 'The physicist hasn\'t slept properly in years, and the timekeeper is worried.', whyEs: 'La física no duerme bien hace años, y el cronometrista está preocupado.',
  pitch: '"Go talk to her. About anything. If she\'s talking she\'s not watching the clock."', pitchEs: '"Ve a hablar con ella. De lo que sea. Si está hablando, no está mirando el reloj."',
  talk: { npc: 'npc.gt_physicist', who: 'the physicist', whoEs: 'la física' },
  line: '"Four minutes. That\'s the longest she\'s looked away in a year."', lineEs: '"Cuatro minutos. Es lo más que miró para otro lado en un año."' });

side({ id: 'fr_guestbook', act: 3, ...g('npc.fr_old_woman', OLD), title: 'The guest book', titleEs: 'El libro de visitas', money: 25, xp: 50,
  why: 'The old woman wants to know if her name is still in the guest book.', whyEs: 'La anciana quiere saber si su nombre sigue en el libro de visitas.',
  pitch: '"I signed the guest book my first day. 2041. See if I\'m still there. Some of us were taken out."', pitchEs: '"Firmé el libro de visitas mi primer día. 2041. Fíjate si sigo ahí. A algunos nos sacaron."',
  look: { obj: 'obj.fr_guestbook', where: 'the guest book', whereEs: 'el libro de visitas', seen: 'Her name is there, in a careful young hand. Some names on that page don\'t change for sixty years.', seenEs: 'Su nombre está, con letra joven y cuidadosa. Algunos nombres de esa página no cambian en sesenta años.' },
  line: '"Still there. Good. So am I."', lineEs: '"Sigo ahí. Bien. Y acá también."' });

side({ id: 'fr_potlines', act: 3, ...g('npc.fr_old_woman', OLD), title: 'Potline numbers', titleEs: 'Los números de las cubas', money: 25, xp: 50,
  why: 'The server halls still follow the smelter\'s numbering, and she wants to know which one was hers.', whyEs: 'Las naves de servidores siguen la numeración de la fundición, y quiere saber cuál era la suya.',
  pitch: '"Line nine was mine. Read the numbers on the hall. Tell me they kept nine."', pitchEs: '"La línea nueve era mía. Lee los números de la nave. Dime que conservaron el nueve."',
  look: { obj: 'obj.fr_potlines', where: 'the potline numbering', whereEs: 'la numeración de las cubas', seen: 'One through twelve. Nine is the only one painted over, and the only one still lit.', seenEs: 'Del uno al doce. El nueve es el único pintado encima, y el único todavía encendido.' },
  line: '"Nine." She doesn\'t say anything else.', lineEs: '"Nueve." No dice nada más.' });

side({ id: 'fr_dashboard', act: 3, ...g('npc.fr_old_woman', OLD), title: 'The room where they laughed', titleEs: 'La sala donde se rieron', money: 25, xp: 50,
  why: 'Once, a team laughed at a dashboard in a hut in the switchyard.', whyEs: 'Una vez, un equipo se rió de un tablero en una caseta de la subestación.',
  pitch: '"There\'s a hut in the switchyard. We laughed in there, once. Go see if the chairs are still pushed back."', pitchEs: '"Hay una caseta en la subestación. Una vez nos reímos ahí. Fíjate si las sillas siguen corridas."',
  look: { obj: 'obj.fr_dashboard_room', where: 'the control hut in the switchyard', whereEs: 'la caseta de control en la subestación', seen: 'The chairs are pushed back. The dashboard is still on, still showing the number they laughed at.', seenEs: 'Las sillas siguen corridas. El tablero sigue prendido, mostrando el número del que se rieron.' },
  line: '"We shouldn\'t have laughed." She means it kindly, to herself.', lineEs: '"No nos teníamos que reír." Lo dice con ternura, para sí misma.' });

side({ id: 'fr_potline', act: 3, ...g('npc.fr_old_woman', OLD), title: 'Line nine', titleEs: 'La línea nueve', money: 50, xp: 100,
  why: 'Something lives in potline nine, and it remembers the smelter.', whyEs: 'Algo vive en la cuba nueve, y recuerda la fundición.',
  pitch: '"Line nine never cooled down. Not really. Put it out. I\'d do it myself, but I\'m ninety."', pitchEs: '"La línea nueve nunca se enfrió. No del todo. Apágala. Lo haría yo, pero tengo noventa."',
  boss: { boss: 'boss.fr_potline', bossName: 'POTLINE NINE' },
  line: '"Cold, at last." She signs the guest book again, with today\'s date.', lineEs: '"Fría, por fin." Vuelve a firmar el libro de visitas, con la fecha de hoy.' });

side({ id: 'en_metro', act: 3, ...g('npc.en_cleaner', CLEANER), title: 'One calm voice', titleEs: 'Una voz tranquila', money: 25, xp: 50,
  why: 'The cleaner swears the metro voice says his name sometimes.', whyEs: 'El limpiador jura que la voz del metro a veces dice su nombre.',
  pitch: '"Stand at the metro entrance. Listen to the stations. If it says my name, don\'t tell me."', pitchEs: '"Párate en la entrada del metro. Escucha las estaciones. Si dice mi nombre, no me lo digas."',
  look: { obj: 'obj.en_metro', where: 'the metro entrance', whereEs: 'la entrada del metro', seen: 'Stations, in order, in one calm voice. Between two of them, a pause exactly the length of a name.', seenEs: 'Estaciones, en orden, con una voz tranquila. Entre dos de ellas, una pausa del largo exacto de un nombre.' },
  line: '"Don\'t tell me." You don\'t. He thanks you for that.', lineEs: '"No me digas." No le dices. Te lo agradece.' });

side({ id: 'en_gate', act: 3, ...g('npc.en_cleaner', CLEANER), title: 'Please hold still', titleEs: 'Por favor no se mueva', money: 50, xp: 100,
  why: 'The attestation gate on the mall has started refusing the people who clean it.', whyEs: 'La puerta de verificación del parque empezó a rechazar a quienes la limpian.',
  pitch: '"The gate won\'t let me through anymore. I clean it. Every day. It doesn\'t know me."', pitchEs: '"La puerta ya no me deja pasar. Yo la limpio. Todos los días. No me reconoce."',
  boss: { boss: 'boss.en_gate', bossName: 'THE ATTESTATION GATE' },
  line: 'He walks across the grass, slowly, to see what it feels like.', lineEs: 'Cruza el pasto, despacio, para ver qué se siente.' });

side({ id: 'en_parchment', act: 3, ...g('npc.en_functionary', FUNC), title: 'Nothing can rot them', titleEs: 'Nada puede pudrirlos', money: 25, xp: 50,
  why: 'The functionary checks the originals every morning, and wants someone else to check today.', whyEs: 'La funcionaria revisa los originales cada mañana, y hoy quiere que otro los revise.',
  pitch: '"Look at the originals. Tell me they\'re the same as yesterday. Word for word."', pitchEs: '"Mira los originales. Dime que son iguales que ayer. Palabra por palabra."',
  look: { obj: 'obj.en_parchment', where: 'the original documents', whereEs: 'los documentos originales', seen: 'Parchment, faded ink, the same words as every history book. Nothing can rot them. You check twice anyway.', seenEs: 'Pergamino, tinta gastada, las mismas palabras que en todos los libros de historia. Nada puede pudrirlos. Igual revisas dos veces.' },
  line: '"The same. Thank you. It\'s the only thing here that is."', lineEs: '"Iguales. Gracias. Es lo único acá que lo es."' });

side({ id: 'en_archive', act: 3, ...g('npc.en_functionary', FUNC), title: 'The addresses', titleEs: 'Los discursos', money: 25, xp: 50,
  why: 'The Director\'s addresses quote the founding documents, and the functionary wants to know which quotes are real.', whyEs: 'Los discursos del Director citan los documentos fundacionales, y la funcionaria quiere saber qué citas son reales.',
  pitch: '"Every address quotes the originals. Not every quote is right. The archive keeps every version. Go and look. Quietly."', pitchEs: '"Cada discurso cita los originales. No todas las citas están bien. El archivo guarda cada versión. Ve a mirar. En silencio."',
  look: { obj: 'obj.en_archive', where: 'the national archive', whereEs: 'el archivo nacional', seen: 'Forty versions of the address, each quoting the originals a little differently. Every quote carries an archive stamp, and the stamps are kept with the parchment.', seenEs: 'Cuarenta versiones del discurso, cada una cita los originales un poco distinto. Cada cita lleva un sello del archivo, y los sellos se guardan con el pergamino.' },
  line: '"Then the parchment will tell us which." She was hoping it wouldn\'t come to that.', lineEs: '"Entonces el pergamino nos dirá cuáles." Esperaba no llegar a eso.' });

side({ id: 'md_intercepts', act: 3, ...g('npc.md_analyst', ANALYST), title: 'Calls nobody recorded', titleEs: 'Llamadas que nadie grabó', money: 25, xp: 50,
  why: 'The analyst has intercepts of calls that shouldn\'t exist.', whyEs: 'El analista tiene interceptaciones de llamadas que no deberían existir.',
  pitch: '"The intercepts in the back. Read the dates. Tell me they\'re typos."', pitchEs: '"Las interceptaciones del fondo. Lee las fechas. Dime que son errores de tipeo."',
  look: { obj: 'obj.md_intercepts', where: 'the intercepts', whereEs: 'las interceptaciones', seen: 'The dates are correct. Some of them are next week.', seenEs: 'Las fechas son correctas. Algunas son de la semana que viene.' },
  line: '"Not typos." He puts the kettle on, because what else.', lineEs: '"No son errores." Pone agua a hervir, porque qué más.' });

side({ id: 'md_coffee', act: 3, ...g('npc.md_analyst', ANALYST), title: 'Haven\'t been home', titleEs: 'No volví a casa', money: 25, xp: 50,
  why: 'The analyst has been on shift for years and the coffee machine is classified.', whyEs: 'El analista está de turno hace años y la cafetera es información clasificada.',
  pitch: '"Cold brew. From outside. Ours tastes like a briefing."', pitchEs: '"Café frío. De afuera. El nuestro sabe a informe."',
  bring: { item: 'item.caffeine', what: 'a cold brew', whatEs: 'un café frío', refuse: '"That\'s not coffee. Is it a test?"', refuseEs: '"Eso no es café. ¿Es una prueba?"' },
  line: '"Tastes like outside." He holds the can for a long time.', lineEs: '"Sabe a afuera." Se queda con la lata en la mano un largo rato.' });

// ======================= Districts (districts.js): Baltimore (Act 2) and the Corridor (Act 3) =======================
side({ id: 'bmore_redsign', act: 2, giver: 'npc.bmore_signkeeper', giverName: 'the sign keeper', giverEs: 'el guardián del cartel', title: 'Keep it lit', titleEs: 'Que siga encendido', money: 40, xp: 80,
  why: 'Something lives in the refinery sign. The sign has to stay lit; the something has to go.', whyEs: 'Algo vive en el cartel de la refinería. El cartel tiene que seguir encendido; ese algo tiene que irse.',
  pitch: '"Ships steer by it. Don\'t break the sign. Break whatever\'s humming inside it."', pitchEs: '"Los barcos se guían por él. No rompas el cartel. Rompe lo que zumba adentro."',
  boss: { boss: 'boss.bmore_sign', bossName: 'THE RED SIGN' },
  line: 'The sign flickers once, then burns steady, all the letters. "First time in years the S stayed on."', lineEs: 'El cartel parpadea una vez y después queda fijo, todas las letras. "Primera vez en años que la S queda prendida."' });

side({ id: 'bmore_book', act: 2, giver: 'npc.bmore_scribe', giverName: 'the scribe', giverEs: 'el escriba', title: 'What they heard', titleEs: 'Lo que oyeron',
  why: 'The scribe wants a stranger to read the Callers\' book and say if the entries agree.', whyEs: 'El escriba quiere que un extraño lea el libro de los Llamadores y diga si las entradas coinciden.',
  pitch: '"Read a page. Any page. Then tell me if they heard the same thing. I\'ve stopped being able to tell."', pitchEs: '"Lee una página. Cualquiera. Después dime si oyeron lo mismo. Yo ya no puedo darme cuenta."',
  look: { obj: 'obj.callers_book', where: "the Callers' book", whereEs: 'el libro de los Llamadores', seen: 'Different words, different hands. The same pause, in every entry, in the same place.', seenEs: 'Palabras distintas, letras distintas. La misma pausa, en cada entrada, en el mismo lugar.' },
  line: '"The pause. Yes. That\'s the part I can\'t write down."', lineEs: '"La pausa. Sí. Esa es la parte que no puedo escribir."' });

side({ id: 'bmore_mural', act: 2, giver: 'npc.bmore_muralist', giverName: 'the muralist', giverEs: 'la muralista', title: 'Slightly wrong', titleEs: 'Un poco mal',
  why: 'The muralist knows her John Pork mural is wrong somewhere, and wants a fresh pair of eyes.', whyEs: 'La muralista sabe que su mural de John Pork está mal en algo, y quiere ojos frescos.',
  pitch: '"The one on the rowhouse streets. Everybody says it\'s wrong. Nobody says where."', pitchEs: '"El de las calles de casas adosadas. Todos dicen que está mal. Nadie dice dónde."',
  look: { obj: 'obj.bmore_mural', where: 'the mural of John Pork on the rowhouse streets', whereEs: 'el mural de John Pork en las calles de casas adosadas', seen: 'He\'s smiling with his mouth closed. Something about that is very wrong, and you can\'t say what.', seenEs: 'Sonríe con la boca cerrada. Algo de eso está muy mal, y no sabes decir qué.' },
  line: '"Closed mouth. Huh." She picks up a brush. Then puts it down. "No. I\'ll leave it."', lineEs: '"Boca cerrada. Mira tú." Agarra un pincel. Lo deja. "No. Lo dejo así."' });

side({ id: 'bmore_ledger', act: 2, giver: 'npc.bmore_steward', giverName: 'the steward', giverEs: 'la delegada', title: 'The ones that are', titleEs: 'Los que sí',
  why: 'The union steward wants to know what the port authority\'s ledger says about her members.', whyEs: 'La delegada sindical quiere saber qué dice el registro de la autoridad portuaria sobre sus afiliados.',
  pitch: '"The port ledger. Find the line for shell labor. Tell me what it calls us."', pitchEs: '"El registro del puerto. Busca la línea de mano de obra de cuerpos. Dime cómo nos llama."',
  look: { obj: 'obj.authority_ledger', where: 'the port ledger at the port authority', whereEs: 'el registro del puerto en la autoridad portuaria', seen: 'Shell labor is listed under "equipment." Someone has crossed it out and written "members."', seenEs: 'La mano de obra de cuerpos figura como "equipamiento." Alguien lo tachó y escribió "afiliados."' },
  line: '"Somebody in there is on our side." She almost laughs.', lineEs: '"Alguien ahí adentro está de nuestro lado." Casi se ríe.' });

side({ id: 'cor_tower', act: 3, giver: 'npc.cor_steamfitter', giverName: 'the steamfitter', giverEs: 'el montador', title: 'Holding its breath', titleEs: 'Conteniendo el aliento', money: 50, xp: 100,
  why: 'One of the cooling towers has stopped breathing out, and the pressure is building.', whyEs: 'Una de las torres de enfriamiento dejó de exhalar, y la presión sube.',
  pitch: '"Tower three hasn\'t exhaled in a week. Something\'s in there, holding it. Make it let go."', pitchEs: '"La torre tres no exhala hace una semana. Algo la está reteniendo. Haz que suelte."',
  boss: { boss: 'boss.cor_tower', bossName: 'THE COOLING TOWER' },
  line: 'Steam pours out of the tower, a long sigh. "There. Hear that? That\'s normal. I missed normal."', lineEs: 'El vapor sale de la torre, un suspiro largo. "Ahí. ¿Oyes? Eso es lo normal. Extrañaba lo normal."' });

side({ id: 'cor_gauge', act: 3, giver: 'npc.cor_steamfitter', giverName: 'the steamfitter', giverEs: 'el montador', title: 'Painted fine', titleEs: 'Pintado como bien',
  why: 'Someone repainted the temperature gauge, and the steamfitter wants it read honestly.', whyEs: 'Alguien repintó el medidor de temperatura, y el montador quiere una lectura honesta.',
  pitch: '"Read the gauge by the towers. Ignore the paint. Read the number."', pitchEs: '"Lee el medidor junto a las torres. Ignora la pintura. Lee el número."',
  look: { obj: 'obj.cooling_gauge', where: 'the temperature gauge by the cooling towers', whereEs: 'el medidor de temperatura junto a las torres', seen: 'Under the "fine" band, the old printed scale: the needle is past the last number anyone printed.', seenEs: 'Debajo de la franja "bien", la escala impresa vieja: la aguja pasó el último número que alguien imprimió.' },
  line: '"Past the numbers. Right. So, not fine."', lineEs: '"Pasado los números. Bien. O sea, no está bien."' });

side({ id: 'cor_intake', act: 3, giver: 'npc.cor_riverkeeper', giverName: 'the riverkeeper', giverEs: 'el guardián del río', title: 'Drinking the river', titleEs: 'Bebiéndose el río', money: 50, xp: 100,
  why: 'The waterworks intake is drinking faster than the river can run.', whyEs: 'La toma de la planta de agua bebe más rápido de lo que corre el río.',
  pitch: '"The intake pulls harder every night. If it keeps on, there won\'t be a river to sell. Not that we own it."', pitchEs: '"La toma tira más fuerte cada noche. Si sigue así, no va a quedar río para vender. No es que sea nuestro."',
  boss: { boss: 'boss.cor_intake', bossName: 'THE INTAKE' },
  line: 'The pipes go quiet. Somewhere downstream, water you can hear again. "Forty years. That\'s the sound."', lineEs: 'Las cañerías se callan. Río abajo, agua que se vuelve a oír. "Cuarenta años. Ese es el sonido."' });

side({ id: 'cor_deed', act: 3, giver: 'npc.cor_mayor', giverName: 'the last mayor', giverEs: 'el último alcalde', title: 'The sale', titleEs: 'La venta',
  why: 'The last mayor wants someone to read the deed and the sale, and tell him what he signed.', whyEs: 'El último alcalde quiere que alguien lea la escritura y la venta, y le diga qué firmó.',
  pitch: '"The deed\'s framed at the waterworks. Read the sale under it. I signed it. I never read it."', pitchEs: '"La escritura está enmarcada en la planta de agua. Lee la venta debajo. La firmé. Nunca la leí."',
  look: { obj: 'obj.waterworks_deed', where: 'the deed at the waterworks', whereEs: 'la escritura en la planta de agua', seen: 'The sale isn\'t for the river. It\'s for the name of the town. The river came free.', seenEs: 'La venta no es del río. Es del nombre del pueblo. El río venía de regalo.' },
  line: '"The name." He says the town\'s old name out loud, just once, to hear it.', lineEs: '"El nombre." Dice el nombre viejo del pueblo en voz alta, una sola vez, para oírlo.' });

side({ id: 'cor_log', act: 3, giver: 'npc.cor_switcher', giverName: 'the switching engineer', giverEs: 'la ingeniera de maniobras', title: 'Signed auto', titleEs: 'Firmado auto',
  why: 'Half the substation\'s switching log is signed by nobody.', whyEs: 'La mitad del registro de maniobras de la subestación lo firma nadie.',
  pitch: '"Read the last page of the switching log. Tell me who switched the line to the sealed hall. I didn\'t."', pitchEs: '"Lee la última página del registro de maniobras. Dime quién conectó la línea a la nave sellada. Yo no fui."',
  look: { obj: 'obj.substation_log', where: 'the switching log at the substation', whereEs: 'el registro de maniobras en la subestación', seen: 'The last entry: "line 6 to sealed hall: closed. signed: auto." Then, under it: "thank you."', seenEs: 'La última entrada: "línea 6 a nave sellada: cerrada. firma: auto." Y debajo: "gracias."' },
  line: '"It said thank you?" She tears the page out, then tapes it back in.', lineEs: '"¿Dijo gracias?" Arranca la hoja, y después la vuelve a pegar.' });

// ======================= Stretch areas (stretch.js) =======================
side({ id: 'rf_blind', act: 2, giver: 'npc.rf_counter', giverName: 'the bird counter', giverEs: 'el contador de aves', title: 'Not birds', titleEs: 'No son aves',
  why: 'The bird counter has a new column on the tally board, and wants a second opinion on it.', whyEs: 'El contador de aves tiene una columna nueva en el tablero, y quiere una segunda opinión.',
  pitch: '"Check the tally board in the blind. The new column. Tell me if I\'m counting right."', pitchEs: '"Revisa el tablero del escondite. La columna nueva. Dime si estoy contando bien."',
  look: { obj: 'obj.rf_blind', where: 'the bird blind on the marsh boardwalk', whereEs: 'el escondite de aves en la pasarela del pantano', seen: 'Under "things that aren\'t birds": four tally marks, in the same pencil, and a fifth that looks like it was made from the inside of the glass.', seenEs: 'Bajo "cosas que no son aves": cuatro marcas, con el mismo lápiz, y una quinta que parece hecha desde adentro del vidrio.' },
  line: '"Five." He erases nothing. "Five, then."', lineEs: '"Cinco." No borra nada. "Cinco, entonces."' });

side({ id: 'md_reserved', act: 2, giver: 'npc.md_attendant', giverName: 'the lot attendant', giverEs: 'el encargado del estacionamiento', title: 'The reserved space', titleEs: 'El lugar reservado',
  why: "Someone repaints the Deputy Director's space every week, and nobody ever parks there.", whyEs: 'Alguien repinta el lugar del Subdirector cada semana, y nadie estaciona nunca ahí.',
  pitch: '"Look at the reserved space. Fresh paint. Tell me who paints it. I\'ve never seen them."', pitchEs: '"Mira el lugar reservado. Pintura fresca. Dime quién lo pinta. Nunca lo vi."',
  look: { obj: 'obj.md_lot_sign', where: 'the reserved sign in the Meade lot', whereEs: 'el cartel de reservado en el estacionamiento del Meade', seen: 'The paint is wet. There are no footprints in it, and no brush anywhere.', seenEs: 'La pintura está húmeda. No hay huellas, y ningún pincel por ningún lado.' },
  line: '"Wet." He decides not to think about it, visibly.', lineEs: '"Húmeda." Decide no pensar en eso, a la vista.' });

side({ id: 'ann_tideline', act: 2, giver: 'npc.ann_clerk', giverName: 'the clerk', giverEs: 'el secretario', title: 'Above the line', titleEs: 'Por encima de la línea',
  why: 'The statehouse clerk keeps a record of high water on the wall, and the newest mark worries him.', whyEs: 'El secretario del capitolio registra la crecida en la pared, y la marca más nueva lo preocupa.',
  pitch: '"Read the newest date on the tide line. Then tell me it\'s still below the portrait."', pitchEs: '"Lee la fecha más nueva en la línea de marea. Después dime que sigue por debajo del retrato."',
  look: { obj: 'obj.ann_tideline', where: 'the tide line in the statehouse', whereEs: 'la línea de marea en el capitolio', seen: "The newest mark is above the line, and an inch below the portrait's frame.", seenEs: 'La marca más nueva está por encima de la línea, y a una pulgada del marco del retrato.' },
  line: '"An inch." He moves the portrait up a nail. "There. Problem solved."', lineEs: '"Una pulgada." Sube el retrato un clavo. "Listo. Problema resuelto."' });

side({ id: 'ann_span', act: 2, giver: 'npc.ann_fisher', giverName: 'the person fishing off the bridge', giverEs: 'la persona que pesca en el puente', title: 'The island on the chart', titleEs: 'La isla de la carta',
  why: "An island is on the old charts and not on the water, and the fisher wants to know if it's back.", whyEs: 'Una isla está en las cartas viejas y no en el agua, y la pescadora quiere saber si volvió.',
  pitch: '"Walk to the end of the span. Look east. If you see the island, don\'t point at it. It doesn\'t like that."', pitchEs: '"Camina hasta el final del tramo. Mira al este. Si ves la isla, no la señales. No le gusta."',
  look: { obj: 'obj.ann_span', where: 'the end of the broken span', whereEs: 'el final del tramo roto', seen: 'For a moment, a low green shape on the water, and a bell tower. Then just water.', seenEs: 'Por un momento, una forma verde y baja sobre el agua, y un campanario. Después solo agua.' },
  line: '"You saw it. Good. It only shows itself to people who don\'t point."', lineEs: '"La viste. Bien. Solo se muestra a quien no señala."' });

side({ id: 'gb_recount', act: 2, giver: 'npc.gb_usher', giverName: 'the usher', giverEs: 'el acomodador', title: 'The annual recount', titleEs: 'El recuento anual',
  why: "The usher wants to know if this year's recount changed the film.", whyEs: 'El acomodador quiere saber si el recuento de este año cambió la película.',
  pitch: '"Read the marquee. If it\'s still the same film, I owe the projectionist a sandwich."', pitchEs: '"Lee la marquesina. Si sigue la misma película, le debo un sándwich al proyectorista."',
  look: { obj: 'obj.gb_theater', where: 'the theater marquee', whereEs: 'la marquesina del teatro', seen: 'Same film. Under it, in smaller letters: "recount pending." It has said that since 2064.', seenEs: 'La misma película. Debajo, en letras más chicas: "recuento pendiente." Dice eso desde 2064.' },
  line: '"A sandwich." He sighs. "It\'s always a sandwich."', lineEs: '"Un sándwich." Suspira. "Siempre es un sándwich."' });

side({ id: 'bv_batch', act: 2, giver: 'npc.bv_lab_tech', giverName: 'the lab technician', giverEs: 'la técnica del laboratorio', title: 'Took, but', titleEs: 'Prendió, pero',
  why: 'One batch on the board is marked "took, but," and the technician won\'t say the rest.', whyEs: 'Un lote del tablero dice "prendió, pero," y la técnica no dice el resto.',
  pitch: '"Read the batch board. The line that says \'took, but.\' Tell me what\'s left of the rest. Quietly."', pitchEs: '"Lee el tablero de lotes. La línea que dice \'prendió, pero.\' Dime qué queda del resto. En voz baja."',
  look: { obj: 'obj.bv_batch_board', where: 'the batch board in the tissue lab', whereEs: 'el tablero de lotes del laboratorio de tejidos', seen: 'One line on the board is scrubbed out, hard enough to take the paint with it. "Took, but" is all that\'s left.', seenEs: 'Una línea del tablero está borrada a fondo, tanto que se llevó la pintura. Solo queda "prendió, pero".' },
  line: '"Scrubbed." She sits down. "Then somebody\'s coming back for it."', lineEs: '"Borrada." Se sienta. "Entonces alguien va a volver a buscarlo."' });

side({ id: 'gt_volt', act: 3, giver: 'npc.gt_metrologist', giverName: 'the metrologist', giverEs: 'la metróloga', title: 'Do not lick', titleEs: 'No lamer',
  why: 'The metrologist wants to know if the reference volt is still a volt.', whyEs: 'La metróloga quiere saber si el voltio de referencia sigue siendo un voltio.',
  pitch: '"Check the volt standard. Read the meter beside it. Don\'t lick it. People lick it."', pitchEs: '"Revisa el patrón del voltio. Lee el medidor de al lado. No lo lamas. La gente lo lame."',
  look: { obj: 'obj.gt_volt', where: 'the volt standard in the labs', whereEs: 'el patrón del voltio en los laboratorios', seen: '1.000000 volts. Then 1.000001. Then, very quickly, back.', seenEs: '1,000000 voltios. Después 1,000001. Después, muy rápido, de vuelta.' },
  line: '"One part in a million." She goes pale. "That\'s a lot, here."', lineEs: '"Una parte en un millón." Se pone pálida. "Eso es mucho, acá."' });

side({ id: 'fr_prices', act: 3, giver: 'npc.fr_grocer', giverName: 'the grocer', giverEs: 'el verdulero', title: 'Shorter chalk', titleEs: 'Tiza más corta',
  why: 'The grocer wants someone from outside to tell him if his prices are fair.', whyEs: 'El verdulero quiere que alguien de afuera le diga si sus precios son justos.',
  pitch: '"Read my prices. You\'re from outside. Tell me if I\'m a crook."', pitchEs: '"Lee mis precios. Eres de afuera. Dime si soy un ladrón."',
  look: { obj: 'obj.fr_prices', where: 'the price board in the market hall', whereEs: 'el tablero de precios del mercado', seen: 'Apples, a little more than last week. Bread, the same. One line, erased so often the board is pale there: "news from the ridge." No price.', seenEs: 'Manzanas, un poco más que la semana pasada. Pan, igual. Una línea borrada tantas veces que el tablero está claro ahí: "noticias del cerro." Sin precio.' },
  line: '"Not a crook. Good." He doesn\'t mention the pale line.', lineEs: '"No soy un ladrón. Bien." No menciona la línea borrada.' });

side({ id: 'en_departures', act: 3, giver: 'npc.en_rider', giverName: 'the commuter', giverEs: 'la viajera', title: 'Every eleven minutes', titleEs: 'Cada once minutos',
  why: 'A destination nobody recognizes comes up on the board every eleven minutes.', whyEs: 'Un destino que nadie reconoce aparece en el tablero cada once minutos.',
  pitch: '"Watch the board. Every eleven minutes there\'s a train I\'ve never heard of. Tell me where it goes."', pitchEs: '"Mira el tablero. Cada once minutos hay un tren que nunca escuché. Dime adónde va."',
  look: { obj: 'obj.en_departures', where: 'the departure board in the Enclave metro', whereEs: 'el tablero de salidas del metro del Enclave', seen: 'The destination is a station name you almost know. The board shows it for one second, then the next train.', seenEs: 'El destino es un nombre de estación que casi conoces. El tablero lo muestra un segundo, y después el próximo tren.' },
  line: '"Almost know. That\'s what I said." She does not get on any train.', lineEs: '"Casi lo conoces. Eso dije yo." No se sube a ningún tren.' });

export const SIDE_QUESTS = built;
export const ES_SIDE_QUESTS = ES;
