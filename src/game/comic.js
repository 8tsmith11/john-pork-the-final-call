// Comic pages (Michael, D-018): flashbacks and events the roommates don't witness play as comic-book
// pages; events they do witness are in-engine cutscenes (src/game/stage.js). A comic is data: pages
// of inked panels with art, captions and balloons, every line in English and Spanish. It plays as its
// own scene mode over the world: input is frozen while a page is up and solo pauses the world, the
// way story scenes do.
//
//   scene.comic.play('demo')                   // comics live in src/content/comics/<id>.js
//   scene.comic.play('demo', { tag: 'x' })     // only the pages tagged 'x' (one piece)
//   scene.comic.play(id, { assembled: true })  // a comic in pieces, played whole
//   ?comic=demo   ?comic=demo:x                 // debug (host or solo): play one when the world loads
//   src/content/comics/index.js                 // triggers: play one once when a story flag is set
// Every play on the host records comic.<id>[.<tag>].played in the save.
// Art direction and the data format: docs/art/comic-pages.md. Drawing: src/game/render/comicPage.js.
//
// Comics in pieces (`pieces` on the comic): each tag plays on its own, once the story flag named for
// it is set, and the whole comic plays only with { assembled: true } (and once `assembled.needs` is
// set). `assembled.firstSkippable: false` keeps the host from skipping the first whole playback;
// guests can always close their own screen. A line can show in one playback only (`only: 'assembled'`
// or 'piece'), or wait for a story flag (`needs`), showing its `else` text, or nothing, until then.
//
// Sync (host-authoritative, like stage.js): the host (or the solo player) owns the current page and
// tells everyone; guests mirror it. Anyone can turn a page. A guest's turn is a request naming the
// page they were looking at, and the host accepts the first request for that page once it has been up
// for a beat, so two people pressing at once turn one page, and everyone moves together. Esc: the host
// ends it for everyone; a guest closes it on their own screen only (D-014). The host repeats the
// current page every second, so a late joiner or a dropped message catches up.
//
// Wire format, all { t: 'comic', ... }:
//   host -> all     { op: 'show', id, run, page, tag, open? }   the current page (a new run opens it);
//                                                       open: which of the comic's `needs` flags are
//                                                       set, as indexes into gatesOf(comic)
//                   { op: 'end', run }
//   guest -> host   { op: 'turn', run, from, dir }       dir 1 next, -1 back; from = the page they saw
//                   { op: 'ask', id, tag }               a guest wants one played. The host plays it for
//                                                       everyone only if this save has played it before
//                                                       or its trigger flag is set; otherwise it's ignored
// Write story comics as sealed or generic content: no spoilers in ids, tags, comments or plain text.
import { LAYOUTS, PAGE, panelRects, TEXT_KINDS, CAPTION_STYLES, BALLOON_STYLES, ART_KEYS, BACKGROUNDS, PAPER, actionForKey } from './render/comicLayout.js';
import { makeComicView } from './render/comicPage.js';
import { COMIC_TRIGGERS } from '../content/comics/index.js';

export { actionForKey };

export const DWELL_MS = 400;     // a page is up at least this long before a turn is accepted
export const BEAT_MS = 1000;     // host heartbeat while a comic is up
const TICK_MS = 250;
const ID_RX = /^[a-z0-9_]+$/;

export const rot13 = (s) => s.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= 'Z' ? 65 : 97) + 13) % 26) + (c <= 'Z' ? 65 : 97)));
/** A comic module's default export: the data itself, or a ROT13 JSON string for sealed comics. */
export const decodeComic = (raw) => (typeof raw === 'string' ? JSON.parse(rot13(raw)) : raw);

const cache = new Map();
export async function loadComic(id) {
  if (typeof id !== 'string' || !ID_RX.test(id)) return null;
  if (cache.has(id)) return cache.get(id);
  try {
    const mod = await import(`../content/comics/${id}.js`);
    const comic = decodeComic(mod.default);
    cache.set(id, comic);
    return comic;
  } catch {
    console.info(`[comic] none named ${id}`);
    return null;
  }
}

/** The save flag that records a play: comic.<id>[.<tag>].played. */
export const playedKey = (id, tag = null) => `comic.${id}${tag ? `.${tag}` : ''}.played`;

