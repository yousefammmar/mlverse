// Tiny localStorage wrapper; never throws.
export const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem('mlverse:' + k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('mlverse:' + k, JSON.stringify(v)); } catch {} }
};
