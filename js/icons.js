// Inline SVG icons (stroke, currentColor). Usage: ic('play')
const P = {
  play: '<path d="M7 5l12 7-12 7z" fill="currentColor"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  radar: '<path d="M5 12a7 7 0 0 1 7-7M8.500 12a3.500 3.500 0 0 1 3.500-3.500"/><circle cx="12" cy="12" r="1.500" fill="currentColor"/><path d="M12 12l6 6M19 5a10 10 0 0 1 0 14"/>',
  shapes: '<path d="M8 3l5 8H3z"/><circle cx="17" cy="7" r="3.500"/><rect x="4" y="14" width="7" height="7" rx="1.500"/><path d="M15 15h6v6h-6z"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 14v4M8 21h8M10 18h4"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  theme: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>'
};
export const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
