// A sealed gag (Michael, 2026-11-19; what it is: docs/sealed/ and hub task #20). ROT13 so the source
// doesn't give it away. src/game/moods.js plays these on maps marked `hood: true`.
const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));

export const MOOD_WHO = 'manuel';
export const MOOD_LINES = [
  { en: 'Pur. V qba\'g yvxr guvf oybpx. Ng nyy.', es: 'Pur. Ab zr thfgn rfgn phnqen. Cnen anqn.' },
  { en: 'Qvq gung jvaqbj whfg zbir? Vg zbirq.', es: '¿Rfn iragnan fr zbivó? Fr zbivó.' },
  { en: 'Jr jnyx snfg, jr qba\'g fgbc, jr qba\'g gbhpu nalguvat.', es: 'Pnzvanzbf eácvqb, ab cnenzbf, ab gbpnzbf anqn.' },
  { en: 'V\'z evtug oruvaq lbh. Irel evtug oruvaq lbh.', es: 'Rfgbl whfgb ngeáf ghlb. Zhl whfgb ngeáf.' },
  { en: 'Ubj zhpu ybatre ner jr urer? Nccebkvzngryl.', es: '¿Pháagb záf abf dhrqnzbf npá? Ncebkvznqnzragr.' },
  { en: 'V\'z abg fpnerq. Zl yrtf ner fpnerq. V\'z whfg jvgu gurz.', es: 'Ab gratb zvrqb. Zvf cvreanf gvrara zvrqb. Lb rfgbl pba ryynf.' },
  { en: 'Guvf zhpu pbqr ebg pna\'g or tbbq sbe zl zngr.', es: 'Gnagn cbqerqhzoer ab yr chrqr unpre ovra n zv zngr.' },
  { en: 'Pna jr tb onpx gb gur ghaaryf? V zvff gur ghaaryf.', es: '¿Cbqrzbf ibyire n ybf gúaryrf? Rkgenñb ybf gúaryrf.' },
].map((l) => ({ en: rot13(l.en), es: rot13(l.es) }));
