// Engine demo for comic pages (src/game/comic.js). Open the game with ?comic=demo.
// No story here, only the format: two pages built from the game's own props and tiles, one of each
// kind of lettering. Real comics are placed by the Lore Keeper and written as sealed content.
// Format: docs/art/comic-pages.md.
export default {
  id: 'demo',
  paper: 'bone',
  pages: [
    {
      layout: 'strip3',
      panels: [
        {
          bg: 'night',
          art: [
            { key: 'tiles', frame: 'tile_44_0', x: 0, y: 89, scale: 2, repeat: 'x' },
            { key: 'props', frame: 'obj.floodlight', x: 40, y: 45, scale: 2 },
            { key: 'props', frame: 'obj.barrier', x: 120, y: 49, scale: 2 },
            { key: 'props', frame: 'npc.trooper', x: 168, y: 47, scale: 2 },
            { key: 'props', frame: 'obj.barrier', x: 216, y: 49, scale: 2 },
            { key: 'props', frame: 'npc.trooper_side', x: 264, y: 47, scale: 2 },
            { key: 'props', frame: 'obj.barrier', x: 312, y: 49, scale: 2 },
            { key: 'props', frame: 'obj.cordon_booth', x: 384, y: 45, scale: 2 },
          ],
          text: [
            { kind: 'caption', style: 'narration', en: 'Meanwhile, at the north checkpoint.', es: 'Mientras tanto, en el puesto de control norte.' },
            { kind: 'sfx', en: 'bzzzz', es: 'bzzzz', x: 70, y: 38, size: 8, color: 'concrete3', angle: -6 },
          ],
        },
        {
          bg: 'night',
          art: [
            { key: 'tiles', frame: 'tile_44_0', x: 0, y: 73, scale: 3, repeat: 'x' },
            { key: 'props', frame: 'obj.floodlight', x: 16, y: 22, scale: 3 },
            { key: 'props', frame: 'npc.trooper', x: 120, y: 38, scale: 3 },
          ],
          text: [
            { kind: 'balloon', en: 'What time is it?', es: '¿Qué hora es?', x: 40, y: 8, tail: [140, 46] },
          ],
        },
        {
          bg: 'night',
          art: [
            { key: 'tiles', frame: 'tile_44_0', x: 0, y: 73, scale: 3, repeat: 'x' },
            { key: 'props', frame: 'npc.trooper_side', x: 70, y: 38, scale: 3 },
          ],
          text: [
            { kind: 'balloon', en: 'Same as the last time you asked.', es: 'La misma que la última vez que preguntaste.', x: 110, y: 10, tail: [96, 46] },
          ],
        },
      ],
    },
    {
      layout: 'two',
      panels: [
        {
          bg: 'night',
          art: [
            { key: 'tiles', frame: 'tile_115_0', x: 0, y: 184, scale: 4, repeat: 'x' },
            { key: 'props', frame: 'obj.cordon_booth', x: 82, y: 104, scale: 4 },
          ],
          text: [
            { kind: 'caption', style: 'log', en: 'Citizens, things are stable.', es: 'Ciudadanos, las cosas están estables.', x: 40, y: 40, w: 150 },
          ],
        },
        {
          bg: 'night',
          art: [
            { key: 'tiles', frame: 'tile_115_0', x: 0, y: 184, scale: 4, repeat: 'x' },
            { key: 'props', frame: 'npc.trooper_back', x: 40, y: 104, scale: 4 },
            { key: 'props', frame: 'npc.trooper_back', x: 124, y: 104, scale: 4 },
          ],
          text: [
            { kind: 'balloon', style: 'whisper', en: 'It said it different that time.', es: 'Esta vez lo dijo distinto.', x: 100, y: 30, tail: [156, 110] },
            { kind: 'caption', style: 'narration', en: 'Comic pages demo', es: 'Demo de páginas de cómic', at: 'bottom', x: 120 },
          ],
        },
      ],
    },
  ],
};
