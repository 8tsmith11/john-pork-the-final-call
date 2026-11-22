// Optional puzzles, as data for the puzzle kit (src/content/puzzleKit.js): the planned item puzzles for Acts 2-3
// (docs/sealed/acts-2-3.md §2-3), built in the lore gate's order (docs/sealed/scaffold-cohesion.md §7.2, hub #116).
// Each one grows out of a scaffold side quest, which is now its first stage (src/content/sideQuests.js, `puzzle:`):
// the giver sends you to look, the look shows you the puzzle, and the giver hears about it once it's solved.
// Spec shape:
//
//   definePuzzle({ id: 'tree_rings', kind: 'order', parts: ['obj.ring_a', ...], answer: [...],
//     stepText, stepTextEs, wrongText, wrongTextEs,
//     reward: { text, textEs, item?, money?, flag? } })
//
// Parts are map object ids; tests check they exist. Clues go in other objects' text, never in the part's own.
// The kit prints a cycle part's state as it is in `states`, in both languages, so states are marks that need no
// translating (digits, a pan's letter, a stop stamped on a collar).
import { definePuzzle, cycleWindow } from './puzzleKit.js';

export const PUZZLES = [
  // ---- Annapolis: the bell with no church (timed). The almanac's last correction says to ask the bell; the tide
  // board on the last piling says what the almanac swears. The reward is the island's trust (the solved flag) and
  // a boat upgrade with no boat: M2.5 keeps the boat.
  { id: 'ann_bell', kind: 'timed', parts: ['obj.ann_pier_bell'], window: cycleWindow(100, 25, 60),
    closedText: 'You ring it. The water sits under the red line, where the almanac says it stays, and the bay keeps the sound. The tide here turns when it likes. It likes to make people wait.',
    closedTextEs: 'La tocas. El agua está debajo de la línea roja, donde el almanaque dice que se queda, y la bahía se guarda el sonido. Acá la marea cambia cuando quiere. Le gusta hacer esperar.',
    solvedText: 'You let it hang. They heard you the first time.',
    solvedTextEs: 'La dejas quieta. Te oyeron la primera vez.',
    reward: { item: 'item.ann_oarlocks',
      text: 'The water is over the red line, which the almanac swears it can\'t be. You ring. This time the island answers: seven, a long gap, one. Before the last one fades there is a skiff alongside, and a woman in it who doesn\'t tie up. "You ring like family." She hands up a pair of bronze oarlocks. "For when you have something to put them on." (Bronze oarlocks)',
      textEs: 'El agua está por encima de la línea roja, cosa que el almanaque jura que no puede pasar. Tocas. Esta vez la isla contesta: siete, un hueco largo, una. Antes de que se apague la última hay un esquife al costado, y en él una mujer que no amarra. "Tocas como de la familia." Te alcanza un par de toletes de bronce. "Para cuando tengas dónde ponerlos." (Toletes de bronce)' } },

  // ---- Gaithersburg: the empty cradle (cycle + check). Each weight's peg steps 0 (its cradle) -> A -> B (the
  // comparator's pans). The comparator's card says what a closure is; the logbook says how it has closed since the
  // kilogram went out. Pays the party a standing +1 on every ability check (abilities.js, checkBonus).
  { id: 'gt_cradle', kind: 'cycle', parts: ['obj.gt_weight_500', 'obj.gt_weight_200', 'obj.gt_weight_200b', 'obj.gt_weight_100'], states: ['0', 'A', 'B'],
    check: (st) => { const g = [500, 200, 200, 100], on = (pan) => st.reduce((n, s, i) => n + (s === pan ? g[i] : 0), 0); return !st.includes('0') && on('A') === on('B'); },
    stepText: 'You move it with the forceps. Its peg on the tally board now sits at {state}. The beam is not level, or not everything is on it.',
    stepTextEs: 'La mueves con las pinzas. Su clavija en el tablero ahora está en {state}. La balanza no está nivelada, o no está todo arriba.',
    solvedText: 'Every peg is on the board and the beam is level. You leave it alone.',
    solvedTextEs: 'Todas las clavijas están en el tablero y la balanza está nivelada. No la tocas.',
    reward: {
      text: 'Its peg goes on the board, and the beam comes level and stays there. For once something in this building agrees with itself. You stand and watch it not move for a while. It is steadying. (+1 to every ability check, from now on)',
      textEs: 'Su clavija queda en el tablero, y la balanza se nivela y ahí se queda. Por una vez algo en este edificio está de acuerdo consigo mismo. Te quedas un rato mirando cómo no se mueve. Tranquiliza. (+1 a todas las pruebas de habilidad, desde ahora)' } },

  // ---- The refuge: tree rings (order). Push the pegs in the order the flagged years happened. The widths, the
  // tower's own slice and the fifth round's pencil note give the order; the fifth round's flag is the lie, and it
  // has no peg, so it is no part.
  { id: 'rf_rings', kind: 'order', parts: ['obj.rf_ring_phones', 'obj.rf_ring_clocks', 'obj.rf_ring_silence', 'obj.rf_ring_vote'],
    answer: ['obj.rf_ring_clocks', 'obj.rf_ring_vote', 'obj.rf_ring_phones', 'obj.rf_ring_silence'],
    stepText: 'You push the peg. It goes in and stays. ({n} of {total})',
    stepTextEs: 'Empujas la clavija. Entra y se queda. ({n} de {total})',
    wrongText: 'You push the peg. It slides back out, and so do the others. Wood keeps the order it grew in.',
    wrongTextEs: 'Empujas la clavija. Vuelve a salir, y las otras también. La madera guarda el orden en que creció.',
    solvedText: 'All four pegs are in. The tree has said what it knows.',
    solvedTextEs: 'Las cuatro clavijas están adentro. El árbol ya dijo lo que sabe.',
    reward: { item: 'item.analog_axe',
      text: 'The last peg goes in. Under the tower\'s first landing a wooden bar drops out of its slot, and a locker door swings open on leather hinges. Inside hangs an axe, oiled, with a paper flag of its own: "for whoever can tell the years apart." (Analogist felling axe)',
      textEs: 'Entra la última clavija. Debajo del primer descanso de la torre, una tranca de madera cae de su ranura, y la puerta de un armario se abre sobre bisagras de cuero. Adentro cuelga un hacha, aceitada, con su propia banderita de papel: "para quien sepa distinguir los años." (Hacha de tala analogista)' } },

  // ---- Greenbelt: the clean room's one set of footprints (timed). The prints only show when the dish's work
  // light crosses the skylight; they end at one of twelve drawers. The repeater lamp's pencilled timing is the clue.
  { id: 'gb_footprints', kind: 'timed', parts: ['obj.gb_passdrawers'], window: cycleWindow(75, 15, 60),
    closedText: 'You try a drawer. Bolted from the clean side. So is the next. Through the window the floor in there is only dust, in this light: you can\'t see where the prints end.',
    closedTextEs: 'Pruebas un cajón. Trabado desde el lado limpio. El siguiente también. Por la ventana, con esta luz, el piso de adentro es solo polvo: no se ve dónde terminan las huellas.',
    solvedText: 'Eleven bolted drawers and one empty one. The prints haven\'t moved.',
    solvedTextEs: 'Once cajones trabados y uno vacío. Las huellas no se movieron.',
    reward: { item: 'item.gb_tape',
      text: 'The dish\'s light swings across the skylight, and for a few seconds the dust in there has edges. The prints cross the room and stop at the wall, at the fourth drawer from the left. That one isn\'t bolted. Inside is a can of telemetry tape on a carrying strap, labeled in pencil. Somebody walked in to leave it where only that light would find it. (Clean-room tape)',
      textEs: 'La luz de la antena cruza la claraboya, y por unos segundos el polvo de adentro tiene bordes. Las huellas cruzan la sala y se detienen en la pared, en el cuarto cajón desde la izquierda. Ese no está trabado. Adentro hay una lata de cinta de telemetría con una correa, rotulada en lápiz. Alguien entró para dejarla donde solo esa luz la encontrara. (Cinta de la sala limpia)' } },

  // ---- The Meade: the cafeteria menu (cycle, as code entry). Three suggestion boxes, one thumbwheel each. The
  // menu gives each dish its marking; the napkin on the analysts' table gives each marking a number.
  { id: 'md_menu', kind: 'cycle', parts: ['obj.md_box_meatloaf', 'obj.md_box_mystery', 'obj.md_box_soup'], states: ['0', '1', '2', '3', '4', '5'],
    answer: ['4', '2', '5'],
    stepText: 'You turn the thumbwheel. It clicks to {state}. Nothing else happens, officially.',
    stepTextEs: 'Giras la ruedita. Hace clic en {state}. No pasa nada más, oficialmente.',
    solvedText: 'The wheels won\'t turn now. Suggestion received.',
    solvedTextEs: 'Las rueditas ya no giran. Sugerencia recibida.',
    reward: { item: 'item.intercept_codes',
      text: 'The wheel clicks, and the bottom of the middle box drops open like a mail slot. A flip pad slides out: column after column of five-letter groups, and LUNCH ORDERS on the cover. The menu is the only thing here the analysts are allowed to find funny, so they put it to work. (Intercept codes)',
      textEs: 'La ruedita hace clic, y el fondo del buzón del medio se abre como una ranura de correo. Sale deslizándose una libreta: columna tras columna de grupos de cinco letras, y PEDIDOS DE ALMUERZO en la tapa. El menú es lo único acá que a los analistas se les permite encontrar gracioso, así que lo pusieron a trabajar. (Códigos de intercepción)' } },

  // ---- The Corridor: the sealed hall (cycle). A valve wheel at the end of each row of racks, three stops each:
  // I to the racks, II on to the next row, III to the return. Only the bottom row has a return (the loop plan).
  { id: 'cor_meters', kind: 'cycle', parts: ['obj.cor_valve_top', 'obj.cor_valve_mid', 'obj.cor_valve_low'], states: ['I', 'II', 'III'],
    answer: ['II', 'II', 'III'],
    stepText: 'You lean on the wheel until it gives. The pointer stops at {state}. The racks are still running.',
    stepTextEs: 'Te apoyas en el volante hasta que cede. El indicador se detiene en {state}. Los racks siguen andando.',
    solvedText: 'The wheels are where they need to be. The hall is quiet. It sounds wrong in here without the fans.',
    solvedTextEs: 'Los volantes están donde tienen que estar. La nave está en silencio. Suena raro acá adentro sin los ventiladores.',
    reward: { item: 'item.baron_keycard',
      text: 'The pointer stops. The water that was going to the racks goes back to the river instead, and row by row the fans wind down. In the quiet a drawer under the meters unlatches: power was holding it shut, and now there is none. Inside is a black keycard with a house crest on it and no name. (Compute Baron keycard)',
      textEs: 'El indicador se detiene. El agua que iba a los racks ahora vuelve al río, y fila por fila los ventiladores se van apagando. En el silencio se destraba un cajón debajo de los medidores: lo mantenía cerrado la corriente, y ya no hay. Adentro hay una tarjeta negra con el escudo de una casa y ningún nombre. (Tarjeta de un Barón del Cómputo)' } },

  // ---- The Enclave archive: the parchment (cycle, as matching). Each lectern's dial sets the stamp on its
  // underlined quote: - (none yet), A, B or C. The tray by the case says which original each stamp vouches for.
  // The quest that leads here waits for `q.en_archive.told` (sideQuests.js, `after:`), so the two read as one thread.
  { id: 'en_parchment', kind: 'cycle', parts: ['obj.en_quote_wait', 'obj.en_quote_equal', 'obj.en_quote_union'], states: ['-', 'A', 'B', 'C'],
    answer: ['C', 'A', 'B'],
    stepText: 'You turn the dial under the quote. It now shows {state}. The functionary does not look up, which is not the same as not noticing.',
    stepTextEs: 'Giras el dial debajo de la cita. Ahora marca {state}. La funcionaria no levanta la vista, que no es lo mismo que no darse cuenta.',
    solvedText: 'Three quotes, three stamps. The dials have locked.',
    solvedTextEs: 'Tres citas, tres sellos. Los diales quedaron trabados.',
    reward: { item: 'item.provenance_seal',
      text: 'The dial settles. Each quote now sits under the stamp of the document it was taken from, and all three read a little worse for it. The functionary comes over, looks for a long time, and does not correct them. She takes a seal off her own lanyard and presses it into your hand. "For the record, I was at lunch." (Provenance seal)',
      textEs: 'El dial se asienta. Ahora cada cita está bajo el sello del documento del que la sacaron, y las tres se leen un poco peor por eso. La funcionaria se acerca, mira un rato largo, y no las corrige. Se saca un sello de su propio cordón y te lo pone en la mano. "Que conste: yo estaba almorzando." (Sello de procedencia)' } },
].map(definePuzzle);

/** The puzzle a map object belongs to, if any. */
export const puzzleFor = (objId) => PUZZLES.find((p) => p.parts.includes(objId));
