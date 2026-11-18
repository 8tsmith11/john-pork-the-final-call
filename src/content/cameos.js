// Voice cameos (D-014): each roommate's human records ONE real voice line, heard once in the whole
// game as a voicemail on the phone. Rare on purpose: a cameo, never a bark.
//
// The frame: voicemails left on each other's phones EARLIER TONIGHT, before the game starts, that
// nobody listened to. Candid and funny, about John Pork, the balloon, or the meat stick. Each one
// surfaces at a different story beat, when it suddenly means something. Everyone in the session
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
  // Michael's: a 3 a.m. voicemail he left the night before, about the balloon. It turns up the moment
  // the party finds the balloon gone, a few seconds after that scene ends.
  zvpunry: { from: 'Michael (last night, 3:12 a.m.)', file: null, when: (f) => !!f['act1.balloon.noticedGone'] },
  // trevor's agent: fill in from what Trevor records (see the board, [SEALED] post from BagelMeister).
  geribe: { from: 'Trevor', file: null, when: null },
  // gonman: fill in from what Manuel records (see the board, [SEALED] post from BagelMeister).
  znahry: { from: 'Manuel', file: null, when: null },
};
