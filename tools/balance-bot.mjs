import { COMBAT, MOVE, LULLABY, FEEL, emptyInput } from '../src/engine/sim.js';

const THINK_TICKS = 6; // 100 ms decisions; held attacks continue between decisions.
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** A repeatable, knowledgeable scripted player, not a prediction of an average human. */
export class BalanceBot {
  constructor(sim, brain, { legacy = false } = {}) {
    this.sim = sim; this.brain = brain; this.legacy = legacy;
    this.nextThink = 0; this.last = emptyInput();
  }

  input(p) {
    if (this.legacy) return p.downed ? emptyInput() : this._legacy(p);
    if (p.downed || p.sleepT > 0 || p.waitExit) return emptyInput();
    if (this.sim.tick < this.nextThink) return { ...this.last, dodge: false };
    this.nextThink = this.sim.tick + THINK_TICKS;
    return this.last = this._think(p);
  }

  _memory(p) {
    let m = this.brain.mem.get(p.id);
    if (!m) {
      m = { path: null, goal: null, repath: 0, stuck: 0, lx: p.x, ly: p.y };
      this.brain.mem.set(p.id, m);
    }
    m.repath -= this.legacy ? 1 : THINK_TICKS;
    return m;
  }

  _roll(p, inp, dx, dy) {
    if (p.dodgeT > 0 || p.dodgeCd > 0 || (p.sta ?? 0) < MOVE.dashCost) return false;
    const length = Math.hypot(dx, dy) || 1;
    for (const [x, y] of [[dx / length, dy / length], [-dy / length, dx / length], [dy / length, -dx / length]]) {
      if (!this.brain._clear(p.x, p.y, p.x + x * 30, p.y + y * 30)) continue;
      Object.assign(inp, { mx: x, my: y, dodge: true, attack: false }); return true;
    }
    return false;
  }

  _think(p) {
    const sim = this.sim, inp = emptyInput(), m = this._memory(p);
    const foes = [...sim.enemies.values()].filter((e) => e.hp > 0).sort((a, b) => dist(a, p) - dist(b, p));
    // Hum is a visible/audible cue. Break exposure before another close-range attempt.
    const moth = foes.find((e) => sim._def(e).lullaby && !(e.sleepT > 0) && dist(e, p) <= LULLABY.mothRange);
    this.humSince = moth ? (this.humSince ?? sim.tick) : null;
    const foe = moth ?? foes[0];
    const swing = { ...COMBAT.melee, ...p.mods?.swing };
    const canSwing = !!p.mods?.swing && (p.held ?? 'melee') === 'melee';
    if (foe) {
      const d = dist(foe, p), a = Math.atan2(foe.y - p.y, foe.x - p.x), radius = sim._def(foe).radius;
      inp.aim = a;
      // Keep advancing while holding attack so knockback doesn't needlessly break the chain.
      if (d > Math.max(8, swing.range - 8)) this.brain._steer(p, m, foe.x, foe.y, inp);
      inp.attack = canSwing && d <= swing.range + radius - 1;
      const dashStrike = (sim.tick - (p.dodgeEndTick ?? -99)) / 60 <= FEEL.dashWindow;
      if (canSwing && dashStrike && d <= swing.range + FEEL.dashRange + radius - 1) inp.attack = true;
      // Wait for a telegraphed commitment, then swing during the lunge/charge to parry it.
      if (!foe.boss && !foe.sahur && foe.st === 'windup' && foe.stT <= 0.25 && !dashStrike) inp.attack = false;
    }

    // Predict the closest approach of a hostile projectile to the player's hitbox center.
    const threat = sim.shots.filter((s) => s.from === 'enemy').map((s) => {
      const dx = s.x - p.x, dy = s.y - (p.y - 6), vx = s.vx - (p.vx ?? 0), vy = s.vy - (p.vy ?? 0);
      const speed2 = vx * vx + vy * vy;
      const t = speed2 ? -(dx * vx + dy * vy) / speed2 : -1;
      return { s, dx, dy, t, miss: Math.hypot(dx + vx * t, dy + vy * t), distance: Math.hypot(dx, dy) };
    }).filter((s) => s.t >= 0 && s.t <= 0.24 && s.t <= s.s.life && s.miss < 9 - (p.mods?.small ?? 0))
      .sort((a, b) => a.t - b.t)[0];
    if (threat) {
      if (canSwing && threat.distance <= swing.range + 6 && p.meleeCd <= 0 && !(p.dodgeT > 0)) {
        inp.aim = Math.atan2(threat.dy, threat.dx); inp.attack = true; return inp;
      }
      if (threat.t <= 0.18 && this._roll(p, inp, -threat.s.vx, -threat.s.vy)) return inp;
    }
    if (moth && sim.tick - this.humSince >= 110) {
      inp.attack = false;
      const dx = p.x - moth.x, dy = p.y - moth.y, length = Math.hypot(dx, dy) || 1;
      if (!this._roll(p, inp, dx, dy)) Object.assign(inp, { mx: dx / length, my: dy / length });
      return inp;
    }
    if (foe) {
      const d = dist(foe, p), committed = !foe.boss && !foe.sahur && ['lunge', 'dash'].includes(foe.st) && !foe.hitOnce;
      if (canSwing && committed && d <= swing.range + sim._def(foe).radius && p.meleeCd <= 0 && !(p.dodgeT > 0)) {
        inp.attack = true; return inp;
      }
      if (committed && d < 38 && this._roll(p, inp, -(foe.dy ?? Math.sin(inp.aim)), foe.dx ?? Math.cos(inp.aim))) return inp;
      if (p.hp < 30 && d < 30) this._roll(p, inp, p.x - foe.x, p.y - foe.y);
    }
    return inp;
  }

  // The previous decision policy is retained for an apples-to-apples --legacy comparison.
  _legacy(p) {
    const inp = emptyInput(), m = this._memory(p);
    let foe = null, fd = 1e9;
    for (const e of this.sim.enemies.values()) { const d = dist(e, p); if (d < fd) { fd = d; foe = e; } }
    if (!foe) return inp;
    const a = Math.atan2(foe.y - p.y, foe.x - p.x); inp.aim = a;
    if (fd > 16) { inp.mx = Math.cos(a); inp.my = Math.sin(a); } else inp.attack = true;
    if (p.hp < 30 && fd < 30 && p.sta > 40) { inp.mx = -Math.cos(a); inp.my = -Math.sin(a); inp.dodge = true; }
    if (fd > 16 && !this.brain._clear(p.x, p.y, foe.x, foe.y)) {
      const tmp = emptyInput(); this.brain._steer(p, m, foe.x, foe.y, tmp); inp.mx = tmp.mx; inp.my = tmp.my;
    }
    return inp;
  }
}

export const newMoveCounts = () => ({ rolls: 0, perfect: 0, deflect: 0, parry: 0, finishers: 0, dashstrike: 0 });
export function countHostMoves(counts, events, id) {
  for (const e of events) {
    if (e.t === 'swing' && e.id === id && e.combo === 3) counts.finishers++;
    else if (['deflect', 'parry'].includes(e.t) && e.by === id) counts[e.t]++;
    else if (['perfect', 'dashstrike'].includes(e.t) && e.id === id) counts[e.t]++;
  }
}
