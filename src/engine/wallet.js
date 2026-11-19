// Per-roommate money (Trevor #515): each roommate has their own wallet in save.party[who].money, and can
// send money to another roommate. Host-authoritative like the rest of the save; clients ask the host.
export const START_MONEY = 25;

export const money = (save, who) => save?.party?.[who]?.money ?? 0;

/** Add (or with a negative n, take) money; never below zero. Returns the new balance. */
export function addMoney(save, who, n) {
  const c = save?.party?.[who];
  if (!c) return 0;
  c.money = Math.max(0, (c.money ?? 0) + Math.round(n));
  return c.money;
}

/** Take `n` if they can afford it. Returns true if paid. */
export function pay(save, who, n) {
  if (money(save, who) < n) return false;
  addMoney(save, who, -n);
  return true;
}

/** Give everyone in the party `n` each (shared finds: quest rewards, kill drops). */
export function addEach(save, n, filter = () => true) {
  for (const who of Object.keys(save?.party ?? {})) if (filter(who)) addMoney(save, who, n);
}

/** Send money from one roommate to another. Returns the amount actually sent. */
export function send(save, from, to, n) {
  n = Math.floor(n);
  if (from === to || !save?.party?.[to] || n <= 0) return 0;
  const amt = Math.min(n, money(save, from));
  if (amt <= 0) return 0;
  addMoney(save, from, -amt); addMoney(save, to, amt);
  return amt;
}