const flagList = (needs) => [needs].flat().filter((f) => typeof f === 'string' && f);

/** Every story flag the comic's lines wait on (`needs`), in data order, each once. */
export function gatesOf(comic) {
  const out = [];
  for (const p of comic?.pages ?? []) for (const n of p.panels ?? []) for (const t of n.text ?? []) {
    for (const f of flagList(t.needs)) if (!out.includes(f)) out.push(f);
  }
  return out;
}

/** The pages to play: all of them (the comic whole), or only those tagged `tag` (one piece). Lines
 *  marked `only: 'assembled'` or `only: 'piece'` stay in that playback only, and a line that `needs`
 *  a story flag shows its `else` text (or nothing) unless one of its flags is in `open` (a Set). */
export function pagesFor(comic, tag, open = null) {
  const pages = comic?.pages ?? [];
  const picked = tag ? pages.filter((p) => p.tag === tag) : pages;
  const how = tag ? 'piece' : 'assembled';
  const shown = (t) => {
    if (t.only && t.only !== how) return null;
    if (t.needs == null || flagList(t.needs).some((f) => open?.has(f))) return t;
    return t.else ? { ...t, en: t.else.en, es: t.else.es } : null;
  };
  return picked.map((p) => {
    if (!p.panels?.some((n) => n.text?.some((t) => t.only || t.needs != null))) return p;
    return { ...p, panels: p.panels.map((n) => (n.text ? { ...n, text: n.text.map(shown).filter(Boolean) } : n)) };
  });
}

/** Problems with a comic's data (empty when it's fine). `frames` (optional): atlas key -> Map of
 *  frame name -> { w, h }, to check art names and that flipped art stays inside its panel. */
