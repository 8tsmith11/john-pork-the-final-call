// NPC approaches at runtime (content and rules: src/content/approaches.js, abilities.js).
// Talking to an NPC first asks HOW: Talk carries on exactly as before; the rest roll d20 + modifier
// on the host, which owns pockets, money and items, and sends the result back as a say box.
import { APPROACHES, ROLE_OF, DC, ALLOWED, POCKETS, LINES, GUARD_LINES, TELLS, WARY_MS } from '../content/approaches.js';
import { ABILITIES, check, modOf, scoresOf, fmtMod } from '../content/abilities.js';
import { ITEMS } from '../content/items.js';
import * as Inv from '../engine/inventory.js';
import { Rng, hashString } from '../engine/rng.js';
import { sfx } from '../audio/audio.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class Approach {
  constructor(scene) {
    this.s = scene;
    this.target = null;
    this.passThrough = null;
    this.wary = new Map();     // `${npcId}` -> time (host)
    this.adv = new Set();      // `${char}:${npcId}` with advantage on the next pickpocket (host)
    scene.input.keyboard.on('keydown', (ev) => {
      if (!scene.menu?.startsWith?.('approach:')) return;
      const n = parseInt(ev.key, 10), list = this.options(this.target);
      if (n >= 1 && n <= list.length) this.choose(list[n - 1].id);
    });
  }

  roleOf(o) { return o.role ?? ROLE_OF[o.id] ?? 'resident'; }
  options(o) {
    if (!o) return [];
    const allowed = ALLOWED[this.roleOf(o)];
    return APPROACHES.filter((a) => !allowed || allowed.includes(a.id));
  }

  /** Interaction hook: open the approach menu for an NPC. Returns true if it took over. */
  intercept(near) {
    if (!near?.npc || near.romance || near.armorer || near.approach === false) return false;
    if (this.passThrough === near.id) { this.passThrough = null; return false; }
    this.target = near;
    this.s.gameMenu.show(`approach:${near.id}`);
    return true;
  }

  choose(kind) {
    const s = this.s, o = this.target;
    if (!o) return;
    s._closeMenu();
    if (kind === 'talk') { this.passThrough = o.id; s._clickedObj = o; return; }
    if (s.mode === 'client') s.net.send({ t: 'approach', npc: o.id, kind });
    else this._say(s.localId, this.resolve(s.character, o, kind));
  }

  onHostMsg(peer, msg) {
    if (msg.t !== 'approach') return false;
    const o = this.s.map.objects.find((x) => x.id === msg.npc && x.npc);
    if (o) this._say(peer, this.resolve(this.s._charOf(peer), o, msg.kind));
    return true;
  }

  _say(playerId, text) {
    const s = this.s;
    if (playerId === s.localId) s._say(text); else s.net?.send?.(playerId, { t: 'say', text });
  }

  // Each person's pockets, rolled once per world.
  pockets(o) {
    const s = this.s, all = (s.save.world.npcPockets ??= {});
    if (!all[o.id]) {
      const P = POCKETS[o.pockets ?? this.roleOf(o)] ?? POCKETS.resident, rng = new Rng(hashString(`${s.save.world.seed}:${o.id}:pockets`));
      const total = P.table.reduce((t, e) => t + e[1], 0), got = [];
      for (let r = 0; r < P.rolls; r++) {
        let x = rng.next() * total;
        const e = P.table.find((t) => (x -= t[1]) < 0) ?? P.table[0];
        const qty = rng.int(e[2], e[3]), have = got.find((g) => g.id === e[0]);
        if (have) have.qty += qty; else got.push({ id: e[0], qty });
      }
      all[o.id] = got;
    }
    return all[o.id];
  }

  _take(who, o, n = 1) {
    const s = this.s, pk = this.pockets(o), c = s.save.party[who], out = [];
    for (let k = 0; k < n && pk.length; k++) {
      const i = Math.floor(Math.random() * pk.length), it = pk.splice(i, 1)[0];
      if (it.id === 'money') { s.save.world.money = (s.save.world.money ?? 0) + it.qty; out.push(`$${it.qty}`); }
      else { Inv.add(c, it.id, it.qty); out.push(`${ITEMS[it.id]?.name.toLowerCase() ?? it.id}${it.qty > 1 ? ` ×${it.qty}` : ''}`); }
    }
    if (out.length) { s._syncParty(); sfx('kill'); }
    return out.join(' and ');
  }

  /** Host: roll the approach and apply it. Returns what to show the player. */
  resolve(who, o, kind) {
    const s = this.s, now = s.time.now, role = this.roleOf(o), A = APPROACHES.find((a) => a.id === kind);
    if (!A || !this.options(o).some((a) => a.id === kind)) return '';
    const name = o.label?.replace(/\s*\(.*\)$/, '') ?? 'They';
    const fill = (t, extra = {}) => t.replace(/\{(\w+)\}/g, (_, k) => ({ name, ...extra })[k] ?? '');
    const lines = (outcome) => GUARD_LINES[kind]?.[outcome] && role === 'guard' ? GUARD_LINES[kind][outcome] : LINES[kind]?.[outcome] ?? LINES[kind]?.lose;
    if ((this.wary.get(o.id) ?? 0) > now) return fill(pick(LINES.wary));
    const c = s.save.party[who], dc = o.dc?.[kind] ?? DC[role]?.[kind] ?? 12;
    const advKey = `${who}:${o.id}`, adv = kind === 'pickpocket' && this.adv.has(advKey);
    const r = check(c, who, A.ability, dc, { adv });
    const head = `${A.name.toUpperCase()} (${ABILITIES[A.ability].short} ${fmtMod(r.mod)}) · d20 ${adv ? '(adv) ' : ''}${r.roll} ${fmtMod(r.mod)} = ${r.total} vs DC ${dc}${r.nat20 ? ' · CRITICAL' : r.nat1 ? ' · FUMBLE' : ''}\n\n`;
    const outcome = r.nat20 ? 'crit' : r.success ? 'win' : r.nat1 ? 'fumble' : 'lose';
    const fail = () => { this.wary.set(o.id, now + WARY_MS); return outcome; };

    if (kind === 'insight') {
      if (!r.success) { fail(); return head + fill(pick(lines(outcome === 'fumble' ? 'fumble' : 'lose'))); }
      const hiding = o.insight ? null : hashString(`${s.save.world.seed}:${o.id}:tell`) % 3 === 0;
      if (o.insight) return head + o.insight;
      return head + fill(pick(LINES.insight[hiding ? 'win_hiding' : 'win_true']), { thing: pick(TELLS[role] ?? TELLS.resident) });
    }
    if (kind === 'investigate') {
      if (!r.success) return head + fill(pick(lines(outcome === 'fumble' ? 'fumble' : 'lose')));
      this.adv.add(advKey);
      const pk = this.pockets(o);
      const list = pk.length ? pk.map((it) => it.id === 'money' ? `about $${it.qty}` : `${ITEMS[it.id]?.name.toLowerCase()}${it.qty > 1 ? ` ×${it.qty}` : ''}`).join(', ') : 'nothing worth taking';
      return head + fill(pick(LINES.investigate.win), { pockets: list }) + (pk.length ? '\n\n(Your next pickpocket on them has advantage.)' : '');
    }
    // charm, deceive, intimidate, pickpocket: something changes hands, or doesn't.
    if (!this.pockets(o).length) return fill(pick(LINES.empty));
    if (!r.success) {
      fail();
      let tail = '';
      if (role === 'guard' && (kind === 'pickpocket' || kind === 'deceive' || outcome === 'fumble')) { s.save.standing.continuity -= kind === 'pickpocket' ? 2 : 1; tail = '\n\n(Continuity standing down.)'; }
      if (kind === 'intimidate' && outcome === 'fumble') { const p = [...s.sim.players.values()].find((q) => q.character === who); if (p) s.sim._hurtPlayer(p, 6); }
      return head + fill(pick(lines(outcome))) + tail;
    }
    if (kind === 'pickpocket') this.adv.delete(advKey);
    const loot = this._take(who, o, outcome === 'crit' ? 2 : 1);
    let tail = '';
    if (kind === 'intimidate') { s.save.standing.callers -= 1; tail = '\n\n(The street remembers. Callers standing down.)'; }
    return head + fill(pick(lines(outcome)), { loot }) + (kind !== 'pickpocket' ? `\n\nYou get ${loot}.` : '') + tail;
  }

  /** Drawn by GameMenu for tab 'approach:<npc id>'. */
  draw(menu, g) {
    const s = this.s, b = menu.box, o = this.target, who = s.character, c = s.save.party[who];
    if (!o) return;
    const role = this.roleOf(o), sc = scoresOf(c, who);
    menu._t(b.x + 12, b.y + 8, (o.label ?? '').toUpperCase(), { fontFamily: 'monospace', fontSize: '10px', color: '#ffb347' });
    menu._t(b.x + b.w - 12, b.y + 8, '[1-7] choose  [ESC] back', { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7' }).setOrigin(1, 0);
    const wary = (this.wary.get(o.id) ?? 0) > s.time.now;
    menu._t(b.x + 12, b.y + 22, `How do you want to handle this?${wary ? '  (They\'re wary of you right now.)' : ''}`, { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7' });
    this.options(o).forEach((a, i) => {
      const y = b.y + 36 + i * 24, x = b.x + 12, m = a.ability ? modOf(sc[a.ability]) : null;
      g.fillStyle(0x1a2030).fillRoundedRect(x, y, b.w - 24, 20, 3).lineStyle(1, 0xffb347, 0.6).strokeRoundedRect(x, y, b.w - 24, 20, 3);
      menu._t(x + 8, y + 5, `${i + 1}. ${a.name}`, { fontFamily: 'monospace', fontSize: '9px', color: '#e8e8f0' }, () => this.choose(a.id));
      if (a.ability) menu._t(x + 120, y + 6, `${ABILITIES[a.ability].short} ${fmtMod(m)}  ·  ${{ charm: 'win them over', deceive: 'talk them into it', intimidate: 'lean on them', insight: 'are they lying?', investigate: 'look them over', pickpocket: 'lift something' }[a.id]}`, { fontFamily: 'monospace', fontSize: '7px', color: m > 0 ? '#7fb069' : m < 0 ? '#d65db1' : '#9aa3c7' });
      else menu._t(x + 120, y + 6, 'say hello, ask about things', { fontFamily: 'monospace', fontSize: '7px', color: '#9aa3c7' });
    });
    void role;
  }
}
