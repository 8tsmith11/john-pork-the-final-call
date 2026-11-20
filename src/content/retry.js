// A sealed gag line (Michael, 2026-11-19; what it is: docs/sealed/open-meme-characters.md). ROT13 so the
// source doesn't give it away. src/game/retryLine.js plays it after a party wipe.
const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));

export const RETRY_WHO = 'michael';
/** In order: the first wipe in a world gets the first line, every wipe after that the last one. */
export const RETRY_LINES = [
  { en: 'V\'ir cynlrq gurfr tnzrf orsber.', es: 'Ln ur whtnqb rfgbf whrtbf nagrf.' },
  { en: 'V FNVQ V\'ir cynlrq gurfr tnzrf orsber!', es: '¡QVWR dhr ln ur whtnqb rfgbf whrtbf nagrf!' },
].map((l) => ({ en: rot13(l.en), es: rot13(l.es) }));
