// Spanish for quests (task #28, trevor's share). Keys are the exact English in src/content/quests.js:
// if you change an English string there, change its key here too (tests/run.js checks coverage).
import { ES_SIDE_QUESTS } from '../content/sideQuests.js';

export const ES_QUESTS = {
  ...ES_SIDE_QUESTS,   // Acts 2 and 3 side quests keep their Spanish beside the English
  'The balloon': 'El globo',
  "Someone forced the front door tonight and took Manuel's orange balloon from his closet. Get it back before morning: Continuity's vans are sniffing for it, and the code rot under the station could get College Park walled in.": "Alguien forzó la puerta esta noche y se llevó el globo naranja del clóset de Manuel. Recupéralo antes de la mañana: las camionetas de Continuidad lo están rastreando, y la podredumbre bajo la estación podría hacer que amurallen College Park.",
  "Check Manuel's closet.": 'Revisa el clóset de Manuel.',
  'Search the apartment and gear up. Then find out who did this.': 'Revisa el departamento y equípate. Después averigua quién fue.',
  'Ask around the ASTER lobby. Somebody saw something at 3 a.m.': 'Pregunta en el lobby de ASTER. Alguien vio algo a las 3 a. m.',
  "Run down two of the three leads: the phone seller under the metro station steps, the security monitor on the ASTER lobby desk (fix it to see the 3 a.m. footage), or the helium trail (print a sniffer at Fab #1).": "Sigue dos de las tres pistas: el que vende teléfonos bajo las escaleras de la estación del metro, el monitor de seguridad en el mostrador del lobby de ASTER (arréglalo para ver el video de las 3 a. m.) o el rastro de helio (imprime un rastreador en Fab #1).",
  "The trail goes down the storm grate into the Green Line. Get past the abatement cordon in the plaza.": "El rastro baja por la rejilla de desagüe hacia la Línea Verde. Pasa el cordón de saneamiento de la plaza.",
  "Follow the Green Line tunnels east, toward the old platform.": "Sigue los túneles de la Línea Verde hacia el este, rumbo al andén viejo.",
  "The gate panel has no fuses. Its sticker says the spares are with the ASTER super, B-01: that's Kess, in the ASTER lobby. Go back up and ask her.": "El tablero del portón no tiene fusibles. Su etiqueta dice que los repuestos los tiene la encargada de ASTER, B-01: es Kess, en el lobby de ASTER. Vuelve a subir y pídeselos.",
  "Open the gate to the dead platform. The breaker panel is live now; the gate itself says what else it needs.": "Abre el portón al andén muerto. El tablero de disyuntores ya tiene corriente; el portón mismo dice qué más le falta.",
  "Reach the dead platform. The balloon is down there, and so is the heart of the outbreak.": "Llega al andén muerto. El globo está ahí abajo, y también el corazón del brote.",

  'Soup on the landing': 'Sopa en el descanso',
  'He sits by the stairwell all night. If anyone heard the door at three a.m., it was him.': 'Se sienta junto a la escalera toda la noche. Si alguien oyó la puerta a las tres, fue él.',
  'Bring Four-oh-nine something hot (a mate thermos from the fab or the mate station).': 'Llévale a Cuatro-cero-nueve algo caliente (un termo de mate del fab o de la estación de mate).',
  'He wraps both hands around it and doesn\'t drink it for a while. "My wife used to do this." Then he tells you the stairwell door has been propped open at three a.m. twice this week, and he didn\'t prop it.': 'Lo rodea con las dos manos y tarda en tomarlo. "Mi esposa hacía esto." Después te cuenta que la puerta de la escalera amaneció trabada abierta a las tres dos veces esta semana, y que no fue él.',
  'Four-oh-nine has been sitting on the stairwell landing with a bowl of soup going cold for an hour. "Mine\'s cold. Everything up here goes cold. You got anything hot?"': 'Cuatro-cero-nueve lleva una hora en el descanso con un plato de sopa que se enfría. "La mía está fría. Todo aquí arriba se enfría. ¿Tienes algo caliente?"',

  'What the van wants': 'Lo que busca la camioneta',
  'An abatement van with a sniffer mast, parked outside your building tonight. It might be looking for the same thing you are.': 'Una camioneta de saneamiento con un mástil rastreador, estacionada frente a tu edificio esta noche. Quizá busca lo mismo que tú.',
  'Look at the abatement van in College Park.': 'Revisa la camioneta de saneamiento en College Park.',
  'Tell Dez what you saw.': 'Cuéntale a Dez lo que viste.',
  '"Helium sniffer. That\'s what the mast is." He finally sits up. "Somebody\'s looking for the same thing you are. And they get paid more."': '"Rastreador de helio. Eso es el mástil." Por fin se endereza. "Alguien busca lo mismo que tú. Y le pagan más."',
  'Dez, half asleep against the mailboxes: "White van out front since four. No plates. Mast on the roof. Go look at it for me, I\'m not getting up."': 'Dez, medio dormido contra los buzones: "Camioneta blanca afuera desde las cuatro. Sin placas. Mástil en el techo. Ve a verla por mí, yo no me levanto."',

  'Forty names': 'Cuarenta nombres',
  'Whoever came in at three a.m. might be in that book.': 'Quien haya entrado a las tres puede estar en ese libro.',
  'Read the sign-in book at the security desk.': 'Lee el libro de registro en el mostrador de seguridad.',
  'Tell Fenwick whose name it is.': 'Dile a Fenwick de quién es el nombre.',
  '"I see." He is still for a while. "I do not have a room here. I have a desk. I believe I wanted to see how it looked."': '"Ya veo." Se queda quieto un rato. "No tengo un cuarto aquí. Tengo un escritorio. Creo que quería ver cómo se veía."',
  '"The sign-in book. The last forty entries are one name. I would like a resident to read it, because I am not certain I am permitted to notice."': '"El libro de registro. Las últimas cuarenta entradas son un solo nombre. Quisiera que lo leyera un residente, porque no estoy seguro de que se me permita notarlo."',

  "A line that isn't his": 'Una línea que no es suya',
  'You have to get through the switchyard anyway, and nobody alive knows it better than Pell.': 'Igual tienes que cruzar el patio de maniobras, y nadie vivo lo conoce mejor que Pell.',
  'Find the yard diagram in the Green Line switchyard.': 'Encuentra el diagrama del patio en el patio de maniobras de la Línea Verde.',
  'Tell Arthur Pell about the extra line.': 'Cuéntale a Arthur Pell de la línea de más.',
  '"That isn\'t mine." He does the sum twice on the slide rule. "That\'s where track four went. They told us it was filled in."': '"Esa no es mía." Hace la cuenta dos veces con la regla de cálculo. "Ahí iba la vía cuatro. Nos dijeron que la habían rellenado."',
  '"There\'s a diagram of the yard down there with my corrections on it. Forty-one years of them. If you\'re going anyway, tell me whether anybody has added a line that isn\'t mine."': '"Allá abajo hay un diagrama del patio con mis correcciones. Cuarenta y un años de correcciones. Si vas a ir igual, dime si alguien agregó una línea que no sea mía."',

  'Not dinner': 'No es la cena',
  "Mrs. Okafor has watched ASTER's doors longer than anyone. Worth being on her good side.": 'La señora Okafor lleva más tiempo que nadie vigilando las puertas de ASTER. Conviene caerle bien.',
  'Bring Mrs. Okafor a bag of crab chips from the corner store.': 'Llévale a la señora Okafor una bolsa de papitas de cangrejo de la tienda de la esquina.',
  'She opens the bag, takes one, and hands you the rest. "My husband hated these. Forty years. I am only now finding out I like them."': 'Abre la bolsa, saca una y te da el resto. "Mi esposo las odiaba. Cuarenta años. Recién ahora descubro que me gustan."',
  '"Three generations upstairs arguing about dinner. Bring me something that is not dinner. The corner store has them. Red bag."': '"Tres generaciones arriba discutiendo por la cena. Tráeme algo que no sea la cena. La tienda de la esquina las tiene. Bolsa roja."',

  'The man on the bench': 'El hombre del banco',
  'Mina notices who stops showing up. She might notice other things, too.': 'Mina se da cuenta de quién deja de venir. Quizá también note otras cosas.',
  'Look at what was left on the plaza bench.': 'Mira lo que dejaron en el banco de la plaza.',
  'Tell Mina who he is.': 'Dile a Mina quién es.',
  '"The engineer. Huh." She plays four bars of something slow. "Tell him I do requests. Tell him I\'d do that one."': '"El ingeniero. Vaya." Toca cuatro compases de algo lento. "Dile que acepto pedidos. Dile que esa la tocaría."',
  '"A man sat on that bench every night for a year and listened. He hasn\'t been in a week, and he left his glasses. Look for me. I can\'t leave the pitch."': '"Un hombre se sentó en ese banco todas las noches durante un año a escuchar. Hace una semana que no viene, y dejó sus lentes. Fíjate por mí. No puedo dejar mi lugar."',

  'The red one': 'La roja',
  "Big Ray keeps the scooters running, and you'll want one that does.": 'Big Ray mantiene andando los scooters, y vas a querer uno que ande.',
  'Bring Big Ray a circuit board.': 'Llévale a Big Ray una placa de circuito.',
  'He turns it over under the lamp. "That\'s a 245 lab board. I can tell by the solder. Somebody was angry."': 'La da vuelta bajo la lámpara. "Esa es una placa del laboratorio 245. Se nota por la soldadura. Alguien estaba enojado."',
  '"Charger board\'s cooked on the red one. Bring me a circuit board and I\'ll make it worth the walk."': '"La placa del cargador de la roja está frita. Tráeme una placa de circuito y te va a valer la caminata."',

  'Something that glows': 'Algo que brilla',
  "Ozzie has fished this lake for fifty-two years. Whatever goes into it, he's seen.": 'Ozzie pesca en este lago hace cincuenta y dos años. Lo que sea que entra ahí, él lo vio.',
  'Catch a lantern bass in Lake Artemesia and bring it to Ozzie on the south pier.': 'Pesca una lubina farol en el lago Artemesia y llévasela a Ozzie al muelle sur.',
  'He holds it up to his face for a long time. The light moves under the scales. "Huh," he says. He writes in the notebook, one tally mark, very carefully. Then he lets it go off the end of the pier, and hands you a lure out of his hat.': 'La sostiene frente a la cara un buen rato. La luz se mueve bajo las escamas. "Vaya", dice. Anota en el cuaderno una sola rayita, con mucho cuidado. Después la suelta desde la punta del muelle y te da un señuelo de su sombrero.',
  'Ozzie taps the notebook without looking up. "Fifty-two years on this pier. Every fish in here, I\'ve had. Except one. Bass with a light in it. My wife saw one in \'61. I never have." He finally looks at you. "You got young eyes. Fish the lake."': 'Ozzie golpea el cuaderno sin levantar la vista. "Cincuenta y dos años en este muelle. Todos los peces de aquí los tuve. Menos uno. Una lubina con una luz adentro. Mi esposa vio una en el 61. Yo nunca." Por fin te mira. "Tienes ojos jóvenes. Pesca en el lago."',

  'Something to swing': 'Algo para blandir',
  'Coderot is loose in the building tonight, and none of you is holding so much as a wrench. The toolwall over the workbench in 631 has three pry bars.': 'El coderot anda suelto en el edificio esta noche, y ninguno de ustedes tiene ni una llave inglesa. El panel de herramientas sobre el banco de trabajo del 631 tiene tres barretas.',
  'Take a pry bar from the toolwall in 631 (over the workbench).': 'Toma una barreta del panel de herramientas del 631 (sobre el banco de trabajo).',
  "Hotbar: 1-9 or the mouse wheel picks what's in your hand. Left click swings it.": 'Barra: 1-9 o la rueda del ratón eligen lo que tienes en la mano. Clic izquierdo para blandirlo.',

  'Get it running': 'Hacerlo andar',
  'Trevor builds combat robots. The wedge bot in his room just needs parts, and a robot that rams coderot on its own is worth a lot tonight.': 'Trevor construye robots de combate. El bot cuña de su cuarto solo necesita piezas, y un robot que embiste coderot por su cuenta vale mucho esta noche.',
  'Print a drive module, a spinner bar and a control board at the fab.': 'Imprime un módulo de tracción, una barra giratoria y una placa de control en el fab.',
  "Install the parts on the combat robot in Trevor's room.": 'Instala las piezas en el robot de combate del cuarto de Trevor.',
  'The bot twitches, spins its bar up to a whine, and rolls off the desk on its own. It parks itself at your heel and waits.': 'El bot se sacude, hace girar la barra hasta que chilla y baja solo del escritorio. Se estaciona a tus pies y espera.',

  // Courtships (src/content/romance.js builds these from a template: if the English there changes,
  // change the keys here too).
  'Brooke': 'Brooke',
  'Trevor: bring Brooke flowers (the corner store sells them).': 'Trevor: llévale flores a Brooke (las venden en la tienda de la esquina).',
  'Trevor: clear out 6 coderot things, then go back to Brooke.': 'Trevor: limpia 6 cosas de coderot y vuelve con Brooke.',
  'Trevor: bring Brooke chocolates.': 'Trevor: llévale bombones a Brooke.',
  'Trevor: play Brooke a song on a guitar, close by.': 'Trevor: tócale una canción a Brooke en una guitarra, bien cerca.',
  'Inés': 'Inés',
  'Manuel: bring Inés flowers (the corner store sells them).': 'Manuel: llévale flores a Inés (las venden en la tienda de la esquina).',
  'Manuel: clear out 6 coderot things, then go back to Inés.': 'Manuel: limpia 6 cosas de coderot y vuelve con Inés.',
  'Manuel: bring Inés chocolates.': 'Manuel: llévale bombones a Inés.',
  'Manuel: play Inés a song on a guitar, close by.': 'Manuel: tócale una canción a Inés en una guitarra, bien cerca.',
};
