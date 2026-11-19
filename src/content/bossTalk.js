// Live boss talk (Trevor: "bosses can talk while the players are moving without expecting a response,
// or the players give a response anyway, automatically, without freezing their movement").
// Shown as speech bubbles over the speaker; nothing pauses and nothing waits for input. After the boss
// line, one roommate who's in the fight answers on their own (`reply`, by character; `any` as fallback).
// Story owners (gonman, BagelMeister) own the words; these are first drafts. Keep them short: a bubble
// is read mid-dodge. Spanish in `es` (same shape).
export const BOSS_TALK = {
  warden: {
    intro: {
      line: 'YOUR CALL IS IMPORTANT TO US.',
      reply: { trevor: 'Then pick up.', michael: 'Oh, it\'s got hold music.', manuel: 'Che. It talks.' },
      es: { line: 'SU LLAMADA ES IMPORTANTE PARA NOSOTROS.', reply: { trevor: 'Entonces contesta.', michael: 'Ay, tiene música de espera.', manuel: 'Che. Habla.' } },
    },
    phase2: {
      line: 'PLEASE HOLD. PLEASE HOLD. PLEASE',
      reply: { trevor: 'It\'s looping. Keep hitting it.', michael: 'It skipped. Did y\'all hear it skip?', manuel: 'Ears up. It\'s changing.' },
      es: { line: 'POR FAVOR ESPERE. POR FAVOR ESPERE. POR FAV', reply: { trevor: 'Está en loop. Sigan pegándole.', michael: '¿Escucharon? Se trabó.', manuel: 'Atentos. Está cambiando.' } },
    },
    phase3: {
      line: 'ALL OF OUR AGENTS ARE',
      reply: { trevor: 'Don\'t let it finish that sentence.', michael: 'Okay. Okay okay okay.', manuel: 'Now. Everything we\'ve got.' },
      es: { line: 'TODOS NUESTROS AGENTES ESTÁN', reply: { trevor: 'Que no termine la frase.', michael: 'Bueno. Bueno bueno bueno.', manuel: 'Ahora. Todo lo que tengamos.' } },
    },
  },
  // Act 1's mid boss in the switchyard (gonman, task #34). It speaks in yard orders.
  switchman: {
    intro: {
      line: 'ALL POINTS SET FOR NOWHERE.',
      reply: { trevor: 'It\'s the yard. The yard grew a guy.', michael: 'Why does everything down here talk?', manuel: 'Che, it has a lever for an arm.' },
      es: { line: 'TODAS LAS AGUJAS PUESTAS HACIA NINGÚN LADO.', reply: { trevor: 'Es el patio. Al patio le creció un tipo.', michael: '¿Por qué aquí abajo habla todo?', manuel: 'Che, tiene una palanca de brazo.' } },
    },
    phase2: {
      line: 'STAND CLEAR OF THE CLOSING POINTS.',
      reply: { trevor: 'The lamp went green. Hit it now.', michael: 'Is green good? Tell me green is good.', manuel: 'Rookie Aster mistake, signalling your moves.' },
      es: { line: 'ALÉJENSE DE LAS AGUJAS QUE SE CIERRAN.', reply: { trevor: 'La lámpara se puso verde. Ahora.', michael: '¿Verde es bueno? Díganme que verde es bueno.', manuel: 'Error de novato de Aster, avisar tus movimientos.' } },
    },
    phase3: {
      line: 'NEXT TRAIN. NEXT TRAIN. NEXT',
      reply: { trevor: 'It\'s stuck on the timetable. Finish it.', michael: 'There is no next train. Stop saying it.', manuel: 'Ya casi. Almost.' },
      es: { line: 'PRÓXIMO TREN. PRÓXIMO TREN. PRÓX', reply: { trevor: 'Se trabó en el horario. Terminemos.', michael: 'No hay próximo tren. Dejá de decirlo.', manuel: 'Ya casi.' } },
    },
  },
  sahur: {
    intro: {
      line: 'tung. tung. tung.',
      reply: { trevor: 'Nope. Nope nope.', michael: 'Is that a drum or a heartbeat?', manuel: 'Don\'t look at the bat.' },
      es: { line: 'tung. tung. tung.', reply: { trevor: 'No. No no.', michael: '¿Eso es un tambor o un corazón?', manuel: 'No miren el bate.' } },
    },
  },
};

export function bossTalk(kind, trigger, lang = 'en') {
  const t = BOSS_TALK[kind]?.[trigger];
  if (!t) return null;
  return lang === 'es' && t.es ? { line: t.es.line ?? t.line, reply: t.es.reply ?? t.reply } : { line: t.line, reply: t.reply };
}
