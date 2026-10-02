// Guardas de la arquitectura. No prueban comportamiento: comprueban que la
// estructura de src/ siga siendo la que creemos.
//
// Las reglas salen de una sola idea: content/ son datos, core/ no conoce el
// dominio, state/ no depende de features/ y solo features/ toca el DOM. Con
// eso se puede añadir una feature sin tocar lo demás, y ningún fichero suelto
// ni ciclo puede colarse sin que esto falle.
//
// Analiza los imports estáticamente, así que no arranca la app ni necesita DOM.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

function walk(dir){
  const out = [];
  for(const name of readdirSync(dir)){
    const full = join(dir, name);
    if(statSync(full).isDirectory()) out.push(...walk(full));
    else if(name.endsWith('.js')) out.push(full);
  }
  return out;
}

// Los comentarios no cuentan como uso: si no, escribir el nombre de un símbolo
// en un docs lo daría por usado.
const stripComments = code =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const IMPORT_RE = /\bfrom\s+['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"]/g;
const REEXPORT_RE = /\bexport\s+(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s+['"]([^'"]+)['"]/g;

const files = walk(SRC);
const code = new Map(files.map(f => [f, readFileSync(f, 'utf8')]));
const plain = new Map([...code].map(([f, c]) => [f, stripComments(c)]));

// Los tests también consumen la API, así que cuentan como usos.
const tests = new Map(
  [...walk(join(ROOT, 'tests'))].map(f => [f, stripComments(readFileSync(f, 'utf8'))]),
);

// Los paquetes externos no dicen nada de nuestra estructura: solo los relativos.
function targets(file, source){
  const specs = [
    ...[...source.matchAll(IMPORT_RE)].map(m => m[1] || m[2]),
    ...[...source.matchAll(REEXPORT_RE)].map(m => m[1]),
  ];
  const out = specs.filter(s => s.startsWith('.')).map(spec => {
    const abs = resolve(dirname(file), spec);
    return code.has(abs) ? abs : abs + '.js';
  });
  return [...new Set(out)];
}

const graph = new Map([...code].map(([f, c]) => [f, targets(f, c)]));

const posix = f => relative(ROOT, f).split(sep).join('/');
const layerOf = f => relative(SRC, f).split(sep)[0];
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('la raíz de src/ solo tiene el entrypoint', ()=>{
  const loose = readdirSync(SRC).filter(name => name.endsWith('.js') && name !== 'main.js');
  assert.deepEqual(loose, [], `la raíz no debería tener .js aparte de main.js: ${loose.join(', ')}`);
});

test('content/ es datos puros: no importa fuera de content/', ()=>{
  const leaks = [];
  for(const [file, to] of graph) if(layerOf(file) === 'content'){
    for(const dest of to) if(layerOf(dest) !== 'content') leaks.push(`${posix(file)} -> ${posix(dest)}`);
  }
  assert.deepEqual(leaks, [], leaks.join('\n'));
});

test('core/ no conoce el dominio ni los datos', ()=>{
  const leaks = [];
  for(const [file, to] of graph) if(layerOf(file) === 'core'){
    for(const dest of to){
      if(['features', 'state', 'content'].includes(layerOf(dest))) leaks.push(`${posix(file)} -> ${posix(dest)}`);
    }
  }
  assert.deepEqual(leaks, [], leaks.join('\n'));
});

test('state/ no depende de features/', ()=>{
  const leaks = [];
  for(const [file, to] of graph) if(layerOf(file) === 'state'){
    for(const dest of to) if(layerOf(dest) === 'features') leaks.push(`${posix(file)} -> ${posix(dest)}`);
  }
  assert.deepEqual(leaks, [], leaks.join('\n'));
});

test('no hay ciclos de importación', ()=>{
  const cycles = [];
  const seen = new Map();
  const stack = [];
  const visit = node => {
    if(seen.get(node) === 'done') return;
    if(seen.get(node) === 'open'){
      cycles.push([...stack.slice(stack.indexOf(node)), node].map(posix).join(' -> '));
      return;
    }
    seen.set(node, 'open');
    stack.push(node);
    for(const next of graph.get(node) ?? []) if(code.has(next)) visit(next);
    stack.pop();
    seen.set(node, 'done');
  };
  for(const file of files) visit(file);
  assert.deepEqual(cycles, [], cycles.join('\n'));
});

test('todo lo que hay en src/ se usa: main.js llega a todo', ()=>{
  const entry = join(SRC, 'main.js');
  const reached = new Set([entry]);
  const queue = [entry];
  while(queue.length){
    for(const next of graph.get(queue.pop()) ?? []){
      if(code.has(next) && !reached.has(next)){ reached.add(next); queue.push(next); }
    }
  }
  const orphans = files.filter(f => !reached.has(f)).map(posix);
  assert.deepEqual(orphans, [], orphans.join('\n'));
});

// Nadie exporta un símbolo que no se usa, ni fuera (importado, con o sin punto)
// ni dentro. Obliga a decidir la visibilidad en vez de dejar API de sobra.
//
// Se miran las declaraciones exportadas y los `export { ... }` locales. Los
// barrels `export { ... } from './x.js'` se saltan: su contenido es justamente
// la API pública que se decide en ese fichero.
test('no hay exports muertos', ()=>{
  const DECL = /export\s+(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/g;
  const LOCAL_LIST = /export\s*\{([^}]*)\}(?!\s*from)/g;

  const unused = [];
  for(const file of files){
    const source = plain.get(file);
    const names = [...source.matchAll(DECL)].map(m => m[1]);
    for(const m of source.matchAll(LOCAL_LIST)){
      for(const raw of m[1].split(',')){
        const name = raw.trim().split(/\s+as\s+/).pop()?.trim();
        if(name) names.push(name);
      }
    }

    // El cuerpo sin la palabra export. Declararlo no cuenta como usarlo, así que
    // el nombre solo vale si aparece más de una vez (una llamada de verdad).
    const body = source.replace(/\bexport\b/g, '');
    for(const name of new Set(names)){
      const bare = new RegExp(`(?<![\\w$.])${escapeRe(name)}\\b`, 'g');
      const dotted = new RegExp(`\\.\\s*${escapeRe(name)}\\b`);
      const inside = (body.match(bare) ?? []).length > 1;
      const elsewhere = [...plain].some(([other, text]) =>
        other !== file && (bare.test(text) || dotted.test(text)));
      const inTests = [...tests].some(([other, text]) =>
        other !== file && (bare.test(text) || dotted.test(text)));
      if(!inside && !elsewhere && !inTests) unused.push(`${posix(file)} exporta "${name}" sin usar`);
    }
  }
  assert.deepEqual(unused, [], unused.join('\n'));
});
