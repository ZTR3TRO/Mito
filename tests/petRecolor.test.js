// Recolor de mascotas: función pura, se prueba sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { recolorPet } from '../src/features/mascot/petRecolor.js';
import { PET_FACE_COLORS, PET_KEEP } from '../src/content/petColors.js';
import { hexToRgb, rgbToHsl, brightness } from '../src/core/color.js';
import { DEFS, PETS } from '../src/content/art/base.js';
import { HALLOWEEN_DEFS, HALLOWEEN_PETS } from '../src/content/art/halloween.js';
import { SECRET_PETS } from '../src/content/art/secrets.js';
import { WARDROBE } from '../src/content/wardrobe.js';

const ALL_PETS = { ...PETS, ...HALLOWEEN_PETS, ...SECRET_PETS };
const DEFS_ALL = DEFS + HALLOWEEN_DEFS;
const COLORS = WARDROBE.find(c => c.id === 'color').items.filter(i => i.defaults);
const COLOR_RE = /(?:fill|stroke|stop-color)\s*[=:]\s*"?(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g;
const norm = h => { const x = h.toLowerCase().replace('#', ''); return '#' + (x.length === 3 ? x.split('').map(c => c + c).join('') : x); };
const neutral = hex => { const [, s, l] = rgbToHsl(hexToRgb(hex)); return s < 0.16 || l > 0.93 || l < 0.16; };
const colorsOf = text => [...text.matchAll(COLOR_RE)].map(m => norm(m[1]));
const mint = COLORS.find(c => c.id === 'c-mint').defaults.body;
const cocoa = COLORS.find(c => c.id === 'c-cocoa').defaults.body;
const run = (k, body = mint, id = 'x1') => recolorPet(ALL_PETS[k], { body, defs: DEFS_ALL, id, keep: PET_KEEP[k] });

test('toda mascota queda 100 % recoloreada: no sobrevive ningún color original, salvo cara y detalles declarados', ()=>{
  for(const k of Object.keys(ALL_PETS)){
    for(const color of COLORS){
      const out = run(k, color.defaults.body);
      const allowed = new Set([...PET_FACE_COLORS, ...(PET_KEEP[k] || [])].map(norm));
      const leftovers = colorsOf(out).filter(c => !allowed.has(c) && !neutral(c));
      // Lo que queda con color debe ser de la rampa nueva (mismo matiz que el color elegido), nunca del dibujo original.
      const hue = rgbToHsl(hexToRgb(color.defaults.body))[0];
      for(const c of leftovers){
        const [h, s] = rgbToHsl(hexToRgb(c));
        const d = Math.abs(h - hue) % 360, dist = d > 180 ? 360 - d : d;
        assert.ok(dist < 18 || s < 0.16, `${k} con ${color.name}: quedó ${c} fuera de la rampa (¿falta declararlo en PET_FACE_COLORS o PET_KEEP?)`);
      }
    }
  }
});

test('la cara no se toca: ojos, boca y brillos siguen igual', ()=>{
  for(const k of Object.keys(ALL_PETS)){
    const before = colorsOf(ALL_PETS[k]).filter(c => ['#2b2140', '#ffffff'].includes(c)).length;
    const after = colorsOf(run(k)).filter(c => ['#2b2140', '#ffffff'].includes(c)).length;
    assert.ok(after >= before, `${k}: perdió colores de la cara (${before} → ${after})`);
  }
});

test('las mascotas conservan sus detalles de identidad (alas y cuernos del dragón, borde de la tortuga)', ()=>{
  for(const [k, colors] of Object.entries(PET_KEEP)){
    const out = run(k);
    for(const c of colors) assert.ok(colorsOf(out).includes(norm(c)) || !colorsOf(ALL_PETS[k] + DEFS_ALL).includes(norm(c)), `${k}: ${c} debería conservarse`);
  }
  assert.ok(colorsOf(run('dragon')).includes('#ff9ccb'), 'las alas rosas del dragón siguen rosas');
});

test('PET_KEEP solo menciona colores que existen en esa mascota (nada obsoleto)', ()=>{
  for(const [k, colors] of Object.entries(PET_KEEP)){
    assert.ok(ALL_PETS[k], `PET_KEEP.${k}: esa mascota no existe`);
    const used = new Set([...colorsOf(ALL_PETS[k]), ...(ALL_PETS[k].match(/url\(#([\w-]+)\)/g) || []).flatMap(u => {
      const g = DEFS_ALL.match(new RegExp(`<(linearGradient|radialGradient)\\b[^>]*\\bid="${u.slice(5, -1)}"[^>]*>[\\s\\S]*?</\\1>`));
      return g ? colorsOf(g[0]) : [];
    })]);
    for(const c of colors) assert.ok(used.has(norm(c)), `PET_KEEP.${k}: ${c} no aparece en el dibujo`);
  }
});

test('el brillo se respeta: el contorno queda más oscuro que los brillos del cuerpo', ()=>{
  for(const k of Object.keys(ALL_PETS)){
    for(const body of [mint, cocoa]){
      const out = run(k, body);
      const movable = [...new Set(colorsOf(out))].filter(c => !neutral(c) && !PET_FACE_COLORS.map(norm).includes(c) && !(PET_KEEP[k] || []).map(norm).includes(c));
      if(movable.length < 2) continue;
      const ys = movable.map(c => brightness(hexToRgb(c)));
      assert.ok(Math.max(...ys) - Math.min(...ys) > 0.2, `${k}: la rampa quedó plana (sin sombras ni luces)`);
    }
  }
});

test('los degradados se copian con id propio por instancia (dos mascotas no se pisan)', ()=>{
  const a = run('fox', mint, 'a1'), b = run('fox', mint, 'b2');
  assert.ok(/id="[\w-]+-a1"/.test(a) && !/-b2/.test(a));
  assert.ok(/id="[\w-]+-b2"/.test(b) && !/-a1/.test(b));
  const ids = [...a.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'sin ids repetidos dentro de una misma mascota');
  for(const m of a.matchAll(/url\(#([\w-]+)\)/g)) assert.ok(a.includes(`id="${m[1]}"`), `${m[1]}: referencia sin definición`);
});

test('recolorear es determinista y distinto para cada color', ()=>{
  assert.equal(run('otter'), run('otter'));
  const outs = new Set(COLORS.map(c => run('otter', c.defaults.body)));
  assert.equal(outs.size, COLORS.length, 'cada color debe dar un resultado distinto');
});

test('un dibujo sin colores movibles se devuelve igual', ()=>{
  const art = '<circle fill="#2b2140" r="3"/>';
  assert.equal(recolorPet(art, { body: mint, defs: '', id: 'z' }), art);
});
