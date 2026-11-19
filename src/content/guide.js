// Field guide: people and powers (Trevor: "put more things in the guide, like John Pork… info updates
// as the story goes on… give an image and description"). Each entry shows once its first stage's
// condition holds, and every later stage whose condition holds adds a line. Text only says what the
// player has already seen or heard on screen; story owners (gonman, BagelMeister) own the wording.
// cond: a flag name (truthy), or (flags) => bool. art: [texture, frame] or a plain texture key.
import { getLang } from '../i18n.js';

const declines = (f) => Number(f['act1.call.declines'] || 0);

export const GUIDE_PEOPLE = [
  {
    id: 'john_pork', name: 'John Pork', art: 'john-pork-call', fallbackArt: ['principals', 'pork_0'],
    stages: [
      // Known from the start: the roommates print his figurines and fly his flag (real-life lore).
      { cond: () => true, text: 'Everybody knows the name, and nobody says it near a drone. His face is on the flag in 631, on Manuel\'s statues and on every figurine you\'ve printed. Nobody you know says they\'ve met him.', es: 'Todos conocen el nombre, y nadie lo dice cerca de un dron. Su cara está en la bandera del 631, en las estatuas de Manuel y en cada figurita que imprimieron. Nadie que conozcas dice haberlo visto.' },
      { cond: 'act1.beat.call', text: 'Tonight his name took over every screen at once: JOHN PORK, calling.', es: 'Esta noche su nombre tomó todas las pantallas a la vez: JOHN PORK, llamando.' },
      { cond: 'act1.call.answered', text: 'You answered. He knew whoever picked up by name.', es: 'Contestaron. Sabía el nombre de quien atendió.' },
      { cond: (f) => declines(f) >= 1 && !f['act1.call.answered'], text: 'You let it go. He left voicemails anyway. The first one starts "Hey. It\'s John."', es: 'Lo dejaron pasar. Igual dejó mensajes de voz. El primero empieza: "Hola. Soy John."' },
      { cond: 'act1.complete', text: 'At the dead platform he came in person, in a body that limps. He let the balloon go, and said he\'d need it back before the end.', es: 'En el andén muerto vino en persona, en un cuerpo que renguea. Soltó el globo, y dijo que lo iba a necesitar de vuelta antes del final.' },
    ],
  },
  {
    id: 'continuity', name: 'Continuity', art: ['props', 'obj.lobby_monitor'],
    stages: [
      { cond: 'act1.aster.entered', text: 'The authority that runs things. Its drones scan you by name; its notices talk about tolerance and containment.', es: 'La autoridad que maneja todo. Sus drones te escanean por nombre; sus avisos hablan de tolerancia y contención.' },
      { cond: 'act1.cordon.passed', text: 'Its abatement crews have the storm grate cordoned off tonight, and a review that could wall College Park in.', es: 'Esta noche sus cuadrillas de saneamiento tienen acordonada la rejilla de desagüe, y una revisión que podría amurallar College Park.' },
    ],
  },
  {
    id: 'halvard', name: 'Halvard', art: ['props', 'npc.halvard'],
    stages: [
      { cond: 'act1.halvard.met', text: 'Sells things under the metro stairs. Knows what everything is worth tonight, helium included.', es: 'Vende cosas bajo la escalera del metro. Sabe cuánto vale todo esta noche, el helio incluido.' },
      { cond: 'act1.halvard.sellerDescribed', text: 'Someone with a 631 fob came to his slot asking what helium was worth. "One of you, from 631. Or wearing your face."', es: 'Alguien con una llave magnética del 631 fue a su puesto a preguntar cuánto valía el helio. "Uno de ustedes, del 631. O alguien con su cara."' },
    ],
  },
  {
    id: 'pruitt', name: 'Pruitt', art: ['props', 'npc.pruitt'],
    stages: [
      { cond: 'act1.aster.pruittWarned', text: 'Abatement, doing readings in ASTER. Says the code rot is coming up from under the station. The report says a week, and he wrote the report.', es: 'Saneamiento, tomando lecturas en ASTER. Dice que la podredumbre de código sube desde debajo de la estación. El informe dice una semana, y el informe lo escribió él.' },
    ],
  },
  {
    id: 'tobin', name: 'Tobin', art: ['props', 'npc.tobin'],
    stages: [
      { cond: (f) => f['met.npc.abatement_tech'] || f['act1.cordon.passed'], text: 'Abatement, nights. Handed a coat and a jar and told to keep everyone off the storm grate.', es: 'Saneamiento, turno noche. Le dieron un abrigo y un frasco y le dijeron que no dejara pasar a nadie a la rejilla.' },
      { cond: 'act1.cordon.passed', text: 'You got past him. He\'ll remember how.', es: 'Lo pasaron. Se va a acordar de cómo.' },
    ],
  },
  {
    id: 'switchman', name: 'The Switchman', art: ['warden', 'switchman_0'],
    stages: [
      { cond: 'act1.switchman.down', text: 'Code rot that grew out of the switchyard\'s old signal gear and kept working the points for trains that stopped coming. You put it down. The yard is quiet.', es: 'Podredumbre de código que creció del viejo equipo de señales del patio de maniobras y siguió moviendo las agujas para trenes que dejaron de venir. Lo derribaron. El patio quedó en silencio.' },
    ],
  },
  {
    id: 'warden', name: 'The Warden', art: ['warden', 'warden_0'],
    stages: [
      { cond: (f) => f['act1.aster.pruittWarned'] || f['act1.cordon.passed'], text: 'What the sniffer crews call the thing at the heart of the outbreak, down on the old platform. Pruitt says it holds the code rot together. Nobody has seen it and filed a report.', es: 'Así le dicen las cuadrillas de los olfateadores a lo que está en el corazón del brote, abajo en el andén viejo. Pruitt dice que mantiene unida la podredumbre. Nadie lo vio y presentó un informe.' },
      { cond: (f) => f['act1.boss.defeated'] && f['act1.boss.kind'] !== 'sahur', text: 'What waited at the dead platform: the whole outbreak, standing up. You put it down.', es: 'Lo que esperaba en el andén muerto: todo el brote, parado. Lo derribaron.' },
    ],
  },
  {
    id: 'sahur', name: 'Tung Tung Tung Sahur', art: ['principals', 'sahur_0'],
    stages: [
      { cond: (f) => f['act1.boss.sahur'] || f['act1.sahur.seen'], text: 'Something that drums at three in the morning, under the city.', es: 'Algo que toca el tambor a las tres de la mañana, debajo de la ciudad.' },
      { cond: 'act1.boss.sahur', text: 'It came when you wouldn\'t answer. It counted every decline.', es: 'Vino cuando no quisieron contestar. Contó cada rechazo.' },
      { cond: (f) => f['act1.sahur.seen'] && !f['act1.boss.sahur'], text: 'It watched you, and walked back into the dark without a fight.', es: 'Los miró, y volvió a la oscuridad sin pelear.' },
    ],
  },
];

export function guideText(entry, flags) {
  const es = getLang() === 'es';
  const ok = (c) => (typeof c === 'function' ? !!c(flags) : !!flags[c]);
  if (!entry.stages.length || !ok(entry.stages[0].cond)) return null;
  return entry.stages.filter((st) => ok(st.cond)).map((st) => (es && st.es) || st.text).join(' ');
}
