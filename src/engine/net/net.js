// WebRTC networking via PeerJS (docs/tech/PLAN.md §2, D-006). Host-authoritative:
// clients send inputs, the host sends snapshots. The PeerJS broker is only used for the handshake;
// game traffic flows browser-to-browser on the LAN.
//
// Message shapes (all JSON):
//   client → host: {t:'hello', name} {t:'claim', character} {t:'input', inp} {t:'flag', key}
//   host → client: {t:'lobby', state} {t:'start', save, assignments} {t:'snap', snap} {t:'say', text}

const PREFIX = 'jpfc-room-';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeRoomCode() {
  let c = '';
  for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}

class Emitter {
  constructor() { this._h = {}; }
  on(t, fn) { (this._h[t] ||= []).push(fn); return this; }
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
      this.peer.on('connection', (conn) => {
        conn.on('open', () => { this.conns.set(conn.peer, conn); this.emit('join', conn.peer); });
        conn.on('data', (msg) => this.emit('msg', conn.peer, msg));
        conn.on('close', () => { this.conns.delete(conn.peer); this.emit('leave', conn.peer); });
      });
    });
  }

  send(peerId, msg) { this.conns.get(peerId)?.send(msg); }
  broadcast(msg) { for (const c of this.conns.values()) c.send(msg); }
  close() { this.peer?.destroy(); }
}

export class ClientNet extends Emitter {
  constructor() { super(); this.isHost = false; }

  join(code) {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on('error', (e) => { this.emit('error', e); reject(e); });
      this.peer.on('open', () => {
        this.conn = this.peer.connect(PREFIX + code.toUpperCase().trim(), { reliable: true });
        this.conn.on('open', () => { this.id = this.peer.id; resolve(this.id); });
        this.conn.on('data', (msg) => this.emit('msg', msg));
        this.conn.on('close', () => this.emit('close'));
      });
      setTimeout(() => reject(new Error('Could not reach the host. Check the code and that you are on the same network.')), 15000);
    });
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
