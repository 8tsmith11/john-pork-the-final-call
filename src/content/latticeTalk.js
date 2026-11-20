// Table talk for Lattice, the casino board game (Trevor: "the game ui should also be visually appealing, polished,
// and have dialogue in it"). The host picks a line when something happens at the table and every screen shows it
// as a speech bubble by the speaker. [SCAFFOLD] lines in each roommate's voice, kept inside everyone's floors
// (docs/lore/roommates.md); the opponent is a generic dealer because who it really is belongs to the story (sealed).
// Story and world agents: replace freely, the shape is { event: { speaker: [[en, es], ...] } }.
//
// Events: start, seven (the roller), robbed (the victim), robbing (the thief), build (the builder),
// close (the one at match point), warn (someone else, about the leader), win, lose, tradeYes, tradeNo (the asked).

export const LATTICE_TALK = {
  start: {
    dealer: [['Sit. The house deals, the dice decide.', 'Siéntense. La casa reparte, los dados deciden.'],
      ['Three of you and one of me. I like those odds.', 'Tres contra uno. Me gustan esas probabilidades.']],
    trevor: [['Okay. Just like board game night. Except I win this one.', 'Bueno. Como la noche de juegos. Solo que esta la gano yo.']],
    manuel: [['Dale. I designed better boards than this in second year.', 'Dale. Diseñé tableros mejores que este en segundo año.']],
    michael: [['I already know how everyone is going to play.', 'Ya sé cómo va a jugar cada uno.']],
  },
  seven: {
    dealer: [['Seven. The rot spreads. It always does.', 'Siete. La podredumbre se esparce. Siempre pasa.']],
    trevor: [['Seven? Come on.', '¿Siete? Vamos.']],
    manuel: [['Siete. Típico.', 'Siete. Típico.']],
    michael: [['Called it.', 'Lo sabía.']],
  },
  robbed: {
    dealer: [['You would rob the house? Bold.', '¿Le robas a la casa? Qué valiente.']],
    trevor: [['Hey! That was my wire.', '¡Ey! Ese era mi cable.']],
    manuel: [['Che, that was mine.', 'Che, eso era mío.']],
    michael: [['Rude. Very rude.', 'Grosero. Muy grosero.']],
  },
  robbing: {
    dealer: [["I'll take that. House rules.", 'Me quedo con eso. Reglas de la casa.']],
    trevor: [['Sorry. Not sorry.', 'Perdón. No, mentira.']],
    manuel: [['Business is business.', 'Negocios son negocios.']],
    michael: [["You'll get it back. Probably.", 'Ya te lo devuelvo. Seguramente.']],
  },
  build: {
    dealer: [['Another piece. The board remembers.', 'Otra pieza. El tablero no olvida.']],
    trevor: [['Relay is up. Soldered it in my head.', 'El relé está listo. Lo soldé en la cabeza.']],
    manuel: [['Clean geometry. Look at that.', 'Geometría limpia. Mirá eso.']],
    michael: [["Networking. It's what I do.", 'Hacer contactos. Es lo mío.']],
  },
  close: {
    dealer: [["One more and the table's mine.", 'Una más y la mesa es mía.']],
    trevor: [['One more point. Nobody breathe.', 'Un punto más. Que nadie respire.']],
    manuel: [["One more and I'm buying the mate.", 'Una más y pago el mate.']],
    michael: [["Don't look at my hand. Just don't.", 'No miren mi mano. No.']],
  },
  warn: {
    dealer: [['Careful. Someone is about to win.', 'Cuidado. Alguien está por ganar.']],
    trevor: [["Somebody stop them, they're one away!", '¡Alguien frénelo, le falta uno!']],
    manuel: [['Ojo, they are about to win.', 'Ojo, está por ganar.']],
    michael: [["Heads up, they're one away.", 'Atención, le falta uno.']],
  },
  win: {
    dealer: [['The house wins. It usually does.', 'Gana la casa. Suele pasar.']],
    trevor: [['Ha! Rock and roll.', '¡Ja! Rock and roll.']],
    manuel: [['Engineering wins again.', 'Gana la ingeniería, otra vez.']],
    michael: [['Read the table, win the table.', 'Leer la mesa, ganar la mesa.']],
  },
  lose: {
    dealer: [['Well played. Remember this game. I will.', 'Bien jugado. Recuerden esta partida. Yo lo haré.']],
    trevor: [['Rematch. Best of seven.', 'Revancha. Al mejor de siete.']],
    manuel: [['The dice are loaded. I am sure of it.', 'Los dados están cargados. Seguro.']],
    michael: [['I let you have that one.', 'Esa se las dejé.']],
  },
  tradeYes: {
    dealer: [["Done. Don't make me regret it.", 'Hecho. No me hagan arrepentirme.']],
    trevor: [['Fair.', 'Justo.']], manuel: [['Dale, trato hecho.', 'Dale, trato hecho.']], michael: [['Pleasure doing business.', 'Un placer hacer negocios.']],
  },
  tradeNo: {
    dealer: [['No deal.', 'No hay trato.']],
    trevor: [['Nah, I need that.', 'Nah, eso lo necesito.']], manuel: [['Ni loco.', 'Ni loco.']], michael: [['Hard pass.', 'Paso.']],
  },
};

/** A line for `speaker` on `event`, as { en, es }, or null. `rand` is a 0-1 number (the host picks). */
export function talkLine(event, speaker, rand = Math.random()) {
  const list = LATTICE_TALK[event]?.[speaker];
  if (!list?.length) return null;
  const [en, es] = list[Math.floor(rand * list.length) % list.length];
  return { en, es };
}
