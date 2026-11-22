// Spanish for the Act 2 areas from the polish pass (hub #30, gonman): Route 1 north, Greenbelt, Beltsville, the
// refuge, the Meade and Annapolis (src/content/maps/act2_regions.js; Baltimore has its own pass), every sub-area in
// src/content/maps/act2_more.js, and the co-op counter's shop (SHOPS.coop in src/content/items.js). Keyed by the
// exact English, like the other tables; tests/run.js checks coverage. Neutral Latin American Spanish, tú for the
// player; troopers and officials use usted. Signs use tú. The uppercase labels are the speaker line over a side-quest pitch or a later
// line (WorldScene prints label.toUpperCase()).
export const ES_ACT2 = {
  // route1_north: the old road out of the cordon
  'North to Baltimore': 'Al norte, a Baltimore',
  'The road north, toward the harbor.': 'El camino al norte, hacia el puerto.',
  'West to Greenbelt': 'Al oeste, a Greenbelt',
  'The curved streets of Greenbelt, and the dishes on the hill.': 'Las calles curvas de Greenbelt, y las antenas en la colina.',
  'East into the refuge': 'Al este, hacia el refugio',
  'Forest. No signal past this sign.': 'Bosque. Pasando este cartel, no hay señal.',
  'The farm road': 'El camino de las granjas',
  'White fences, long low barns.': 'Cercas blancas, graneros largos y bajos.',
  'The Meade perimeter': 'El perímetro del Meade',
  'Berms, black glass, antenna farms.': 'Terraplenes, vidrio negro, campos de antenas.',
  'South-east to Annapolis': 'Al sureste, a Annapolis',
  'Toward the bay.': 'Hacia la bahía.',
  'South, back to College Park': 'Al sur, de vuelta a College Park',
  'Back through the old checkpoint.': 'De vuelta por el viejo puesto de control.',
  'South-west to the Beltway': 'Al suroeste, a la Beltway',
  'The ring road around the Enclave.': 'La autopista de circunvalación alrededor del Enclave.',
  'A barricade, and a sign: INNER LOOP CLOSED. Not yet.': 'Una barricada y un cartel: ANILLO INTERIOR CERRADO. Todavía no.',
  'Road sign': 'Cartel de ruta',
  'A highway sign on a post, the reflective letters peeled down to the glue: GREENBELT 2 · BELTSVILLE 4 · BALTIMORE 27. Somebody has crossed out the miles in marker and written walking hours beside them. Beside BALTIMORE there is no time, only DON\'T.':
    'Un cartel de ruta en un poste, con las letras reflectantes peladas hasta el pegamento: GREENBELT 2 · BELTSVILLE 4 · BALTIMORE 27. Alguien tachó las millas con marcador y escribió al lado las horas a pie. Junto a BALTIMORE no hay horas, solo NO VAYAS.',
  'Continuity notice': 'Aviso de Continuity',
  'A Continuity notice on two legs, planted in front of the old mileage sign: RESTRICTED AREA AHEAD. NO STOPPING. Only the bottom line of the old sign shows past it, ANNAPOLIS 21, and beside it somebody has scratched a 4 into the paint with a key.':
    'Un aviso de Continuity sobre dos patas, plantado delante del viejo cartel de distancias: ZONA RESTRINGIDA ADELANTE. PROHIBIDO DETENERSE. Detrás solo asoma la última línea del cartel viejo, ANNAPOLIS 21, y al lado alguien rayó un 4 en la pintura con una llave.',
  'A bus shelter with no glass left in it. The timetable is still bolted to the post, and the last northbound bus on it is for a night in 2071. Under the bench, a cardboard box marked WALKERS, and under that, smaller: TAKE WHAT YOU NEED.':
    'Una parada de autobús sin un solo vidrio. El horario sigue atornillado al poste, y el último autobús al norte que figura es de una noche de 2071. Debajo del banco, una caja de cartón que dice CAMINANTES, y debajo, más chico: TOMA LO QUE NECESITES.',
  'A walker on the shoulder': 'Un caminante al costado del camino', 'A WALKER ON THE SHOULDER': 'UN CAMINANTE AL COSTADO DEL CAMINO',
  '"Two pairs of socks." He sits on the guardrail with one boot off, working at his heel. "Nobody tells you that about leaving. Two pairs, and you swap the inside pair at Greenbelt."':
    '"Dos pares de medias." Está sentado en el guardarraíl sin una de las botas, frotándose el talón. "Nadie te dice eso cuando te vas. Dos pares, y el de adentro lo cambias en Greenbelt."',

  // greenbelt: curved streets and co-op shopfronts
  'The tool library': 'La biblioteca de herramientas',
  'TOOL LIBRARY on the glass, and under it the rules: BORROW FOR A WEEK. SIGN THE CLIPBOARD. On the returns shelf inside the door, a pair of work gloves with a tag on one thumb: OVERDUE SINCE 2088, FINE WAIVED BY VOTE. You sign the clipboard and take them.':
    'BIBLIOTECA DE HERRAMIENTAS en el vidrio, y debajo las reglas: PRÉSTAMO POR UNA SEMANA. FIRMA LA PLANILLA. En el estante de devoluciones, junto a la puerta, un par de guantes de trabajo con una etiqueta en un pulgar: VENCIDOS DESDE 2088, MULTA PERDONADA POR VOTACIÓN. Firmas la planilla y te los llevas.',
  'The returns shelf, empty. On the clipboard, the line for the gloves has a pencil tick beside it now.':
    'El estante de devoluciones, vacío. En la planilla, la línea de los guantes ahora tiene una marca a lápiz al lado.',
  'The barbershop': 'La barbería',
  'HAIRCUTS in gold leaf on the window. Under it the price has been painted over so many times that the glass is thick with paint. The newest price is in chalk, which wipes off faster.':
    'CORTES DE PELO en letras doradas sobre la vidriera. Debajo, el precio se pintó encima tantas veces que el vidrio quedó grueso de pintura. El precio más nuevo está en tiza, que se borra más rápido.',
  'The town weekly': 'El semanario del pueblo',
  'The town weekly, one page taped inside the window every Friday, the way it has been since the 1930s. This week\'s front page is the committee\'s minutes in full. The headline is the vote count.':
    'El semanario del pueblo, una página pegada con cinta del lado de adentro de la vidriera cada viernes, como desde la década de 1930. La portada de esta semana es el acta completa del comité. El titular es el conteo de votos.',
  'The pharmacy': 'La farmacia',
  'A pharmacy with its shutter down, and a note taped to the shutter in neat capitals: CLOSED UNTIL THE COMMITTEE DECIDES WHO HOLDS THE KEY. It is dated 2093. Under it, somebody keeps a tally of the meetings since.':
    'Una farmacia con la persiana baja y una nota pegada en la persiana, en mayúsculas prolijas: CERRADO HASTA QUE EL COMITÉ DECIDA QUIÉN GUARDA LA LLAVE. Tiene fecha de 2093. Debajo, alguien lleva la cuenta de las reuniones desde entonces.',
  'Committee member': 'Integrante del comité', 'COMMITTEE MEMBER': 'INTEGRANTE DEL COMITÉ',
  '"Motion to hear the strangers out." She raises her own hand and counts it. "Carried, one to nothing. It won\'t be official till the counter\'s fixed. Go on anyway."':
    '"Moción para escuchar a los forasteros." Levanta su propia mano y la cuenta. "Aprobada, uno a cero. No va a ser oficial hasta que arreglen el contador. Adelante, igual."',
  'The dishes, on the hill': 'Las antenas, en la colina',
  'White dishes on the hill above the town, each the size of a house, pointed at a sky nobody is paid to watch. Through the coin viewer at the top of the street, one of them is turning, slow as a minute hand, while the windsock beside it hangs straight down.':
    'Antenas blancas en la colina sobre el pueblo, cada una del tamaño de una casa, apuntando a un cielo que nadie cobra por mirar. Por el visor de monedas al final de la calle se ve que una de ellas gira, lenta como un minutero, mientras la manga de viento a su lado cuelga derecha.',
  'Back east to Route 1': 'De vuelta al este, a la Ruta 1',
  'Back to Route 1.': 'De vuelta a la Ruta 1.',
  'Up the hill to the dishes': 'Colina arriba, a las antenas',
  'The dish control room. The door is propped open with a tape reel.': 'La sala de control de las antenas. La puerta está trabada abierta con un carrete de cinta.',
  'Down the path to the co-op': 'Por el sendero, a la cooperativa',
  'The co-op. OPEN, by a vote of 4 to 3.': 'La cooperativa. ABIERTO, por una votación de 4 a 3.',
  'Up to the town center': 'Subiendo al centro del pueblo',
  'The curved streets climb toward the theater.': 'Las calles curvas suben hacia el teatro.',

  // gb_dishes: the dish control room
  'Telemetry tapes': 'Cintas de telemetría',
  'Grey cans of telemetry tape on steel shelves up to the ceiling, every can labeled by hand. A strip of masking tape along the shelf edge says BEFORE 2030. It has dried out and curled up at both ends.':
    'Latas grises de cinta de telemetría en estantes de acero hasta el techo, cada lata rotulada a mano. Una tira de cinta de papel en el borde del estante dice ANTES DE 2030. Se secó y se le levantaron las dos puntas.',
  'A technician': 'Un técnico', 'A TECHNICIAN': 'UN TÉCNICO',
  '"Relief\'s late." He checks the clock over the consoles against his wristwatch, then writes the time in the log. "Years late. I write it up every shift. Somebody up the line reads them."':
    '"El relevo viene tarde." Compara el reloj de arriba de las consolas con su reloj de pulsera y anota la hora en el registro. "Años tarde. Lo dejo asentado cada turno. Alguien más arriba lo lee."',
  'Shift log': 'Registro de turnos',
  'The station\'s shift log, a ledger chained to a stand: date, dish, where it points, what came in, initials. For years now, every line has the same initials.':
    'El registro de turnos de la estación, un libro encadenado a un atril: fecha, antena, hacia dónde apunta, qué entró, iniciales. Hace años que cada línea tiene las mismas iniciales.',
  'An old page near the front. Five sets of initials to a shift, and a running argument in the margin about who keeps finishing the coffee.':
    'Una página vieja, cerca del principio. Cinco juegos de iniciales por turno, y una discusión en el margen sobre quién se termina siempre el café.',
  'Further in, the page where the five sets of initials drop to one, with no reason given. At the foot of it, in the same hand: Relief did not arrive. Continued watch.':
    'Más adelante, la página donde los cinco juegos de iniciales pasan a ser uno, sin ninguna explicación. Al pie, con la misma letra: El relevo no llegó. Sigo de guardia.',
  'Tonight. Dish 3: turning, not commanded. Signal: yes. Under SOURCE he has written a question mark and gone over it until the pencil went through the page.':
    'Esta noche. Antena 3: girando, sin orden. Señal: sí. Bajo FUENTE escribió un signo de pregunta y lo repasó hasta que el lápiz atravesó la hoja.',
  'Clean room window': 'Ventana de la sala limpia',
  'A window of wired glass into the clean room. The floor hasn\'t been swept in years, and there is one set of footprints in the dust.':
    'Una ventana de vidrio armado hacia la sala limpia. Hace años que no barren el piso, y en el polvo hay un solo par de huellas.',
  'Back down the hill': 'De vuelta colina abajo',
  'Back outside.': 'De vuelta afuera.',

  // gb_coop: the Greenbelt co-op, and its shop
  'Minute books': 'Libros de actas',
  'The co-op\'s minute books, a century of them, one bound volume a year along the whole back wall. The 2071 volume is twice as thick as its neighbors, and 2072 is a single page.':
    'Los libros de actas de la cooperativa, un siglo entero, un tomo encuadernado por año a lo largo de toda la pared del fondo. El tomo de 2071 es el doble de grueso que sus vecinos, y el de 2072 es una sola página.',
  'The co-op counter': 'El mostrador de la cooperativa',
  'Sample tray': 'Bandeja de muestras',
  'A card table by the register with a hand-lettered card: FREE SAMPLE, ONE PER VISIT. Under it, smaller: CARRIED 4-3. One bag of Old Bay crab chips is left. You take it.':
    'Una mesa plegable junto a la caja, con un cartel escrito a mano: MUESTRA GRATIS, UNA POR VISITA. Debajo, más chico: APROBADO 4-3. Queda una bolsa de papitas de cangrejo Old Bay. Te la llevas.',
  'The card table, bare. A second card has gone up beside the first: SAMPLES SUSPENDED PENDING REVIEW.':
    'La mesa plegable, vacía. Al lado del primer cartel apareció otro: MUESTRAS SUSPENDIDAS HASTA NUEVA REVISIÓN.',
  'A clerk': 'Una empleada', 'A CLERK': 'UNA EMPLEADA',
  '"Eggs are thirty cents." She taps the price card, typed and gone yellow at the edges. "Same as the day they voted on it, in 2071. There\'s been no motion since, so they\'re thirty cents."':
    '"Los huevos están a treinta centavos." Da unos golpecitos en la tarjeta de precios, escrita a máquina y amarillenta en los bordes. "Igual que el día que lo votaron, en 2071. Desde entonces no hubo ninguna moción, así que treinta centavos."',
  'Back out to the street': 'De vuelta a la calle',
  'GREENBELT CO-OP': 'COOPERATIVA DE GREENBELT',
  'Prices set by vote in 2071. The next vote is pending.': 'Precios votados en 2071. La próxima votación está pendiente.',

  // beltsville: the farms
  'Steel shelves of parts bins in the equipment shed, labeled in marker: PUMP SEALS, FEED LINE. Further down the labels give up, and so did the sorting.':
    'Estantes de acero llenos de cajoneras en el galpón de equipos, rotuladas con marcador: SELLOS DE BOMBA, LÍNEA DE ALIMENTO. Más abajo los rótulos se rinden, y el orden también.',
  'Paper sacks stacked against the office wall, stenciled TANK FEED · NOT FOR LIVESTOCK. On every sack, somebody has struck out LIVESTOCK with one careful line of marker.':
    'Bolsas de papel apiladas contra la pared de la oficina, estarcidas con ALIMENTO PARA TANQUES · NO APTO PARA GANADO. En cada bolsa, alguien tachó GANADO con una línea prolija de marcador.',
  'A veterinarian': 'Una veterinaria', 'A VETERINARIAN': 'UNA VETERINARIA',
  '"I took this job for good reasons." She pulls her gloves on, then off again. "I wrote them down the day I signed. I keep meaning to find the list."':
    '"Acepté este trabajo por buenas razones." Se pone los guantes y se los vuelve a sacar. "Las anoté el día que firmé. Siempre me digo que voy a buscar la lista."',
  'Breeding ledgers': 'Registros de cría',
  'Breeding ledgers on the shelf in the vet\'s office, one cloth-bound volume a year, the years in white ink on the spines. Inside, every line is a date and a fence post number.':
    'Registros de cría en el estante de la oficina de la veterinaria, un tomo encuadernado en tela por año, con los años en tinta blanca en los lomos. Adentro, cada línea es una fecha y un número de poste de la cerca.',
  'The sealed barn': 'El granero sellado',
  'A notice on two legs: BIOSECURE. NO ENTRY WITHOUT ESCORT. Past it, down the track in the rain, a barn with no windows and an airlock where the door should be. Under the rain on its roof, a pump runs in and out, slow, like breathing.':
    'Un aviso sobre dos patas: BIOSEGURIDAD. PROHIBIDO EL PASO SIN ESCOLTA. Más allá, camino abajo bajo la lluvia, un granero sin ventanas y con una esclusa donde debería estar la puerta. Bajo la lluvia sobre el techo, una bomba aspira y expulsa, lenta, como una respiración.',
  'Back to Route 1': 'De vuelta a la Ruta 1',
  'A barn the map doesn\'t show': 'Un granero que el mapa no muestra',
  'A barn that isn\'t on any map. It has an airlock.': 'Un granero que no figura en ningún mapa. Tiene una esclusa.',
  'Long, low, airlocked.': 'Largo, bajo, con esclusa.',

  // bv_barn: the barn the map doesn't show
  'A growth tank': 'Un tanque de crecimiento',
  'One growth tank stands apart from the rows, its glass fogged from the inside. Across the front, black marker strokes that were a name once, faded too far to read.':
    'Un tanque de crecimiento apartado de las filas, con el vidrio empañado por dentro. En el frente, trazos de marcador negro que alguna vez fueron un nombre, tan borrados que ya no se leen.',
  'Boot rack': 'Estante de botas',
  'A boot rack inside the airlock, steel-toe boots hosed off and drying upside down on pegs, a name on tape for every pair. One pair says SPARE on the tape instead. They fit well enough.':
    'Un estante de botas del lado de adentro de la esclusa: botas con puntera de acero lavadas con manguera, secándose boca abajo en clavijas, con un nombre en cinta para cada par. Un par dice REPUESTO en la cinta. Te quedan bastante bien.',
  'The rack, and two empty pegs with SPARE on the tape.': 'El estante, y dos clavijas vacías con REPUESTO en la cinta.',
  'Back out into the rain': 'De vuelta afuera, a la lluvia',

  // refuge: no signal, timber and lamps
  'A schoolteacher with a slate': 'Una maestra con una pizarra', 'A SCHOOLTEACHER WITH A SLATE': 'UNA MAESTRA CON UNA PIZARRA',
  '"Your phones go quiet past the fence." She wipes her slate clean with the heel of her hand. "The children think that\'s funny. Try not to check yours in front of them."':
    '"Pasando la cerca, los teléfonos se quedan callados." Borra la pizarra con la base de la mano. "A los chicos les da risa. Traten de no mirar los suyos delante de ellos."',
  'A box by the ranger station door': 'Una caja junto a la puerta de la estación de guardabosques',
  'A box inside the old ranger station door with WALKING STICKS painted on it, full of staves cut from the woods. Among them is a bat of ash wood, sanded smooth at the grip, with a cedar tag on twine: FOR THE ROAD BACK. You take it.':
    'Una caja del lado de adentro de la puerta de la vieja estación de guardabosques, con BASTONES pintado encima, llena de varas cortadas en el bosque. Entre ellas hay un bate de fresno, lijado liso en el mango, con una etiqueta de cedro atada con hilo: PARA EL CAMINO DE VUELTA. Te lo llevas.',
  'The box of walking sticks. The cedar tag hangs from one of the staves now.': 'La caja de bastones. La etiqueta de cedro ahora cuelga de una de las varas.',
  'The fire tower': 'La torre de incendios',
  'A fire tower on four timber legs, its cab up in the treetops. Nailed to the rail of the bottom flight is a slice of an old oak, its rings labeled in ink on little paper flags.':
    'Una torre de incendios sobre cuatro patas de madera, con la cabina allá arriba entre las copas. Clavada en la baranda del primer tramo hay una rodaja de un roble viejo, con los anillos rotulados en tinta en banderitas de papel.',
  'Oak round: "the phones"': 'Rodaja de roble: "los teléfonos"',
  'A slice of the old oak on a post, one ring flagged in ink: "the year the phones rang." A thin ring, with the wide pale years all inside it. A wooden peg sticks out under the flag.':
    'Una rodaja del roble viejo sobre un poste, con un anillo marcado en tinta: "el año que sonaron los teléfonos." Un anillo fino, con todos los años anchos y pálidos por dentro. Debajo de la banderita asoma una clavija de madera.',
  'Oak round: "the clocks"': 'Rodaja de roble: "los relojes"',
  'A slice of the old oak on a post, one ring flagged in ink: "the year the clocks went back." The ring is narrow and dark. A wooden peg sticks out under the flag.':
    'Una rodaja del roble viejo sobre un poste, con un anillo marcado en tinta: "el año que los relojes volvieron atrás." El anillo es angosto y oscuro. Debajo de la banderita asoma una clavija de madera.',
  'Oak round with a newer flag': 'Rodaja de roble con una banderita más nueva',
  'A fifth slice, and the only flag in ballpoint: "the year everything got better." It is pinned to the bark, where there is no ring. Under it, small, in pencil: "after the clocks, before the vote, if at all." This one has no peg.':
    'Una quinta rodaja, y la única banderita en bolígrafo: "el año que todo mejoró." Está clavada en la corteza, donde no hay anillo. Debajo, chiquito, en lápiz: "después de los relojes, antes de la votación, si es que pasó." Esta no tiene clavija.',
  'Oak round: "the answering"': 'Rodaja de roble: "contestar"',
  'A slice of the old oak on a post, one ring flagged in ink: "the year we stopped answering." It is the thickest ring on the slice. A wooden peg sticks out under the flag.':
    'Una rodaja del roble viejo sobre un poste, con un anillo marcado en tinta: "el año que dejamos de contestar." Es el anillo más grueso de la rodaja. Debajo de la banderita asoma una clavija de madera.',
  'Oak round: "the vote"': 'Rodaja de roble: "la votación"',
  'A slice of the old oak on a post, one ring flagged in ink: "the year they paused the voting." A wide, pale ring, as if the tree hadn\'t noticed. A wooden peg sticks out under the flag.':
    'Una rodaja del roble viejo sobre un poste, con un anillo marcado en tinta: "el año que pausaron las votaciones." Un anillo ancho y pálido, como si el árbol no se hubiera enterado. Debajo de la banderita asoma una clavija de madera.',
  'Up the boardwalk to the settlement': 'Por la pasarela, al asentamiento',
  'Timber walls, lamps in the windows.': 'Paredes de troncos, lámparas en las ventanas.',
  'Deeper into the forest': 'Más adentro del bosque',
  'A day\'s walk in, they say. It\'s less.': 'A un día de camino, dicen. Es menos.',
  'Down to the marsh boardwalk': 'Bajando a la pasarela del pantano',
  'Boardwalks over black water.': 'Pasarelas sobre agua negra.',

  // rf_settlement: the Analogist settlement
  'The blacksmith': 'El herrero', 'THE BLACKSMITH': 'EL HERRERO',
  '"Does it need charging?" He doesn\'t look up from the hinge on the anvil. "Then I can\'t fix it. Anything else, I can make outlast you."':
    '"¿Necesita carga?" No levanta la vista de la bisagra sobre el yunque. "Entonces no lo puedo arreglar. Cualquier otra cosa te la hago para que dure más que tú."',
  '"Page two hundred, she says." He holds up a horseshoe no bigger than a coin. "It goes on the shelf beside her horse book. She thinks I haven\'t read it."':
    '"Página doscientos, dice ella." Levanta una herradura no más grande que una moneda. "Va en el estante, al lado de su libro del caballo. Cree que no lo leí."',
  'The library': 'La biblioteca',
  'Shelves of books copied out by hand, with the copyist\'s name on every flyleaf. Where a copyist slipped, the mistake stays in, and someone else has footnoted it.':
    'Estantes de libros copiados a mano, con el nombre del copista en cada guarda. Donde un copista se equivocó, el error se queda, y alguien más le puso una nota al pie.',
  'A hard man': 'Un hombre duro', 'A HARD MAN': 'UN HOMBRE DURO',
  '"They put mine in at a hospital." He rubs the back of his neck, where the port used to be. "That\'s where it starts, every time. Ask anybody here who had one."':
    '"El mío me lo pusieron en un hospital." Se frota la nuca, donde antes estaba el puerto. "Ahí es donde empieza, siempre. Pregúntale a cualquiera de acá que haya tenido uno."',
  'A graveyard of implants': 'Un cementerio de implantes',
  'A plot of turned earth inside the fence, laid out like a churchyard in miniature: rows of wooden markers a hand high, each carved with initials and a date. Bits of lace hardware glint in the dirt between them, smashed flat.':
    'Un terreno de tierra removida dentro de la cerca, dispuesto como un cementerio en miniatura: filas de marcadores de madera de un palmo de alto, cada uno tallado con iniciales y una fecha. Entre ellos brillan en la tierra pedazos de hardware de lace, aplastados.',
  'Back down the boardwalk': 'De vuelta por la pasarela',

  // meade: the perimeter
  'Cafeteria menu (posted outside)': 'Menú de la cafetería (colgado afuera)',
  'The cafeteria menu, on a sandwich board at the edge of the berm road, typed fresh every morning. MONDAY: Meatloaf (Redacted). TUESDAY: Mystery Meat (Classified).':
    'El menú de la cafetería, en un cartel de caballete al borde del camino del terraplén, escrito a máquina cada mañana. LUNES: Pastel de carne (Censurado). MARTES: Carne Misteriosa (Clasificada).',
  'A quartermaster': 'Un intendente', 'A QUARTERMASTER': 'UN INTENDENTE',
  '"Everything at the Meade has a form." He holds out a clipboard and pulls it back before you can take it. "I\'m the form you fill out to skip the others. I cost more."':
    '"En el Meade todo tiene un formulario." Te tiende un portapapeles y lo retira antes de que puedas agarrarlo. "Yo soy el formulario que se llena para saltarse los demás. Salgo más caro."',
  'A badge on a lanyard': 'Una credencial con cordón',
  'A contractor badge face down in the gutter under the fence, its lanyard trodden flat. You turn it over: a photo of somebody you have never met, and a clearance stripe in steel grey. Somebody has clipped one corner off to void it.':
    'Una credencial de contratista boca abajo en la cuneta, al pie de la cerca, con el cordón aplastado a pisotones. Le das la vuelta: la foto de alguien que nunca viste y una franja de autorización gris acero. Alguien le cortó una esquina para anularla.',
  'The print of a lanyard in the grit, where the badge lay.': 'La marca de un cordón en la arenilla, donde estaba la credencial.',
  'Back west to Route 1': 'De vuelta al oeste, a la Ruta 1',
  'The Meade gate': 'El portón del Meade',
  'Black glass behind the berm. The gate is open.': 'Vidrio negro detrás del terraplén. El portón está abierto.',
  'The gate does not acknowledge you. Not yet.': 'El portón no te reconoce. Todavía no.',
  'The parking lot': 'El estacionamiento',
  'Ten thousand spaces.': 'Diez mil lugares.',

  // bmore_stacks: the container stacks (Baltimore)
  'A union steward': 'Una delegada sindical', 'A UNION STEWARD': 'UNA DELEGADA SINDICAL',
  '"Shells got their union cards the year of the strike." She checks a hiring slip against the containers, row by row. "Four years to win a vote on whether they could vote. Mind the third tier, it sways."':
    '"Los cuerpos sacaron su carnet del sindicato el año de la huelga." Revisa una planilla de contratación contra los contenedores, fila por fila. "Cuatro años para ganar una votación sobre si podían votar. Cuidado con el tercer piso, se bambolea."',
  'Shipping manifests': 'Manifiestos de carga',
  'A crate on its own at the end of the row, SOVEREIGN STACK stenciled on two sides and the union\'s chalk X on the lid, the one that means hands off. The manifest is in a plastic sleeve stapled to the slats.':
    'Un cajón solo al final de la fila, con SOVEREIGN STACK estarcido en dos lados y la X de tiza del sindicato en la tapa, la que significa que no se toca. El manifiesto está en una funda de plástico engrapada a las tablas.',
  'Union tool crib': 'Depósito de herramientas del sindicato',
  'A container with its doors chained open, UNION TOOL CRIB stenciled across them, and a sign-out sheet on a nail. The rule at the top of the sheet: TAKE IT, SIGN IT, BRING IT BACK. Most of the lines say BACK.':
    'Un contenedor con las puertas abiertas y encadenadas, DEPÓSITO DE HERRAMIENTAS DEL SINDICATO estarcido de lado a lado, y una planilla de retiros colgada de un clavo. La regla arriba de la planilla: LLÉVALA, FÍRMALA, DEVUÉLVELA. Casi todas las líneas dicen DEVUELTA.',
  'Back to the harbor street': 'De vuelta a la calle del puerto',

  // bmore_clinic: the rowhouse clinic (Baltimore)
  'The doctor': 'La doctora', 'THE DOCTOR': 'LA DOCTORA',
  '"Sit." She doesn\'t look up from the arm she\'s wrapping. "Everybody sits. I take you worst first, and from here you look fine. Go on, sit."':
    '"Siéntate." No levanta la vista del brazo que está vendando. "Todo el mundo se sienta. Atiendo primero a los peores, y desde acá te ves bien. Vamos, siéntate."',
  'Supply shelf': 'Estante de insumos',
  'A kitchen shelf turned supply shelf. Bandages boiled and rolled tight in mason jars, labeled in three different hands, and not one jar more than half full.':
    'Un estante de cocina convertido en estante de insumos. Vendas hervidas y bien enrolladas en frascos de vidrio, rotuladas con tres letras distintas, y ningún frasco pasa de la mitad.',
  'Cards by the door': 'Tarjetas junto a la puerta',
  'Index cards pinned up by the door, one from every patient who came back to say thank you. The oldest ones are typed. Lately they come in crayon.':
    'Fichas clavadas junto a la puerta, una por cada paciente que volvió a dar las gracias. Las más viejas están escritas a máquina. Últimamente llegan en crayón.',
  'BACK ON THE CRANES MONDAY. HANDS STOPPED SHAKING. PIER 4, NIGHTS.': 'DE VUELTA EN LAS GRÚAS EL LUNES. YA NO ME TIEMBLAN LAS MANOS. MUELLE 4, TURNO NOCHE.',
  'In pencil: She asked me what year it was. I said 1901, and she didn\'t laugh. Thank you for not laughing.':
    'A lápiz: Me preguntó en qué año estábamos. Le dije 1901, y no se rió. Gracias por no reírse.',
  'A crayon drawing of a woman with very long arms, reaching over a line of tiny people. Along the bottom: TO THE DOCTOR, FROM THE LINE.':
    'Un dibujo en crayón de una mujer con brazos larguísimos, estirándose sobre una fila de personitas. Abajo: PARA LA DOCTORA, DE LA FILA.',

  // annapolis: the tide in the streets
  'A crabber': 'Un cangrejero', 'A CRABBER': 'UN CANGREJERO',
  '"Pots go out at slack water." He coils a line round his elbow and back to his hand. "Slack water comes when it likes now. The almanac\'s no help, and my grandmother wrote half of it."':
    '"Las nasas se echan con la marea quieta." Enrolla un cabo alrededor del codo y de vuelta a la mano. "Ahora la marea quieta llega cuando se le antoja. El almanaque no sirve de nada, y la mitad la escribió mi abuela."',
  'The statehouse dome': 'La cúpula del capitolio',
  'A cast-iron marker on a post: THE STATEHOUSE, OLDEST IN CONTINUOUS LEGISLATIVE USE. Somebody has scratched a question mark after USE. Up the street, the wooden dome stands clear of the waterline. Down here, the high-water marks are pencilled on the post, each one dated.':
    'Una placa de hierro fundido en un poste: EL CAPITOLIO, EL MÁS ANTIGUO EN USO LEGISLATIVO CONTINUO. Alguien rayó un signo de pregunta al final. Calle arriba, la cúpula de madera queda por encima del agua. Acá abajo, las marcas de crecida están anotadas a lápiz en el poste, cada una con su fecha.',
  'Paper charts': 'Cartas de papel',
  'A chart seller\'s handcart at the head of the pier, paper charts rolled in its bins, the soundings corrected by hand in red. The printed charts from the 2060s still show islands that aren\'t there anymore. Those go for half price.':
    'El carrito de un vendedor de cartas náuticas al principio del muelle, con cartas de papel enrolladas en los cajones y las sondas corregidas a mano en rojo. Las cartas impresas de la década de 2060 todavía muestran islas que ya no están. Esas van a mitad de precio.',
  'A basket on the seawall': 'Una canasta en el malecón',
  'A bushel basket on the seawall under wet burlap, and a card held down with a stone: TOO SMALL TO SELL. TAKE ONE. One white perch left in it, still cold. You take it.':
    'Una canasta de mimbre en el malecón, bajo una arpillera mojada, y un cartel sujeto con una piedra: MUY CHICOS PARA VENDER. TOMA UNO. Queda una perca blanca, todavía fría. Te la llevas.',
  'The empty basket and the burlap. Somebody will fill it again at the next low tide, whenever that turns out to be.':
    'La canasta vacía y la arpillera. Alguien la va a volver a llenar en la próxima marea baja, cuando sea que llegue.',
  'North-west, back to Route 1': 'Al noroeste, de vuelta a la Ruta 1',
  'Down the pier to the harbor': 'Por el muelle, al puerto',
  'Sailboats moored to second-floor windows. The harbor.': 'Veleros amarrados a ventanas de segundo piso. El puerto.',
  'A wooden dome above the waterline.': 'Una cúpula de madera por encima del nivel del agua.',
  'Out to the cut bridge': 'Hacia el puente cortado',
  'The bridge east, one span taken out.': 'El puente al este, al que le quitaron un tramo.',
  'Its doors are open. They always are.': 'Sus puertas están abiertas. Siempre lo están.',

  // ann_harbor: the harbor
  'A harbor pilot': 'Una práctica del puerto', 'A HARBOR PILOT': 'UNA PRÁCTICA DEL PUERTO',
  '"Everybody who walks down this pier wants a boat." She keeps splicing the line in her lap. "Learn the water first. The almanac\'s by my hut, for all the good it does."':
    '"Todo el que baja por este muelle quiere un bote." Sigue empalmando el cabo que tiene en el regazo. "Primero aprende el agua. El almanaque está junto a mi caseta, para lo que sirve."',
  'She has started her own count, in chalk on the hut door: seven strokes, a gap, then one more, row under row. "Same as last night," she says, and chalks another row.':
    'Empezó a llevar su propia cuenta, con tiza en la puerta de la caseta: siete rayas, un hueco y una más, fila tras fila. "Igual que anoche", dice, y anota otra fila.',
  'Tide almanac': 'Almanaque de mareas',
  'The tide almanac on a lectern by the harbormaster\'s hut, a fat book with a cracked spine, its pages swollen with damp. Every printed time has other times written in beside it.':
    'El almanaque de mareas en un atril junto a la caseta del capitán de puerto, un libro gordo con el lomo rajado y las páginas hinchadas de humedad. Cada hora impresa tiene otras horas escritas al lado.',
  'A bell across the water': 'Una campana al otro lado del agua',
  'The last bollard at the end of the pier, worn smooth by rope. From somewhere east over the water comes a church bell. The charts put one island out that way, and no church on it.':
    'El último bolardo al final del muelle, gastado liso por los cabos. De algún lugar al este, sobre el agua, llega una campana de iglesia. Las cartas marcan una sola isla para ese lado, y ninguna iglesia en ella.',
  'The pier bell': 'La campana del muelle',
  'A brass fog bell on a timber post at the end of the pier, green where the spray gets it. The rope has been spliced so many times it is mostly splice.':
    'Una campana de niebla de bronce en un poste de madera al final del muelle, verde donde le pega la espuma. A la cuerda la empalmaron tantas veces que ya es casi toda empalme.',
  'Tide board': 'Regla de mareas',
  'A tide board nailed to a piling, the feet painted in white. Near the top is a red line lettered HIGHEST EVER, and under that, in four different hands: "per the almanac." The weed on the board starts a hand above the red line.':
    'Una regla de mareas clavada a un pilote, con los pies pintados en blanco. Cerca de arriba hay una línea roja con el rótulo LA MÁS ALTA QUE HUBO, y debajo, en cuatro letras distintas: "según el almanaque." Las algas de la regla empiezan un palmo por encima de la línea roja.',
  'Back up the pier': 'De vuelta por el muelle',

  // The townsfolk crowds.js stands on these maps. Their English still waits for that file's own polish (another
  // change edits it), so the Spanish keeps the [scaffold] mark too; replace both together.
  'A family with a handcart': 'Una familia con una carretilla',
  '[scaffold] "We heard Baltimore has work. We heard it from a man who heard it."': '[scaffold] "Oímos que en Baltimore hay trabajo. Lo oímos de un hombre que lo oyó."',
  'An off-duty trooper': 'Un soldado fuera de servicio',
  '[scaffold] "I\'m not on shift. If I were, I\'d stop you. I\'m not."': '[scaffold] "No estoy de turno. Si lo estuviera, lo detendría. No lo estoy."',
  'A minute-taker': 'Alguien que toma actas',
  '[scaffold] "I write down everything the committee says. I\'m on volume four hundred."': '[scaffold] "Anoto todo lo que dice el comité. Voy por el tomo cuatrocientos."',
  'The committee member who disagrees': 'El integrante del comité que no está de acuerdo',
  '[scaffold] "Whatever they told you, I voted against it."': '[scaffold] "Te hayan dicho lo que te hayan dicho, yo voté en contra."',
  'A kid with a kite': 'Un chico con una cometa',
  '[scaffold] "The dishes move when the wind doesn\'t. I checked."': '[scaffold] "Las antenas se mueven cuando el viento no. Me fijé."',
  'A tissue technician': 'Un técnico de tejidos',
  '[scaffold] "Tissue that doesn\'t take. We have a word for it. We don\'t say it."': '[scaffold] "Tejido que no prende. Tenemos una palabra para eso. No la decimos."',
  'A shell awaiting assignment': 'Un cuerpo a la espera de destino',
  '[scaffold] "I am awaiting assignment." By any test you can run, a person.': '[scaffold] "Estoy a la espera de destino." Según cualquier prueba que puedas hacer, una persona.',
  'A settler with an axe': 'Un colono con un hacha',
  '[scaffold] "No signal out here. You\'ll sleep better. First night, you won\'t."': '[scaffold] "Acá no hay señal. Vas a dormir mejor. La primera noche, no."',
  'A birder in a blind': 'Un observador de aves en un escondite',
  '[scaffold] "Shh. Forty years and I\'ve never seen a bird look at a phone."': '[scaffold] "Shh. Cuarenta años y nunca vi a un pájaro mirar un teléfono."',
  'An analyst on a smoke break': 'Un analista en su pausa para fumar',
  '[scaffold] "I haven\'t been home in four years. I keep my car running, just in case."': '[scaffold] "Hace cuatro años que no voy a mi casa. Dejo el auto en marcha, por las dudas."',
  'An officer': 'Un oficial',
  '[scaffold] "Move along. Not because you\'re in trouble. Because standing still is suspicious."': '[scaffold] "Circule. No porque esté en problemas. Porque quedarse quieto es sospechoso."',
  'A midshipman with no navy': 'Un guardiamarina sin armada',
  '[scaffold] "We still drill. Nobody tells us to stop. Nobody tells us anything."': '[scaffold] "Seguimos haciendo instrucción. Nadie nos dice que paremos. Nadie nos dice nada."',
  'A waterman': 'Un pescador de la bahía',
  '[scaffold] "Tide\'s wrong again. It\'s right about the crabs, though."': '[scaffold] "La marea se equivocó otra vez. Con los cangrejos acierta, eso sí."',
  'An Archivist': 'Un Archivista',
  '[scaffold] "We keep the tapes because they\'re clean. Not because we\'re allowed to."': '[scaffold] "Guardamos las cintas porque están limpias. No porque nos dejen."',
  'A co-op member': 'Un socio de la cooperativa',
  '[scaffold] "Members get a discount of zero percent. It\'s the principle."': '[scaffold] "Los socios tienen un descuento del cero por ciento. Es por principio."',
  'A night handler': 'Un cuidador del turno noche',
  '[scaffold] "Don\'t tap the tanks. They tap back."': '[scaffold] "No golpees los tanques. Te devuelven el golpe."',
  'The lamplighter': 'El farolero',
  '[scaffold] "Every lamp, every night. It takes three hours. It\'s my favorite three hours."': '[scaffold] "Cada lámpara, cada noche. Me lleva tres horas. Son mis tres horas favoritas."',
  'A copyist': 'Una copista',
  '[scaffold] "I\'m on page two hundred. The horse is on page forty. Don\'t tell my father."': '[scaffold] "Voy por la página doscientos. El caballo está en la cuarenta. No le digas a mi papá."',
  'A container tenant': 'Un inquilino de los contenedores',
  '[scaffold] "Fifth floor, the blue one. Best view in the stacks. The harbor and the fire."': '[scaffold] "Quinto piso, el azul. La mejor vista de las pilas. El puerto y el fuego."',
  'A dockhand shell': 'Un cuerpo estibador',
  '[scaffold] "Union card." He shows it to you. It\'s laminated twice.': '[scaffold] "Carnet del sindicato." Te lo muestra. Está plastificado dos veces.',
  'A patient in line': 'Un paciente en la fila',
  '[scaffold] "I\'m not sick. I just like being somewhere with a line."': '[scaffold] "No estoy enfermo. Solo me gusta estar en un lugar con fila."',
  'A sailor on a second-floor mooring': 'Un marinero amarrado a un segundo piso',
  '[scaffold] "I tied up to my old bedroom window. Felt right."': '[scaffold] "Amarré a la ventana de mi antiguo cuarto. Me pareció lo correcto."',
};
