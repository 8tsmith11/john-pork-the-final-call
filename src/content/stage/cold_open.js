// Act 1, the cold open's staging (hub #98; Michael, D-022). A hold script: it stays up behind the cold_open
// dialogue, and each line with a `> do:` cue in docs/sealed/script/01-cold-open.md plays cues['<node>.<n>']
// while that line is on screen. No silent pre-roll, no narration boxes: everything not spoken is shown here.
// The lines themselves are locked (D-022); only this staging may change. Played from WorldScene on a new world.
// Places are map objects where they can be (the closet may move; gonman, hub #99).
const NEAR_BUNK = 'obj.bunk';

export default {
  id: 'cold_open',
  map: 'room631',
  hold: true,
  cast: {
    trevor: { at: [17, 2], face: 'down' },    // the triple bunk: top
    michael: { at: [18, 3], face: 'down' },   // middle
    manuel: { at: [19, 2], face: 'down' },    // bottom
  },
  steps: [
    { fade: 'out', dur: 0.01 },
    { cam: NEAR_BUNK, zoom: 1.7, dur: 0.01 },
  ],
  cues: {
    // Beat 1: the bunk
    'coldopen_bunk.0': [{ together: [
      { fade: 'in', dur: 0.8 },
      { caption: 'ASTER, College Park. Room 631. 3:40 a.m.', es: 'ASTER, College Park. Departamento 631. 3:40 a. m.', dur: 3 },
      { shake: 0.002, dur: 0.4 },               // the wrist alarm
      { emote: 'trevor', icon: 'sweat' },        // an arm slaps at it
    ] }],
    'coldopen_bunk.1': [{ face: 'michael', dir: 'trevor' }, { emote: 'michael', icon: 'angry' }],   // sits up, squinting
    'coldopen_bunk.2': [{ emote: 'trevor', icon: '...' }],                                            // swallows a pill
    'coldopen_bunk.3': [{ emote: 'manuel', icon: '?' }],                                              // eyes still shut
    'coldopen_bunk.4': [{ face: 'michael', dir: 'down' }, { emote: 'michael', icon: '...' }],         // falls back
    'coldopen_bunk.5': [{ walk: 'manuel', by: [0, 1] }],                                              // rolls out

    // Beat 2: the closet
    'coldopen_closet.0': [{ together: [{ walk: 'manuel', to: 'obj.manuel_closet' }, { cam: 'obj.manuel_closet', zoom: 1.7, dur: 1.2 }] },
      { face: 'manuel', dir: 'obj.manuel_closet' }],
    'coldopen_closet.1': [{ together: [{ cam: 'obj.manuel_closet', zoom: 2.1, dur: 0.8 }, { emote: 'manuel', icon: '!' }] }],   // the ribbon, ending in nothing
    'coldopen_closet.2': [{ together: [
      { emote: 'trevor', icon: '!' },
      { walk: 'trevor', to: 'obj.manuel_closet', speed: 64 },
      { walk: 'michael', by: [1, 1], speed: 64 },
    ] }],
    'coldopen_closet.3': [{ face: 'michael', dir: 'obj.manuel_closet' }, { emote: 'michael', icon: '!' }],   // stares at the empty rail
    'coldopen_closet.4': [{ face: 'manuel', dir: 'michael' }],                                                // holds up the cut end
    'coldopen_closet.5': [{ face: 'manuel', dir: 'trevor' }, { wait: 0.9 }, { face: 'manuel', dir: 'michael' }, { emote: 'manuel', icon: '?' }],
    'coldopen_closet.6': [{ face: 'manuel', dir: 'obj.manuel_closet' }, { emote: 'manuel', icon: '...' }],   // turns the ribbon over

    // Beat 3: the front door
    'coldopen_door.0': [{ together: [
      { walk: 'michael', to: [[22, 5], [22, 6], [12, 8]], speed: 60 },
      { cam: [14, 8], zoom: 1.3, dur: 1.6 },
    ] }, { face: 'michael', dir: 'obj.door' }, { emote: 'michael', icon: '!' }],
    'coldopen_door.1': [{ together: [
      { walk: 'michael', to: [[3, 8]], speed: 56 },
      { walk: 'trevor', to: [[22, 5], [22, 6], [4, 7]], speed: 64 },
      { walk: 'manuel', to: [[22, 5], [22, 6], [4, 9]], speed: 64 },
      { cam: 'obj.front_lock', zoom: 1.9, dur: 1.8 },   // close on the lock: bent plate, loose chain
    ] }, { face: 'michael', dir: 'obj.door' }, { face: 'trevor', dir: 'obj.door' }, { face: 'manuel', dir: 'obj.door' }],
    'coldopen_door.2': [{ together: [{ face: 'trevor', dir: 'michael' }, { face: 'manuel', dir: 'michael' }] }, { emote: 'michael', icon: 'sweat' }],

    // Beat 4: what they took
    'coldopen_taken.0': [{ together: [{ face: 'michael', dir: 'right' }, { cam: [12, 8], zoom: 1.2, dur: 1.4 }] }],   // laptops, guitar, the printers
    'coldopen_taken.1': [{ face: 'michael', dir: 'manuel' }, { emote: 'michael', icon: '!' }],                        // snaps his fingers
    'coldopen_taken.2': [{ together: [{ emote: 'manuel', icon: 'note' }, { walk: 'manuel', by: [0, -1], speed: 70 }, { shake: 0.002, dur: 0.3 }] }],   // lights up, arms out
    'coldopen_taken.3': [{ wait: 0.6 }, { emote: 'manuel', icon: '...' }],                                            // silence; arms down

    // Beat 5: the world
    'coldopen_world.0': [{ together: [{ face: 'trevor', dir: 'obj.pork_flag' }, { cam: 'obj.pork_flag', zoom: 1.3, dur: 1.2 }] },   // the flag
      { cam: 'obj.statue_1', zoom: 1.5, dur: 1 }],                                                                             // and the statues by the door
    'coldopen_world.1': [{ together: [{ cam: 'obj.tv', zoom: 1.6, dur: 1 }, { face: 'michael', dir: 'obj.tv' }, { face: 'trevor', dir: 'obj.tv' }] }],   // the wall screen
    'coldopen_world.2': [{ face: 'manuel', dir: 'obj.tv' }, { wait: 0.4 }, { emote: 'manuel', icon: '!' }],          // turns slowly

    // Beat 6: tonight
    'coldopen_tonight.0': [{ together: [{ cam: 'cast', zoom: 1.4, dur: 1 }, { face: 'manuel', dir: 'trevor' }] }, { emote: 'manuel', icon: '...' }],   // ribbon in the shirt pocket
    'coldopen_tonight.1': [{ walk: 'manuel', by: [1, 0] }, { face: 'manuel', dir: 'obj.door' }],                      // pulling on his shoes
    'coldopen_tonight.2': [{ emote: 'trevor', icon: 'sweat' }, { face: 'trevor', dir: 'manuel' }],                    // sighs, grabs his toque
  },
};
