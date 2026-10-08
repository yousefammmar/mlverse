// Optional interaction sounds (muted by default). WebAudio only, no assets.
import { store } from './store.js';
let ctx, lastT = 0;
export const soundOn = () => store.get('sound', false);
export const setSound = v => store.set('sound', v);
function beep(f, d = 0.07, v = 0.04, type = 'sine') {
  if (!soundOn()) return; try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + d);
  } catch { /* audio unavailable */ }
}
export const tick = f => { const t = performance.now(); if (t - lastT > 60) { lastT = t; beep(f); } };
export const ok = () => { beep(523, .09); setTimeout(() => beep(784, .14), 90); };
export const bad = () => beep(180, .18, .05, 'triangle');
