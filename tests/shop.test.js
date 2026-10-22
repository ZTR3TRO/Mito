import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOP_TABS, tabsFor, validTab, sectionItems, sortItems, affordable, shopView, focusTarget } from '../src/features/shop/catalog.js';
import { WARDROBE } from '../src/content/wardrobe.js';
import { FURNITURE } from '../src/content/furniture.js';
import { FOODS } from '../src/content/food.js';

test('Tienda: categorías exclusivas, sin básicos, secretos ni compras; Temporada separada', ()=>{
  for(const tab of SHOP_TABS.filter(t => t.cat)){
    const expected = WARDROBE.find(c => c.id === tab.cat).items.filter(i => i.cost > 0 && !i.secret && !i.seasonal);
    assert.deepEqual(sectionItems(tab.id).map(e => e.id), expected.map(i => i.id));
    assert.deepEqual(sectionItems(tab.id, { owns: ()=> true }), []);
  }
  const seasonal = sectionItems('season', { seasonOpen: true });
  assert.ok(seasonal.length > 0);
  assert.ok(seasonal.every(e => e.item.seasonal));
  assert.deepEqual(sectionItems('season'), []);
  assert.equal(tabsFor(false).length, 8);
  assert.equal(tabsFor(true).length, 9);
  assert.equal(validTab('season', false), 'ropa');
  assert.equal(validTab('season', true), 'season');
  for(const invalid of [null, undefined, '', 'deleted']) assert.equal(validTab(invalid, true), 'ropa');
});

test('Tienda: comida repetible y muebles usan su propio inventario y cuarto', ()=>{
  assert.deepEqual(sectionItems('food', { owns: ()=> true }).map(e => e.item), FOODS);
  assert.equal(shopView('food', { owns: ()=> true }).complete, false);
  const owned = FURNITURE[0].id;
  const items = sectionItems('furn', { owns: ()=> true, ownsFurniture: id => id === owned });
  assert.equal(items.length, FURNITURE.length - 1);
  assert.ok(items.every(e => e.id !== owned));
  const kitchen = sectionItems('furn', { room: 'kitchen' });
  assert.ok(kitchen.length > 0 && kitchen.every(e => e.item.room === 'kitchen'));
  assert.equal(shopView('furn', { ownsFurniture: ()=> true }).complete, true);
  const roomDone = shopView('furn', { room: 'kitchen', ownsFurniture: id => FURNITURE.find(f => f.id === id).room === 'kitchen' });
  assert.equal(roomDone.complete, false);
  assert.equal(roomDone.shown.length, 0);
});

test('Tienda: ordenar es estable, no modifica el catálogo; saldo exacto y regalos', ()=>{
  const list = [{ id:'a', cost:10 }, { id:'b', cost:0 }, { id:'c', cost:10 }, { id:'d', cost:30 }];
  assert.deepEqual(sortItems(list, 'up').map(e => e.id), ['b','a','c','d']);
  assert.deepEqual(sortItems(list, 'down').map(e => e.id), ['d','a','c','b']);
  assert.deepEqual(sortItems(list).map(e => e.id), ['a','b','c','d']);
  assert.deepEqual(affordable(list, 10).map(e => e.id), ['a','b','c']);
  assert.deepEqual(affordable(list, 0).map(e => e.id), ['b']);
  const empty = shopView('ropa', { afford:true, chispas:0 });
  assert.ok(empty.all.length > 0);
  assert.equal(empty.shown.length, 0);
  assert.equal(empty.complete, false);
  assert.equal(shopView('ropa', { owns:()=> true }).complete, true);
});

test('Tienda: accesos directos validados, con cuarto solo para Muebles', ()=>{
  assert.deepEqual(focusTarget('food'), { tab:'food', room:'all' });
  assert.deepEqual(focusTarget('furniture'), { tab:'furn', room:'all' });
  assert.deepEqual(focusTarget({ tab:'furn', room:'kitchen' }), { tab:'furn', room:'kitchen' });
  assert.deepEqual(focusTarget({ tab:'furn', room:'invalid' }), { tab:'furn', room:'all' });
  assert.deepEqual(focusTarget({ tab:'ropa', room:'kitchen' }), { tab:'ropa', room:'all' });
  for(const invalid of [null, '', 'invalid', {}, { tab:'invalid' }]) assert.equal(focusTarget(invalid), null);
});
