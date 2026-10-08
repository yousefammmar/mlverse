// Tiny localStorage wrapper; never throws. A saved value is returned only when its type matches the
// default's type (array / object / number / string), so stale or corrupt data can never crash a page.
const ok = (v, d) => d == null || (Array.isArray(d) ? Array.isArray(v) : typeof d === 'object' ? v !== null && typeof v === 'object' && !Array.isArray(v) : typeof v === typeof d && (typeof d !== 'number' || Number.isFinite(v)));
export const store = {
  get: (k, d) => { try { const v = JSON.parse(localStorage.getItem('mlverse:' + k)); return v == null || !ok(v, d) ? d : v; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('mlverse:' + k, JSON.stringify(v)); } catch {} }
};
