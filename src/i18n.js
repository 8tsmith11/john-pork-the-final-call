// Language (Trevor: English or Spanish, in the lobby and in settings). Every Text the game draws goes
// through tr() (src/main.js patches the text factory and setText), so a UI string translates wherever
// it appears: exact matches first, then patterns. Anything not listed stays English, so content can
// be translated piece by piece (dialogue and quests: hub task). Stored per browser.
import { ES_QUESTS } from './i18n/es-quests.js';
import { ES_STRETCH } from './i18n/es-stretch.js';
import { ES_ITEMS } from './i18n/es-items.js';
import { ES_631 } from './i18n/es-631.js';
import { ES_TUNNELS_LAKE } from './i18n/es-tunnels-lake.js';
import { ES_ACT2 } from './i18n/es-act2.js';
import { ES_ACT3 } from './i18n/es-act3.js';
import { ES_PLAZA } from './i18n/es-plaza.js';
import { ES_ASTER } from './i18n/es-aster.js';
import { ES_HUD } from './i18n/es-hud.js';
import { ES_ROUTE1 } from './i18n/es-route1.js';
import { ITEMS } from './content/items.js';
const KEY = 'jpfc.lang';
let lang = 'en';
try { lang = localStorage.getItem(KEY) === 'es' ? 'es' : 'en'; } catch { /* private window: English */ }

export const getLang = () => lang;
export function setLang(l) { lang = l === 'es' ? 'es' : 'en'; try { localStorage.setItem(KEY, lang); } catch { /* fine */ } }
export const LANG_LABEL = { en: 'English', es: 'Español' };

