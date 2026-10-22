// La Tienda por secciones (lógica pura, sin DOM: se prueba en Node). Las pestañas, qué se vende en cada una, ordenar
// por precio, "Me alcanza" y adónde llevan los accesos directos. Quien la usa le pasa qué tienes (owns), tus chispas
// y si la temporada está abierta; aquí no se lee la partida.

import { WARDROBE } from '../../content/wardrobe.js';
import { FOODS } from '../../content/food.js';
import { FURNITURE } from '../../content/furniture.js';
import { findRoom } from '../../content/rooms.js';

// Una pestaña por tipo de producto, en este orden. `cat`: la categoría del armario (content/wardrobe.js).
// Temporada solo aparece cuando hay objetos de temporada a la venta.
export const SHOP_TABS = [
  { id: 'color', name: 'Piel', cat: 'color' },
  { id: 'ropa', name: 'Ropa', cat: 'ropa' },
  { id: 'accesorio', name: 'Accesorios', cat: 'accesorio' },
  { id: 'sombrero', name: 'Sombreros', cat: 'sombrero' },
  { id: 'aura', name: 'Auras', cat: 'aura' },
  { id: 'pet', name: 'Mascotas', cat: 'pet' },
  { id: 'food', name: 'Comida' },
  { id: 'furn', name: 'Muebles' },
  { id: 'season', name: 'Temporada' },
];
export const DEFAULT_TAB = 'ropa';
export const SORTS = [['rec', 'Recomendado'], ['up', 'Precio ↑'], ['down', 'Precio ↓']];

export const tabsFor = seasonOpen => SHOP_TABS.filter(t => t.id !== 'season' || (seasonOpen && WARDROBE.some(c => c.items.some(i => i.seasonal && i.cost > 0 && !i.secret))));
// Una pestaña guardada que ya no existe (o Temporada fuera de temporada) vuelve a la de siempre.
export const validTab = (id, seasonOpen) => tabsFor(seasonOpen).some(t => t.id === id) ? id : DEFAULT_TAB;

// Lo que se vende en una pestaña, en el orden del catálogo: [{ id, cost, kind: 'wear' | 'food' | 'furn', cat?, item }].
// Lo comprado ya no aparece, salvo la comida (se compra varias veces). En Muebles, el regalo de un cuarto aparece
// hasta que se entrega; `room` filtra por cuarto ('all': todos).
export function sectionItems(tab, { owns = ()=> false, ownsFurniture = ()=> false, seasonOpen = false, room = 'all' } = {}){
  if(tab === 'food') return FOODS.map(item => ({ id: item.id, cost: item.cost, kind: 'food', item }));
  if(tab === 'furn'){
    return FURNITURE.filter(f => !ownsFurniture(f.id) && (room === 'all' || f.room === room))
      .map(item => ({ id: item.id, cost: item.cost, kind: 'furn', item }));
  }
  const forSale = WARDROBE.flatMap(c => c.items
    .filter(item => item.cost > 0 && !item.secret && !owns(item.id))
    .map(item => ({ id: item.id, cost: item.cost, kind: 'wear', cat: c.id, item })));
  if(tab === 'season') return seasonOpen ? forSale.filter(e => e.item.seasonal) : [];
  return forSale.filter(e => e.cat === tab && !e.item.seasonal);
}

// Ordenar: 'rec' deja el orden del catálogo; 'up' y 'down' por precio (a igual precio, el del catálogo).
export function sortItems(list, mode = 'rec'){
  if(mode !== 'up' && mode !== 'down') return list.slice();
  const dir = mode === 'up' ? 1 : -1;
  return list.map((e, i) => [e, i]).sort((a, b) => (a[0].cost - b[0].cost) * dir || a[1] - b[1]).map(x => x[0]);
}

// "Me alcanza": solo lo que se puede comprar con las chispas de ahora (un regalo, siempre).
export const affordable = (list, chispas) => list.filter(e => e.cost <= chispas);

// Lo que muestra una sección: all (todo lo que se vende, con el filtro de cuarto), shown (ordenado y, con "Me
// alcanza", solo lo que alcanza) y complete (ya tienes todo de esta sección; la comida nunca se termina).
export function shopView(tab, { owns, ownsFurniture, seasonOpen, room = 'all', sort = 'rec', afford = false, chispas = 0 } = {}){
  const all = sectionItems(tab, { owns, ownsFurniture, seasonOpen, room });
  const shown = sortItems(afford ? affordable(all, chispas) : all, sort);
  const complete = tab !== 'food' && !sectionItems(tab, { owns, ownsFurniture, seasonOpen }).length;
  return { all, shown, complete };
}

// Accesos directos (el evento shop:focus): 'food' | 'furniture' | { tab, room }. Devuelve { tab, room } o null.
export function focusTarget(req){
  if(req === 'food') return { tab: 'food', room: 'all' };
  if(req === 'furniture') return { tab: 'furn', room: 'all' };
  if(!req || typeof req !== 'object' || !SHOP_TABS.some(t => t.id === req.tab)) return null;
  return { tab: req.tab, room: req.tab === 'furn' && findRoom(req.room) ? req.room : 'all' };
}
