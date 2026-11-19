// The gonman, stage two (Manuel's own request, for his own character only; D-007). Implied, never drawn
// (D-015): a censor mosaic, a busy hand, a sound, and what lands on the enemies. No other roommate reacts.
export const GONMAN_LINES = {
  start: ['The gonman needs a minute. Don\'t look.', 'Turn around. All of you.', 'This is a tactical decision.'],
  release: ['The gonman provides.', 'Sticky situation. For them.', 'Nobody talk to me for a bit.'],
};
// What the enemies say when they get hit by it (code rot voice: lowercase, glitchy; bosses shout). Manuel's lines
// for "what is this sticky substance" and "why does it taste so good".
export const GONMAN_HIT = {
  enemy: ['what is this. sticky substance.', 'why does it taste so good.', 'why is it warm.', 'this is not in the documentation.', 'error. stuck. error.', 'is this toothpaste.'],
  boss: ['STICKY SUBSTANCE DETECTED. PLEASE STAND CLEAR.', 'WHY DOES IT TASTE SO GOOD. THIS IS NOT A QUESTION.'],
};
export const GONMAN_UNLOCK = 'The gonman reached stage two. New move: [R] while morphed. Nobody is going to like it.';