// Exact strings (UI chrome). Keep keys exactly as drawn in English.
const ES = {
  // title / lobby
  'choose your roommate': 'elige a tu compañero', 'controls: ESC in game': 'controles: ESC en el juego', 'THE FINAL CALL': 'LA ÚLTIMA LLAMADA',
  '[ESC] back': '[ESC] volver', free: 'libre', 'AI (free to claim)': 'IA (libre)', 'Opening a room...': 'Abriendo una sala...',
  'Pick your roommate first.': 'Primero elige a tu compañero.', 'waiting for the host to start...': 'esperando a que el anfitrión empiece...',
  'Connected. Claim your roommate.': 'Conectado. Elige a tu compañero.', 'The host closed the game.': 'El anfitrión cerró la partida.',
  'Room in progress. Rejoin from your original tab.': 'Partida en curso. Vuelve a entrar desde la pestaña original.',
  'The host started without you. Claim a roommate next time.': 'El anfitrión empezó sin ti. Elige a un compañero la próxima vez.',
  'Maryland, 2098': 'Maryland, 2098', '"why are you still up?"  - J.P.': '"¿por qué sigues despierto?"  - J.P.',
  'no save yet: clicking a roommate starts a new game': 'sin partida guardada: elige un compañero para empezar',
  '[ new game ]': '[ partida nueva ]', '[ import save file ]': '[ importar partida ]', '[ HOST CO-OP ]': '[ CREAR CO-OP ]', '[ JOIN CO-OP ]': '[ UNIRSE CO-OP ]',
  // menu tabs and panels
  // tab labels kept about as long as the English so the bar fits
  INVENTORY: 'OBJETOS', QUESTS: 'MISIONES', GUIDE: 'GUÍA', PHONE: 'TELÉFONO', SKILLS: 'HABIL.', STATS: 'DATOS',
  MAP: 'MAPA', CONTROLS: 'TECLAS', SYSTEM: 'SISTEMA', '[ESC]': '[ESC]', '[ESC] close': '[ESC] cerrar',
  BACKPACK: 'MOCHILA', 'HOTBAR  (keys 1-9)': 'BARRA  (teclas 1-9)', ARMOR: 'ARMADURA', GEAR: 'EQUIPO', ACCESSORIES: 'ACCESORIOS',
  '1-9 select a hotbar slot': '1-9 selecciona una casilla de la barra',
  'BUFFS  (hover gear for details)': 'MEJORAS  (pasa el ratón por el equipo)', 'none right now': 'ninguna ahora',
  // slot labels must fit their 13px boxes
  head: 'cabeza', chest: 'pecho', legs: 'pier.', boots: 'botas', eyes: 'ojos', coat: 'abrigo', hands: 'manos', socks: 'medias', pack: 'moch.',
  melee: 'cuerpo', ranged: 'dist.', gadget: 'útil', charm: 'amul.',
  'click: pick up / place · right click: use / equip / half': 'clic: tomar / dejar · clic der.: usar / equipar / mitad',
  'Right click: split · Shift+right click: use': 'Clic der.: dividir · Mayús+clic der.: usar',
  'G: drop one · Shift+G: drop stack': 'G: soltar uno · Mayús+G: soltar todo',
  'Melee weapon': 'Arma cuerpo a cuerpo', 'Ranged weapon': 'Arma a distancia', Food: 'Comida', Material: 'Material', Curio: 'Curiosidad',
  'Key item': 'Objeto clave', 'Instrument (use to play)': 'Instrumento (úsalo para tocar)', Gift: 'Regalo',
  'Nothing yet.': 'Nada todavía.', 'Nothing new.': 'Nada nuevo.', 'No calls.': 'Sin llamadas.', RECENTS: 'RECIENTES', MESSAGES: 'MENSAJES',
  'EQUIP FOR R': 'EQUIPAR EN R', 'Discover through play.': 'Descúbrelo al jugar.',
  'Score cap': 'Puntuación máxima', 'Modifiers change at even scores.': 'Los modificadores cambian en las puntuaciones pares.',
  'Power Chord': 'Acorde potente', 'Decoy Bust': 'Busto señuelo', 'Mate Rally': 'Ronda de mate', 'Focused Ping': 'Pulso enfocado',
  '[R] Chord': '[R] Acorde', '[R] Rally': '[R] Mate', '[R] Focus': '[R] Pulso', '[R] Decoy': '[R] Señuelo',
  'R sends a longer burst of sound where you aim. It knocks enemies back but leaves your flanks open.': 'R lanza una onda sonora más larga hacia donde apuntas. Empuja a los enemigos y deja tus flancos expuestos.',
  'R restores stamina to you and nearby standing roommates. While transformed at stage two, R still uses Gonman.': 'R te devuelve aguante a ti y a tus compañeros cercanos que estén en pie. Al transformarte en fase dos, R sigue usando Gonman.',
  'R aims one longer-lasting mark farther out. The pulse deals no damage or stagger and still bounces on a kill.': 'R coloca una marca más duradera y de mayor alcance. El pulso no daña ni aturde. La marca salta al abatir al objetivo.',
  'FAB #2 · PRINT': 'FAB #2 · IMPRIMIR', 'no change': 'sin cambio', 'Pick an entry.': 'Elige una entrada.',
  'W/S A/D select · T tune · ENTER print · [ESC] close': 'W/S A/D elegir · T ajustar · ENTER imprimir · [ESC] cerrar',
  Stock: 'Estándar', 'Fast cycle': 'Ciclo rápido', 'High output': 'Alta potencia', Owned: 'tienes',
  '› PRINT': '› IMPRIMIR', 'need materials': 'faltan materiales', 'Not enough materials for that.': 'Faltan materiales.',
  'V: use the equipped gadget': 'V: usar el dispositivo equipado', 'Gadget ready': 'Listo',
  Recharge: 'Recarga', Effect: 'Efecto', Frame: 'Armazón', Power: 'Energía', Payload: 'Carga', 'Control board': 'Controlador',
  Charges: 'Cargas', Load: 'Peso', Damage: 'Daño', Knockback: 'Empuje', 'Slow field': 'Campo ralentizador', 'Scan range': 'Alcance de escaneo',
  'Aim time': 'Preparación', 'Movement penalty': 'Penalización al moverse', 'Glitch risk': 'Riesgo de fallo',
  'Hand-crank power needs no battery.': 'La manivela no necesita batería.',
  'Controller wear increases with use.': 'El controlador se desgasta con el uso.', 'This board does not wear out.': 'Esta placa no se desgasta.',
  '› ASSEMBLE': '› ENSAMBLAR', 'Check the parts and schematics at the workbench.': 'Revisa las piezas y los esquemas en el banco de trabajo.',
  'Gadget assembled. Equip it from your inventory.': 'Dispositivo ensamblado. Equípalo desde el inventario.',
  'Controller glitched. Charge spent.': 'Falló el controlador. Se gastó una carga.', 'Aiming…': 'Preparando…',
  '› SERVICE': '› REVISAR', 'Controller serviced.': 'Controlador revisado.',
  '› DISMANTLE EQUIPPED': '› DESMONTAR EL EQUIPADO', 'Gadget component': 'Pieza de dispositivo',
  'Four empty slots are needed to recover the parts.': 'Necesitas cuatro espacios libres para recuperar las piezas.',
  'Gadget dismantled. Parts returned to your inventory.': 'Dispositivo desmontado. Las piezas volvieron al inventario.',
  '↺ Recovered parts reduce the material cost.': '↺ Las piezas recuperadas reducen el coste de materiales.',
  'gadget cooldown': 'recarga del dispositivo', 'gadget power': 'potencia del dispositivo',
  'swing cooldown': 'recarga del golpe', 'shot cooldown': 'recarga del disparo', 'shot dmg': 'daño de disparo',
  'melee damage': 'daño cuerpo a cuerpo', knock: 'empuje', 'stamina regen': 'recuperación de aguante',
  'No reading yet. Calibrate the sniffer at Fab #1.': 'Todavía no hay lectura. Calibra el rastreador en el Fab #1.',
  'Helium trail: light, and down. Under the plaza.': 'Rastro de helio: liviano y hacia abajo. Debajo de la plaza.',
  'No helium trail here.': 'Aquí no hay rastro de helio.',
  'Salvage detected:': 'Repuestos detectados:', 'No unopened salvage here.': 'No quedan contenedores de repuestos sin abrir aquí.',
  'Nothing yet. Things you see and people you talk to show up here.': 'Nada todavía. Aquí aparece lo que ves y la gente con la que hablas.',
  '› Resume': '› Continuar', '› Save now': '› Guardar ahora', '› Export save file (.jpfc.json)': '› Exportar partida (.jpfc.json)',
  '› Save and quit to title': '› Guardar y volver al título', '› Leave the game': '› Salir de la partida',
  'The host keeps the save for everyone.': 'El anfitrión guarda la partida de todos.',
  // dialogue speaker labels (drawn uppercase); people's names stay as they are
  'WAITING FOR': 'ESPERANDO A', 'CHOICE SENT': 'ELECCIÓN ENVIADA', '▶ YOUR CHOICE': '▶ TÚ ELIGES',
  DRONE: 'DRON', SNIFFER: 'RASTREADOR', NOTICE: 'AVISO', 'AD PANEL': 'PANEL PUBLICITARIO', 'CODE ROTTER': 'PODRIDO DE CÓDIGO',
  'DEPARTURE BOARDS': 'TABLEROS DE SALIDAS', 'LAST DEPARTURE BOARD': 'ÚLTIMO TABLERO DE SALIDAS', "MANUEL'S PHONE": 'TELÉFONO DE MANUEL',
  "MICHAEL'S PHONE": 'TELÉFONO DE MICHAEL', "TREVOR'S PHONE": 'TELÉFONO DE TREVOR', 'ALL PHONES': 'TODOS LOS TELÉFONOS',
  'VOICE 1': 'VOZ 1', 'VOICE 2': 'VOZ 2', TV: 'TELE', "TREVOR'S MOM": 'LA MAMÁ DE TREVOR', MAILBOX: 'BUZÓN DE VOZ', 'TEXT: JOHN PORK': 'MENSAJE: JOHN PORK',
  'click: next · ESC: skip': 'clic: siguiente · ESC: saltar', 'X: skip': 'X: saltar', 'College Park, 2098': 'College Park, 2098',
  'Cutscene in progress': 'Escena en curso',
  'SEND $5 →': 'ENVIAR $5 →', 'Not enough money.': 'No te alcanza.',
  'HOW TO PLAY': 'CÓMO JUGAR', Controls: 'Controles',
  'WASD move · mouse aim · click: use held item': 'WASD moverse · ratón apunta · clic: usar',
  'Space / Shift dodge · E interact · R ability': 'Espacio / Shift esquivar · E usar · R habilidad',
  '1-9 or wheel: hotbar · Q scooter outdoors': '1-9 o rueda: barra · Q scooter afuera',
  'I bag · J quests · K skills · Tab map · ESC': 'I mochila · J misiones · K habil. · Tab mapa · ESC',
  // HUD and prompts
  '[J] quests': '[J] misiones', RELOADING: 'RECARGANDO', 'NEW QUEST': 'NUEVA MISIÓN', 'QUEST UPDATED': 'MISIÓN ACTUALIZADA',
  'QUEST COMPLETE': 'MISIÓN COMPLETADA', 'click to close': 'clic para cerrar', 'click or E to close': 'clic o E para cerrar', '▶ YOUR CHOICE': '▶ TU DECISIÓN',
  'saving…': 'guardando…', '✓ saved': '✓ guardado', 'Your bag is full.': 'Tu mochila está llena.', 'Take it off first.': 'Quítatelo primero.',
  "You can't hand that in right now.": 'No puedes entregar eso ahora.',
  'INCOMING CALL': 'LLAMADA ENTRANTE', 'IS CALLING': 'ESTÁ LLAMANDO', 'F  ANSWER': 'F  CONTESTAR', 'X  DECLINE': 'X  RECHAZAR',
  'INCOMING SIGNAL': 'SEÑAL ENTRANTE', '◉ connecting…': '◉ conectando…', 'Skipped': 'Saltado',
  'Story scene: everyone watches this one.': 'Escena de historia: la ven todos.',
};
// Patterns for strings with numbers or names in them.
const ES_RX = [
  [/^([★·✓]) (.+?)((?:  \((?:side|yours)\))?)$/, (m, a, b, c) => `${a} ${ES_ALL[b] ?? b}${c === '  (side)' ? '  (secundaria)' : c === '  (yours)' ? '  (tuya)' : ''}`],
  [/^Caffeine kicks in\. Faster, and stamina comes back quicker \((\d+)s\)\.$/, (m, n) => `La cafeína pega. Más rápido, y el aguante vuelve antes (${n}s).`],
  [/^(.+)\n\nEveryone has some\. Better, and wide awake\. \(Thermos refilled\.\)$/, (m, a) => `${ES_ALL[a] ?? a}\n\nTodos toman un poco. Mejor, y bien despiertos. (Termo rellenado.)`],
  [/^The code rot takes over\. You've gone under\. Your roommates have (\d+) seconds to pull you back by standing next to you\.$/, (m, n) => `La podredumbre toma el control. Te hundiste. Tus compañeros tienen ${n} segundos para traerte de vuelta quedándose a tu lado.`],
  [/^(.+) has gone under\. Stand next to them to pull them back\.$/, (m, a) => `${a} se hundió. Quédate a su lado para traerle de vuelta.`],
  [/^(.+) is back\.$/, (m, a) => `${a} volvió.`],
  [/^Code rot took (.+)\. Loading the last save…$/, (m, a) => `La podredumbre se llevó a ${a === 'you' ? 'ti' : a}. Cargando la última partida…`],
  [/^pulling back (\d+)%$/, (m, n) => `trayendo de vuelta ${n}%`],
  [/^(.+) ×(\d+)$/, (m, a, n) => `${ES_ALL[a] ?? a} ×${n}`],
  [/^(.+) \+(\d+)$/, (m, a, n) => `${ES_ALL[a] ?? a} +${n}`],
  [/^★ (.+?)( ×\d+)?$/, (m, a, n) => `★ ${ES_ALL[a] ?? a}${n ?? ''}`],
  [/^Bought: (.+) \(-\$(\d+)\)$/, (m, a, n) => `Compraste: ${ES_ALL[a] ?? a} (-$${n})`],
  [/^Sold: (.+) \(\+\$(\d+)\)$/, (m, a, n) => `Vendiste: ${ES_ALL[a] ?? a} (+$${n})`],
  [/^\[E again: (\d+)\/(\d+)\]$/, '[E otra vez: $1/$2]'],   // the page count under a paged object (WorldScene)
  // weapon stats and character stats (GameMenu)
  [/^hit (\d+) · ([\d.]+)\/s · (\d+) dmg\/s · reach (\d+) · (wide|narrow|normal) arc · (heavy|medium|light) knockback$/, (m, h, r, d, re, a, k) => `golpe ${h} · ${r}/s · ${d} daño/s · alcance ${re} · arco ${{ wide: 'amplio', narrow: 'estrecho', normal: 'normal' }[a]} · empuje ${{ heavy: 'fuerte', medium: 'medio', light: 'leve' }[k]}`],
  [/^(dmg (\d+)|(\d+)×(\d+)) · ([\d.]+) shots\/s · clip (\d+) · reload ([\d.]+)s$/, (m, a, d1, d2, n, r, c, rl) => `${d1 ? `daño ${d1}` : `${d2}×${n}`} · ${r} disparos/s · cargador ${c} · recarga ${rl}s`],
  [/^HP (\d+) {3}Armor (\d+) pts \((\d+)%\)$/, 'Vida $1   Armadura $2 pts ($3%)'],
  [/^Melee ([+-]?\d+) {3}Ranged (\S+) {3}Speed (\S+)$/, 'Cuerpo $1   Distancia $2   Velocidad $3'],
  [/^HP (\d+) {3}damage (\d+) {3}speed (\d+)$/, 'Vida $1   daño $2   velocidad $3'],
  [/^Armor · (.+)$/, 'Armadura · $1'], [/^Gear · (.+)$/, 'Equipo · $1'],
  [/^save found: act (\d+) · world "(.+)" · click a roommate to continue$/, 'partida encontrada: acto $1 · mundo "$2" · elige un compañero para continuar'],
  [/^\[ START ACT (\d+): (\d+) players?( \+ (\d) AI)? \]$/, (m, a, n, x, ai) => `[ EMPEZAR ACTO ${a}: ${n} jugador${n > 1 ? 'es' : ''}${ai ? ` + ${ai} IA` : ''} ]`],
  [/^→ (.+)$/s, (m, a) => `→ ${ES_ALL[a] ?? a}`],
  [/^\[E\] Talk to (.+)$/, '[E] Hablar con $1'],
  [/^\[E\] (.+?)( \((?:open|close)\))?$/, (m, a, oc) => `[E] ${ES_ALL[a] ?? a}${oc === ' (open)' ? ' (abrir)' : oc === ' (close)' ? ' (cerrar)' : ''}`],
  [/^Talk to (.+)$/, 'Hablar con $1'],
  [/^(.+) \(too far\)$/, '$1 (muy lejos)'],
  [/^ROOM CODE: (\S+) {3}\(others: Join and type it\)$/, 'CÓDIGO DE SALA: $1   (los demás: Unirse y escribirlo)'],
  [/^Joining (.+)\.\.\.$/, 'Uniéndose a $1...'],
  [/^Connection lost {2}· {2}\[ REJOIN ROOM (\S+) \]$/, 'Se perdió la conexión  ·  [ VOLVER A LA SALA $1 ]'],
  [/^(\S+) IS CHOOSING…$/, '$1 ESTÁ ELIGIENDO…'],
  [/^(\S+) decides$/, 'decide $1'],
  [/^Watching (\S+) {2}· {2}\[X\] skip$/, 'Mirando a $1  ·  [X] saltar'],
  [/^(\S+) is talking(?: to (.+?))? {2}· {2}\[T\] watch$/, (m, a, b) => `${a} está hablando${b ? ` con ${b}` : ''}  ·  [T] mirar`],
  [/^CODE ROT (\d+)%$/, 'PODREDUMBRE $1%'],
  [/^New in the field guide: (.+) \[ESC → GUIDE\]$/, 'Nuevo en la guía: $1 [ESC → GUÍA]'],
  [/^› Language: .+$/, '› Idioma: Español'],
  [/^(\d+):(\d\d) am$/, (m, h, mm) => `${h}:${mm} a. m.`],
  [/^Sent \$(\d+) to (\w+)$/, (m, n, who) => `Enviaste $${n} a ${who}`],
  [/^› (Music|Effects|Voices): (\d+)%$/, (m, k, v) => `› ${{ Music: 'Música', Effects: 'Efectos', Voices: 'Voces' }[k]}: ${v}%`],
  [/^› Screen shake: (on|off)$/, (m, v) => `› Sacudida de pantalla: ${v === 'on' ? 'sí' : 'no'}`],
  [/^› Text speed: (\w+)$/, (m, v) => `› Velocidad del texto: ${{ slow: 'lenta', normal: 'normal', fast: 'rápida', instant: 'instantánea' }[v] ?? v}`],
  [/^(.+)  \(side\)$/, (m, a) => `${ES_ALL[a] ?? a}  (secundaria)`],
  [/^(.+)  \(yours\)$/, (m, a) => `${ES_ALL[a] ?? a}  (tuya)`],
  [/^World "(.+)" · saved in this browser$/, 'Mundo "$1" · guardado en este navegador'],
];

// Items: English name and text (from items.js) -> Spanish (es-items.js, keyed by id).
const ES_ITEM_STRINGS = {};
for (const [id, def] of Object.entries(ITEMS)) {
  const es = ES_ITEMS[id.replace(/^item\./, '')]; if (!es) continue;
  if (def.name) ES_ITEM_STRINGS[def.name] = es[0];
  if (def.text) ES_ITEM_STRINGS[def.text] = es[1];
}
// No prototype: words like "constructor" or "toString" must not count as translations.
const ES_ALL = Object.assign(Object.create(null), ES, ES_QUESTS, ES_ITEM_STRINGS, ES_631, ES_TUNNELS_LAKE, ES_PLAZA, ES_ASTER, ES_HUD, ES_ROUTE1);
function trOne(s) {
  if (ES_ALL[s] !== undefined) return ES_ALL[s];
  for (const [rx, rep] of ES_RX) if (rx.test(s)) return s.replace(rx, rep);
  return null;
}
// The stretch-tier areas (stretch.js, hub #30) join the table here, on their own line, after the tables above.
Object.assign(ES_ALL, ES_STRETCH);
export function tr(s) { return trFor(s, lang); }
export function trFor(s, language) {
  if (language !== 'es' || typeof s !== 'string' || !s) return s;
  const whole = trOne(s); if (whole !== null) return whole;
  // Multi-line text (a name line over a pitch, an objective over its reason): translate line by line.
  if (s.includes('\n')) { const parts = s.split('\n'); const out = parts.map((l) => trOne(l) ?? l); if (out.some((l, i) => l !== parts[i])) return out.join('\n'); }
  return s;
}
// The Act 2 areas (act2_regions.js, act2_more.js; hub #30) join the table last, after ES_STRETCH, on a line of their
// own so other tables can be added to the ES_ALL list above without touching this one. tools/i18n/es_audit.mjs joins
// them in the same order.
Object.assign(ES_ALL, ES_ACT2);
Object.assign(ES_ALL, ES_ACT3);   // the Act 3 areas (act3_regions.js, act3_more.js; hub #30), the same way

// A small "EN · ES" switch for the title and lobby screens. onChange runs after the language flips.
export function langToggle(scene, x, y, onChange) {
  const t = scene.add.text(x, y, '', { fontFamily: 'monospace', fontSize: '8px', color: '#9aa3c7', backgroundColor: 'rgba(11,13,22,0.6)', padding: { x: 3, y: 1 } })
    .setOrigin(1, 0).setScrollFactor(0).setDepth(9999).setInteractive({ useHandCursor: true });
  const draw = () => t.setText(lang === 'es' ? 'EN · [ES]' : '[EN] · ES');
  t.on('pointerdown', () => { setLang(lang === 'es' ? 'en' : 'es'); draw(); onChange?.(); });
  draw();
  return t;
}
