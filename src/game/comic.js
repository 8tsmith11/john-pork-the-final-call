// Comic pages (Michael, D-018): flashbacks and events the roommates don't witness play as comic-book
// pages; events they do witness are in-engine cutscenes (src/game/stage.js). A comic is data: pages
// of inked panels with art, captions and balloons, every line in English and Spanish. It plays as its
// own scene mode over the world: input is frozen while a page is up and solo pauses the world, the
// way story scenes do.
//
//   scene.comic.play('demo')                   // comics live in src/content/comics/<id>.js
//   scene.comic.play('demo', { tag: 'x' })     // only the pages tagged 'x'
//   ?comic=demo   ?comic=demo:x                 // debug: play one when the world loads
//   src/content/comics/index.js                 // triggers: play one once when a story flag is set
// Art direction and the data format: docs/art/comic-pages.md. Drawing: src/game/render/comicPage.js.
//
// Sync (host-authoritative, like stage.js): the host (or the solo player) owns the current page and
// tells everyone; guests mirror it. Anyone can turn a page. A guest's turn is a request naming the
// page they were looking at, and the host accepts the first request for that page once it has been up
// for a beat, so two people pressing at once turn one page, and everyone moves together. Esc: the host
// ends it for everyone; a guest closes it on their own screen only (D-014). The host repeats the
// current page every second, so a late joiner or a dropped message catches up.
//
// Wire format, all { t: 'comic', ... }:
//   host -> all     { op: 'show', id, run, page, tag }   the current page (a new run opens it)
//                   { op: 'end', run }
//   guest -> host   { op: 'turn', run, from, dir }       dir 1 next, -1 back; from = the page they saw
//                   { op: 'ask', id, tag }               a guest wants one played; the host starts it
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

/** The pages to play: all of them, or only those tagged `tag`. */
export function pagesFor(comic, tag) {
  const pages = comic?.pages ?? [];
  return tag ? pages.filter((p) => p.tag === tag) : pages;
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
    this.cur = null;        // the comic on this screen: { id, tag, comic, pages, page, run, at, onDone }
    this.pending = null;    // guest: a run the host started, loading
    this.closedRun = null;  // guest: the run this player closed with Esc
    this.queued = null;     // host: a play waiting for a story scene or cutscene to finish
    this.lastBeat = 0;
    scene.time?.addEvent?.({ delay: TICK_MS, loop: true, callback: () => this.tick() });
    scene.events?.once?.('shutdown', () => { this._gone = true; this.cur = null; this.pending = null; this.view.destroy?.(); });
    const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('comic') : null;
    if (q) { const [id, tag] = q.split(':'); scene.time?.delayedCall?.(900, () => this.play(id, { tag })); }   // debug: ?comic=<id>[:<tag>]
  }

  /** True while a comic page is up on this screen (WorldScene freezes input; solo pauses the world). */
  get active() { return !!this.cur; }
  get host() { return this.s.mode !== 'client'; }
  _now() { return this.s.time?.now ?? 0; }
  _busy() { const s = this.s; return !!((s.dlg && !s.dlgFree) || s.stage?.active || s._transitioning); }

  /** Play a comic. Host or solo: runs it for everyone (waits for a story scene or cutscene to end).
   *  Guest: asks the host. Resolves true once it's up. */
  async play(id, { tag = null, onDone = null } = {}) {
    if (typeof id !== 'string' || !ID_RX.test(id) || (tag != null && !ID_RX.test(tag))) { onDone?.(); return false; }
    if (!this.host) { this.s.net?.send({ t: 'comic', op: 'ask', id, tag }); onDone?.(); return false; }
    if (this.cur || this._gone) { onDone?.(); return false; }
    if (this._busy()) { this.queued = { id, tag, onDone }; return false; }
    const comic = await this.load(id);
    const pages = pagesFor(comic, tag);
    if (!pages.length || this.cur || this._gone) { onDone?.(); return false; }
    this.cur = { id, tag, comic, pages, page: 0, run: newRun(), at: this._now(), onDone };
    this._show();
    this.view.open(comic, pages, 0, { host: true, skippable: comic.skippable !== false });
    return true;
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
      if (this.host) { if (c.comic.skippable === false) return false; this.end(); return true; }
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
    if (c && this.s.mode === 'host') this.s.net.broadcast({ t: 'comic', op: 'show', id: c.id, run: c.run, page: c.page, tag: c.tag });
  }

  /** Every quarter second: host heartbeat, a queued play, and flag triggers. */
  tick() {
    if (this._gone || !this.host) return;
    if (this.cur) { if (this._now() - this.lastBeat >= BEAT_MS) this._show(); return; }
    if (this._busy()) return;
    if (this.queued) { const q = this.queued; this.queued = null; this.play(q.id, { tag: q.tag, onDone: q.onDone }); return; }
    this._checkTriggers();
  }

  _checkTriggers() {
    const f = this.s.save?.flags;
    if (!f || this._starting) return;
    for (const t of COMIC_TRIGGERS) {
      const played = `comic.${t.id}${t.tag ? `.${t.tag}` : ''}.played`;
      if (f[played] || !f[t.flag] || (t.map && t.map !== this.s.map?.id)) continue;
      this._starting = true;
      this.play(t.id, { tag: t.tag ?? null }).then((ok) => { if (ok) f[played] = true; }).finally(() => { this._starting = false; });
      return;
    }
  }

  onHostMsg(peer, msg) {
    if (msg?.t !== 'comic') return false;
    if (msg.op === 'turn' && this.cur && msg.run === this.cur.run && Number.isInteger(msg.from)) this._turn(msg.dir, msg.from);
    if (msg.op === 'ask' && typeof msg.id === 'string' && ID_RX.test(msg.id)) this.play(msg.id, { tag: typeof msg.tag === 'string' && ID_RX.test(msg.tag) ? msg.tag : null });
    return true;
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
      const pending = this.pending = { id: msg.id, run: msg.run, tag: typeof msg.tag === 'string' ? msg.tag : null, page: msg.page };
      this.load(msg.id).then((comic) => {
        if (this.pending !== pending || this._gone) return;
        this.pending = null;
        const pages = pagesFor(comic, pending.tag);
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
