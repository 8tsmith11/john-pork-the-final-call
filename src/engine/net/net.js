// WebRTC networking via PeerJS (docs/tech/PLAN.md §2, D-006). Host-authoritative:
// clients send inputs, the host sends snapshots. The PeerJS broker is only used for the handshake;
// game traffic flows browser-to-browser on the LAN.
//
// Message shapes (all JSON):
//   client → host: {t:'hello', name, seatKey} {t:'claim', character} {t:'input', inp} {t:'flag', key}
//   host → client: {t:'lobby', state} {t:'start', save, assignments, seatKey} {t:'snap', snap} {t:'say', text}

const PREFIX = 'jpfc-room-';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const seatKeys = new Map();   // same-page rejoin also works when sessionStorage is unavailable
const seatStorageKey = (code) => `jpfc:seat:${code}`;

export function makeRoomCode() {
  let c = '';
  for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}

class Emitter {
  constructor() { this._h = {}; }
  on(t, fn) { (this._h[t] ||= []).push(fn); return this; }
  off(t, fn) { this._h[t] = (this._h[t] || []).filter((f) => f !== fn); return this; }
  emit(t, ...a) { (this._h[t] || []).forEach((fn) => fn(...a)); (this._h['*'] || []).forEach((fn) => fn(t, ...a)); }
}

export class HostNet extends Emitter {
  constructor() { super(); this.isHost = true; this.conns = new Map(); }

  open(code) {
    return new Promise((resolve, reject) => {
      this.code = code;
      this.peer = new Peer(PREFIX + code);
      this.peer.on('open', () => resolve(code));
      this.peer.on('error', (e) => { this.emit('error', e); reject(e); });
      this.peer.on('connection', (conn) => this._trackConnection(conn));
    });
  }

  _trackConnection(conn) {
    const peer = conn.peer;
    conn.on('open', () => {
      if (peer === 'host' || peer.startsWith('ai:') || this.conns.has(peer)) { conn.close(); return; }
      this.conns.set(peer, conn);
      this.emit('join', peer);
    });
    conn.on('data', (msg) => { if (this.conns.get(peer) === conn) this.emit('msg', peer, msg); });
    conn.on('close', () => {
      if (this.conns.get(peer) !== conn) return;
      this.conns.delete(peer);
      for (const seat of this.seats?.values() ?? []) if (seat.peer === peer) seat.peer = null;
      this.emit('leave', peer);
    });
  }

  startGame(save, assignments) {
    this.seats = new Map();
    for (const peer of this.conns.keys()) {
      const character = Object.hasOwn(assignments, peer) ? assignments[peer] : null;
      if (character) {
        const key = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
        this.seats.set(character, { peer, key });
        this.send(peer, { t: 'start', save, assignments, seatKey: key });
      } else this.rejectJoin(peer, 'The host started without you. Claim a roommate next time.');
    }
  }

  findVacantSeat(peer, key) {
    if (!this.conns.has(peer) || typeof key !== 'string' || !this.seats) return null;
    for (const seat of this.seats.values()) if (seat.peer === peer) return null;
    for (const [character, seat] of this.seats) if (seat.peer === null && seat.key === key) return character;
    return null;
  }

  occupySeat(character, peer) { this.seats.get(character).peer = peer; }

  rejectJoin(peer, text) { this.conns.get(peer)?.send({ t: 'say', text }); }

  send(peerId, msg) {
    if (!this.seats || [...this.seats.values()].some(seat => seat.peer === peerId)) this.conns.get(peerId)?.send(msg);
  }
  broadcast(msg) {
    if (this.seats) {
      for (const seat of this.seats.values()) if (seat.peer !== null) this.send(seat.peer, msg);
    } else for (const c of this.conns.values()) c.send(msg);
  }
  close() { this.peer?.destroy(); }
}

export class ClientNet extends Emitter {
  constructor() { super(); this.isHost = false; }

  join(code) {
    this.code = code.toUpperCase().trim();
    return new Promise((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on('error', (e) => { this.emit('error', e); reject(e); });
      this.peer.on('open', () => {
        this.conn = this.peer.connect(PREFIX + this.code, { reliable: true });
        this.conn.on('open', () => { this.id = this.peer.id; resolve(this.id); });
        this.conn.on('data', (msg) => this.emit('msg', msg));
        this.conn.on('close', () => this.emit('close'));
      });
      setTimeout(() => reject(new Error('Could not reach the host. Check the code and that you are on the same network.')), 15000);
    });
  }

  get seatKey() {
    if (seatKeys.has(this.code)) return seatKeys.get(this.code);
    try { return sessionStorage.getItem(seatStorageKey(this.code)); } catch { return null; }
  }

  rememberSeat(key) {
    if (typeof key !== 'string') return;
    seatKeys.set(this.code, key);
    try { sessionStorage.setItem(seatStorageKey(this.code), key); } catch { /* same-page rejoin still works */ }
  }

  send(msg) { this.conn?.open && this.conn.send(msg); }
  close() { this.peer?.destroy(); }
}

/** Remembered player name (per browser). */
export function playerName() {
  let n = null;
  try { n = localStorage.getItem('jpfc:name'); } catch { /* storage blocked */ }
  if (!n) {
    n = (prompt('Your name (shown to the others in the lobby):') || 'Aster noob').slice(0, 20);
    try { localStorage.setItem('jpfc:name', n); } catch { /* fine */ }
  }
  return n;
}