export function checkComic(comic, frames = null) {
  const bad = [];
  const txt = (where, o) => {
    if (!o || typeof o.en !== 'string' || !o.en.trim()) bad.push(`${where}: no English`);
    if (!o || typeof o.es !== 'string' || !o.es.trim()) bad.push(`${where}: no Spanish`);
  };
  if (!comic || !ID_RX.test(comic.id ?? '')) bad.push('comic: id must be lower_snake_case');
  if (comic?.paper && !PAPER[comic.paper]) bad.push(`comic: unknown paper ${comic.paper}`);
  if (comic?.pieces != null && comic.pieces !== true) {
    if (typeof comic.pieces !== 'object' || Array.isArray(comic.pieces)) bad.push('comic: pieces must be true or { tag: flag }');
    else for (const [tag, flag] of Object.entries(comic.pieces)) {
      if (!(comic.pages ?? []).some((p) => p.tag === tag)) bad.push(`comic: pieces names ${tag}, which no page has`);
      if (typeof flag !== 'string' || !flag) bad.push(`comic: pieces.${tag} must name a story flag`);
    }
  }
  if (comic?.assembled != null) {
    const a = comic.assembled;
    if (typeof a !== 'object' || Array.isArray(a)) bad.push('comic: assembled must be { needs, firstSkippable }');
    else {
      if (a.needs != null && (typeof a.needs !== 'string' || !a.needs)) bad.push('comic: assembled.needs must name a story flag');
      if (a.firstSkippable != null && typeof a.firstSkippable !== 'boolean') bad.push('comic: assembled.firstSkippable must be true or false');
    }
  }
  if (!Array.isArray(comic?.pages) || !comic.pages.length) { bad.push('comic: no pages'); return bad; }
  comic.pages.forEach((page, pi) => {
    const at = `page ${pi + 1}`;
    if (page.layout && !LAYOUTS[page.layout]) bad.push(`${at}: unknown layout ${page.layout}`);
    if (page.tag != null && (typeof page.tag !== 'string' || !ID_RX.test(page.tag))) bad.push(`${at}: tag must be lower_snake_case`);
    if (!Array.isArray(page.panels) || !page.panels.length) { bad.push(`${at}: no panels`); return; }
    const rects = panelRects(page);
    page.panels.forEach((panel, ni) => {
      const pat = `${at} panel ${ni + 1}`, r = rects[ni];
      if (!r) { bad.push(`${pat}: no rect and no layout cell`); return; }
      const [x, y, w, h] = r;
      if (![x, y, w, h].every(Number.isInteger) || w < 16 || h < 16 || x < 0 || y < 0 || x + w > PAGE.w || y + h > PAGE.h) bad.push(`${pat}: rect ${r} is outside the live area`);
      if (panel.bg && !BACKGROUNDS[panel.bg]) bad.push(`${pat}: unknown background ${panel.bg}`);
      for (const [ai, a] of (panel.art ?? []).entries()) {
        const aat = `${pat} art ${ai + 1}`, key = a.key ?? 'comic';
        if (!ART_KEYS.has(key)) bad.push(`${aat}: unknown atlas ${key}`);
        if (typeof a.frame !== 'string') bad.push(`${aat}: no frame`);
        const scale = a.scale ?? 1;
        if (!Number.isInteger(scale) || scale < 1 || scale > 4) bad.push(`${aat}: scale must be a whole number 1-4`);
        if (!Number.isInteger(a.x ?? 0) || !Number.isInteger(a.y ?? 0)) bad.push(`${aat}: position must be whole pixels`);
        const known = frames?.[key];
        if (known) {
          for (const f of [a.frame, ...(a.anim ?? [])]) if (!known.has(f)) bad.push(`${aat}: ${key} has no frame ${f}`);
          const size = known.get(a.frame);
          if (size && a.flip && ((a.x ?? 0) < 0 || (a.y ?? 0) < 0 || (a.x ?? 0) + size.w * scale > w || (a.y ?? 0) + size.h * scale > h)) bad.push(`${aat}: flipped art must sit inside its panel`);
        }
      }
      for (const [ti, t] of (panel.text ?? []).entries()) {
        const tat = `${pat} text ${ti + 1}`;
        if (!TEXT_KINDS.has(t.kind)) { bad.push(`${tat}: unknown kind ${t.kind}`); continue; }
        txt(tat, t);
        if (t.kind === 'caption' && t.style && !CAPTION_STYLES.has(t.style)) bad.push(`${tat}: unknown caption style ${t.style}`);
        if (t.kind === 'balloon' && t.style && !BALLOON_STYLES.has(t.style)) bad.push(`${tat}: unknown balloon style ${t.style}`);
        if (t.kind === 'balloon' && t.tail && !(Array.isArray(t.tail) && t.tail.length === 2)) bad.push(`${tat}: tail must be [x, y]`);
        if (t.only != null && t.only !== 'assembled' && t.only !== 'piece') bad.push(`${tat}: only must be 'assembled' or 'piece'`);
        if (t.needs != null && (!flagList(t.needs).length || flagList(t.needs).length !== [t.needs].flat().length)) bad.push(`${tat}: needs must name a story flag, or a list of them`);
        if (t.else != null) { if (t.needs == null) bad.push(`${tat}: else without needs`); txt(`${tat} else`, t.else); }
      }
    });
  });
  return bad;
}

