// Helpers de DOM. Envuelven las queries más repetidas del proyecto para que las
// vistas queden declarativas y los ids existan en un solo lugar.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function byId(id){
  return document.getElementById(id);
}

// Crea un elemento con clase, texto y atributos en una llamada.
// children acepta nodos o strings de HTML.
export function el(tag, { class: cls, text, html, attrs, children } = {}){
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  if(text != null) node.textContent = text;
  if(html != null) node.innerHTML = html;
  if(attrs) for(const [k, v] of Object.entries(attrs)) if(v != null) node.setAttribute(k, v);
  if(children) node.append(...children);
  return node;
}

export function clear(node){
  if(node) node.innerHTML = '';
  return node;
}

// Delegación: un solo listener en document para muchos botones.
// match debe devolver el handler a ejecutar o null.
export function delegate(event, match){
  document.addEventListener(event, e=>{
    const handler = match(e);
    if(handler) handler(e);
  });
}

export function setText(id, value){
  const node = byId(id);
  if(node) node.textContent = value;
}