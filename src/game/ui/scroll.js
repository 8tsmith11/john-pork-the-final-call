// Shared scrolling for every long list in the menus (fab, shops, armorer, quests, phone, travel).
// A list keeps { top, sel } across refreshes under its own key, draws only the rows in view, and
// shows a scrollbar when it overflows. Input (wheel, W/S/arrows, gamepad) goes to the list the
// menu drew last; GameMenu wires it up.
//
//   const L = scroller.list('fab', { n: 20, per: 2, cols: 3 });   // per = rows that fit
//   for (let i = L.first; i < L.last; i++) drawRow(i, i === L.sel);
//   scroller.bar(g, x, y, h, L);
//
// Lists with rows of uneven height (quests, texts) pass `select: false` and `per: 0`, draw from
// L.top until they run out of room, then call `L.fit(shown, reachedEnd)`.

export class Scroller {
  constructor() { this.lists = {}; this.active = null; }

  list(key, { n, per, cols = 1, select = true, onPick = null }) {
    const L = this.lists[key] ??= { key, top: 0, sel: 0 };
    Object.assign(L, { n, cols, select, onPick, rows: Math.ceil(n / cols), atEnd: false });
    L.per = per || L.per || 1;
    L.sel = Math.max(0, Math.min(L.sel, n - 1));
    if (select) this._show(L);
    L.top = Math.max(0, Math.min(L.top, Math.max(0, L.rows - (per ? L.per : 1))));
    L.first = L.top * cols; L.last = Math.min(n, (L.top + L.per) * cols);
    L.fit = (shown, reachedEnd) => { L.per = Math.max(1, shown); L.atEnd = reachedEnd; L.last = Math.min(n, L.top + shown); };
    L.fixed = !!per;
    this.active = L;
    return L;
  }

  reset(key) { delete this.lists[key]; }
  clear() { this.active = null; }

  // keep the selected row inside the window
  _show(L) {
    const r = Math.floor(L.sel / L.cols);
    if (r < L.top) L.top = r;
    if (r >= L.top + L.per) L.top = r - L.per + 1;
  }

  // W/S, arrows, d-pad: move the selection (or the window, for lists without one). Returns true if it moved.
  move(dy, dx = 0) {
    const L = this.active; if (!L || !L.n) return false;
    if (!L.select) return this.scroll(dy);
    const was = L.sel;
    if (dx) L.sel = Math.max(0, Math.min(L.n - 1, L.sel + dx));
    if (dy) { const to = L.sel + dy * L.cols; if (to >= 0 && to < L.n) L.sel = to; else if (dy > 0 && Math.floor(L.sel / L.cols) < L.rows - 1) L.sel = L.n - 1; }
    this._show(L);
    return L.sel !== was;
  }

  // mouse wheel: move the window; a selection outside it is pulled back in
  scroll(dy) {
    const L = this.active; if (!L || !L.n) return false;
    const was = L.top, max = L.fixed ? Math.max(0, L.rows - L.per) : (L.atEnd && dy > 0 ? L.top : L.rows - 1);
    L.top = Math.max(0, Math.min(max, L.top + dy));
    if (L.select) {
      const r = Math.floor(L.sel / L.cols), c = L.sel % L.cols;
      if (r < L.top) L.sel = L.top * L.cols + c;
      if (r >= L.top + L.per) L.sel = Math.min(L.n - 1, (L.top + L.per - 1) * L.cols + c);
    }
    return L.top !== was;
  }

  pick() { const L = this.active; if (L?.select && L.onPick && L.n) { L.onPick(L.sel); return true; } return false; }

  // thin track + thumb at x (only when the list overflows), with ▲/▼ hints
  bar(g, x, y, h, L, add) {
    const over = L.top > 0 || L.last < L.n;
    if (!over) return;
    const rows = L.rows, per = Math.min(L.per, rows);
    const th = Math.max(8, Math.round(h * per / rows)), ty = y + Math.round((h - th) * (L.top / Math.max(1, rows - per)));
    g.fillStyle(0x1a1d30, 1).fillRect(x, y, 3, h);
    g.fillStyle(0xffb347, 0.9).fillRect(x, Math.min(y + h - th, ty), 3, th);
    if (add) {
      if (L.top > 0) add(x + 1.5, y - 1, '▲').setOrigin(0.5, 1);
      if (L.last < L.n) add(x + 1.5, y + h + 1, '▼').setOrigin(0.5, 0);
    }
  }
}