let runSeq = 0;
const newRun = () => `${Date.now().toString(36)}${(++runSeq).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;

export class Comic {
  /** view: the drawing side (src/game/render/comicPage.js); tests pass a stand-in. */
  constructor(scene, view = null) {
    this.s = scene;
    this.view = view ?? makeComicView(scene, (action) => this.input(action));
    this.load = loadComic;
    this.cur = null;        // the comic on this screen: { id, tag, comic, pages, page, run, at, onDone, skippable, open }
    this.pending = null;    // guest: a run the host started, loading
    this.closedRun = null;  // guest: the run this player closed with Esc
    this.queued = null;     // host: a play waiting for a story scene or cutscene to finish
    this.lastBeat = 0;
    scene.time?.addEvent?.({ delay: TICK_MS, loop: true, callback: () => this.tick() });
    scene.events?.once?.('shutdown', () => { this._gone = true; this.cur = null; this.pending = null; this.view.destroy?.(); });
    const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('comic') : null;
    // debug: ?comic=<id>[:<tag>]. On the host (or solo) it plays as is; in a guest's browser it's an ask like any other.
    if (q) { const [id, tag] = q.split(':'); scene.time?.delayedCall?.(900, () => this.play(id, { tag: tag || null, debug: true })); }
  }

  /** True while a comic page is up on this screen (WorldScene freezes input; solo pauses the world). */
  get active() { return !!this.cur; }
  get host() { return this.s.mode !== 'client'; }
  _now() { return this.s.time?.now ?? 0; }
  _busy() { const s = this.s; return !!((s.dlg && !s.dlgFree) || s.stage?.active || s._transitioning); }

  /** Play a comic. Host or solo: runs it for everyone (waits for a story scene or cutscene to end)
   *  and records it in the save. Guest: asks the host. Resolves true once it's up.
   *  tag: one piece. assembled: a comic in pieces, played whole. debug: the ?comic= param, which
   *  skips the story flags a comic in pieces waits on and records nothing. */
  async play(id, { tag = null, assembled = false, onDone = null, debug = false } = {}) {
    if (typeof id !== 'string' || !ID_RX.test(id) || (tag != null && (typeof tag !== 'string' || !ID_RX.test(tag)))) { onDone?.(); return false; }
    if (!this.host) { this.s.net?.send({ t: 'comic', op: 'ask', id, tag }); onDone?.(); return false; }
    if (this.cur || this._gone) { onDone?.(); return false; }
    if (this._busy()) { this.queued = { id, tag, assembled, onDone, debug }; return false; }
    const comic = await this.load(id);
    const flags = this.s.save?.flags ?? {};
    if (comic && !debug && !this._earned(comic, tag, assembled, flags)) { onDone?.(); return false; }
    const gates = gatesOf(comic), open = gates.flatMap((f, i) => (flags[f] ? [i] : []));
    const pages = pagesFor(comic, tag, new Set(open.map((i) => gates[i])));
    if (!pages.length || this.cur || this._gone) { onDone?.(); return false; }
    const key = playedKey(id, tag);
    const locked = !tag && !debug && !flags[key] && comic.assembled?.firstSkippable === false;   // the first whole playback
    const skippable = comic.skippable !== false && !locked;
    if (!debug) flags[key] = true;
    this.cur = { id, tag, comic, pages, page: 0, run: newRun(), at: this._now(), onDone, skippable, open };
    this._show();
    this.view.open(comic, pages, 0, { host: true, skippable });
    return true;
  }

  /** Host: may this play now? A comic in pieces plays a piece once the story flag named for it is
   *  set, and the whole comic only as assembled (once assembled.needs is set). */
  _earned(comic, tag, assembled, flags) {
    if (!comic.pieces) return true;
    if (!tag) {
      if (assembled && (!comic.assembled?.needs || flags[comic.assembled.needs])) return true;
      console.info(`[comic] ${comic.id} is in pieces: it plays whole only assembled`);
      return false;
    }
    const need = typeof comic.pieces === 'object' ? comic.pieces[tag] : null;
    if (!need || flags[need]) return true;
    console.info(`[comic] ${comic.id}:${tag} waits on its story flag`);
    return false;
  }

  /** The local reader pressed something: 'next', 'back' or 'skip'. */
  input(action) {
    const c = this.cur;
    if (!c) return false;
    if (action === 'next' || action === 'back') {
      const dir = action === 'next' ? 1 : -1;
      if (this.host) return this._turn(dir, c.page);
      this.s.net?.send({ t: 'comic', op: 'turn', run: c.run, from: c.page, dir });
      return true;
    }
    if (action === 'skip') {
      if (this.host) { if (c.skippable === false) return false; this.end(); return true; }
      this.closedRun = c.run; this.cur = null; this.view.close();   // a guest leaves on their own screen
      return true;
    }
    return false;
  }

  /** Host: accept a turn from the page `from`. One turn per page, once it has been up for a beat. */
  _turn(dir, from) {
    const c = this.cur;
    if (!c || !this.host || from !== c.page || (dir !== 1 && dir !== -1)) return false;
    if (this._now() - c.at < DWELL_MS) return false;
    const next = c.page + dir;
    if (next < 0) return false;
    if (next >= c.pages.length) { this.end(); return true; }
    c.page = next; c.at = this._now();
    this._show();
    this.view.turnTo(next, dir);
    return true;
  }

  /** Host: close it for everyone. */
  end() {
    const c = this.cur;
    if (!c) return;
    if (this.host && this.s.mode === 'host') this.s.net.broadcast({ t: 'comic', op: 'end', run: c.run });
    this.cur = null;
    this.view.close();
    c.onDone?.();
  }

  _show() {
    const c = this.cur;
    this.lastBeat = this._now();
    if (c && this.s.mode === 'host') this.s.net.broadcast({ t: 'comic', op: 'show', id: c.id, run: c.run, page: c.page, tag: c.tag, ...(c.open?.length ? { open: c.open } : {}) });
  }

  /** Every quarter second: host heartbeat, a queued play, and flag triggers. */
  tick() {
    if (this._gone || !this.host) return;
    if (this.cur) { if (this._now() - this.lastBeat >= BEAT_MS) this._show(); return; }
    if (this._busy()) return;
    if (this.queued) { const q = this.queued; this.queued = null; this.play(q.id, q); return; }
    this._checkTriggers();
  }

  _checkTriggers() {
    const f = this.s.save?.flags;
    if (!f || this._starting) return;
    for (const t of COMIC_TRIGGERS) {
      if (f[playedKey(t.id, t.tag ?? null)] || !f[t.flag] || (t.map && t.map !== this.s.map?.id)) continue;
      this._starting = true;
      this.play(t.id, { tag: t.tag ?? null }).finally(() => { this._starting = false; });   // play() records it
      return;
    }
  }

  onHostMsg(peer, msg) {
    if (msg?.t !== 'comic') return false;
    if (msg.op === 'turn' && this.cur && msg.run === this.cur.run && Number.isInteger(msg.from)) this._turn(msg.dir, msg.from);
    if (msg.op === 'ask') this._ask(msg);
    return true;
  }

  /** Host: a guest asked for a comic. It would play for everyone, so the host honours it only for a
   *  comic this save has already played, or one whose trigger flag is set; anything else (pages the
   *  party hasn't reached, a crafted message) is ignored. Returns true if it honours it. */
  _ask(msg) {
    const id = msg.id, tag = msg.tag ?? null;
    if (typeof id !== 'string' || !ID_RX.test(id) || (tag !== null && (typeof tag !== 'string' || !ID_RX.test(tag)))) return false;
    const f = this.s.save?.flags ?? {};
    if (f[playedKey(id, tag)]) { this.play(id, { tag, assembled: !tag }); return true; }
    if (COMIC_TRIGGERS.some((t) => t.id === id && (t.tag ?? null) === tag && f[t.flag])) { this.play(id, { tag }); return true; }
    return false;
  }

  onClientMsg(msg) {
    if (msg?.t !== 'comic') return false;
    if (msg.op === 'show' && typeof msg.run === 'string' && typeof msg.id === 'string' && ID_RX.test(msg.id) && Number.isInteger(msg.page) && msg.page >= 0) {
      if (msg.run === this.closedRun) return true;
      const c = this.cur;
      if (c && c.run === msg.run) {
        if (msg.page !== c.page && msg.page < c.pages.length) { const dir = Math.sign(msg.page - c.page); c.page = msg.page; this.view.turnTo(msg.page, dir); }
        return true;
      }
      if (this.pending?.run === msg.run) { this.pending.page = msg.page; return true; }
      const open = Array.isArray(msg.open) ? msg.open.filter(Number.isInteger) : [];
      const pending = this.pending = { id: msg.id, run: msg.run, tag: typeof msg.tag === 'string' ? msg.tag : null, page: msg.page, open };
      this.load(msg.id).then((comic) => {
        if (this.pending !== pending || this._gone) return;
        this.pending = null;
        const gates = gatesOf(comic);
        const pages = pagesFor(comic, pending.tag, new Set(pending.open.map((i) => gates[i]).filter(Boolean)));
        if (!pages.length) return;
        const page = Math.min(pending.page, pages.length - 1);
        this.cur = { id: pending.id, tag: pending.tag, comic, pages, page, run: pending.run, at: this._now() };
        this.view.open(comic, pages, page, { host: false, skippable: true });
      });
      return true;
    }
    if (msg.op === 'end') {
      if (this.pending?.run === msg.run) this.pending = null;
      if (this.closedRun === msg.run) this.closedRun = null;
      if (this.cur?.run === msg.run) { this.cur = null; this.view.close(); }
    }
    return true;
  }
}
