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
