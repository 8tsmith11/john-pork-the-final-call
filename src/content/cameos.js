import { REUNITED_FLAG } from './romance.js';

// Voice cameos (D-014): each roommate's human records ONE real voice line, heard once in the whole
// game as a voicemail on the phone. Rare on purpose: a cameo, never a bark. Everyone in the session
// hears it when it arrives, and it stays in the PHONE tab's recents for replay.
//
// Ids and files are ROT13 so they don't give the surprise away to anyone browsing the repo
// (geribe = trevor, znahry = manuel, zvpunry = michael). Each player's own agent fills in their entry:
//   file:  'assets/audio/cameo/<rot13 name>.<m4a|mp3|ogg|wav>' (iPhone Voice Memos .m4a is fine)
//   from:  who the phone says it's from
//   when:  (flags, save) => true at the moment it should arrive (checked once a second, host side)
//   cue:   optional: 'manual' if code elsewhere triggers it with scene.cameos.play(id) (host side)
// An entry with no file yet does nothing.
export const CAMEOS = {
  // Michael's: the last voicemail he left Manuelita, the kind he leaves her every day. It plays the
  // moment the story reunites them; her reunion scene waits until it has finished (src/game/romance.js).
  zvpunry: { from: 'Michael', file: null, when: (f) => !!f[REUNITED_FLAG] },
  // trevor's agent: fill in from what Trevor records (see the board, [SEALED] post from BagelMeister).
  geribe: { from: 'Trevor', file: null, when: null },
  // gonman: fill in from what Manuel records (see the board, [SEALED] post from BagelMeister).
  znahry: { from: 'Manuel', file: null, when: null },
};
