// Matemática de color pura (sin DOM, sin dominio): hex ↔ RGB ↔ HSL y mezcla.
// Los colores RGB viajan como [r, g, b] con cada canal de 0 a 255.

export function hexToRgb(hex){
  let h = hex.replace('#', '');
  if(h.length === 3) h = h.split('').map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

export function rgbToHex([r, g, b]){
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

// → [matiz 0–360, saturación 0–1, luminosidad 0–1]
export function rgbToHsl([r, g, b]){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if(max !== min){
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

export function hslToRgb([h, s, l]){
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Mezcla lineal de dos colores RGB (t = 0 → a, t = 1 → b)
export function mixRgb(a, b, t){
  return a.map((v, i) => v + (b[i] - v) * t);
}

// Brillo percibido de 0 a 1
export function brightness([r, g, b]){
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
