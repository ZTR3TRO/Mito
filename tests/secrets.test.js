import test from 'node:test';
import assert from 'node:assert/strict';
import { WARDROBE, SECRET_IDS, findItemById } from '../src/wardrobe.js';
import { SECRET_PETS } from '../src/secretArt.js';

function fakeStorage(){
  let saved = null;
  globalThis.localStorage = { getItem:()=>saved, setItem:(_, v)=>{ saved = v; } };
}

test('premios secretos: un aura y una mascota, gratis, no se venden y no estorban a los demás', ()=>{
  assert.deepEqual([...SECRET_IDS].sort(), ['a-panal', 'p-bee']);
  for(const id of SECRET_IDS){
    const item = findItemById(id);
    assert.equal(item.secret, true);
    assert.equal(item.cost, 0);
    assert.ok(!item.seasonal);
  }
  assert.ok(SECRET_PETS.bee.includes('data-p="bee"'));
  assert.ok(WARDROBE.every(cat=>!cat.items[0].secret), 'el primer ítem de cada categoría sigue siendo el básico');
});

test('easter egg: no se pueden equipar ni comprar sin desbloquear; al desbloquear se añaden al armario una sola vez', async ()=>{
  fakeStorage();
  try{
    const store = await import('../src/store.js?secrets-1');
    store.addChispas(9999);
    for(const id of SECRET_IDS){
      const cat = WARDROBE.find(c=>c.items.some(i=>i.id === id)).id;
      assert.equal(store.equipCategory(cat, id), false, `${id}: no equipable antes de desbloquear`);
      assert.equal(store.buyAndEquip(cat, id), false, `${id}: no comprable`);
      assert.equal(store.owns(id), false);
    }
    assert.equal(store.secretsUnlocked(), false);
    const balance = store.getChispas();

    assert.deepEqual([...store.unlockSecrets()].sort(), ['a-panal', 'p-bee']);
    assert.equal(store.getChispas(), balance, 'desbloquear no cuesta chispas');
    assert.equal(store.secretsUnlocked(), true);
    assert.deepEqual(store.unlockSecrets(), [], 'segunda vez: no hay nada nuevo');
    assert.equal(store.equipCategory('aura', 'a-panal'), true);
    assert.equal(store.equipCategory('pet', 'p-bee'), true);

    // sobrevive a recargar y a exportar/importar el progreso
    const backup = store.exportSave();
    const reloaded = await import('../src/store.js?secrets-2');
    assert.equal(reloaded.secretsUnlocked(), true);
    reloaded.resetAll();
    assert.equal(reloaded.secretsUnlocked(), false);
    reloaded.importSave(backup);
    assert.equal(reloaded.secretsUnlocked(), true);
  } finally {
    delete globalThis.localStorage;
  }
});

test('avatar: la abejita se dibuja como mascota y el cabello de vampiro/sombrero calabaza marcan "sin antenas"', async ()=>{
  globalThis.document = { getElementById:()=>({}) };
  try{
    const avatar = await import('../src/avatar.js');
    const thumb = avatar.itemThumb('pet', findItemById('p-bee'));
    assert.ok(thumb.includes('data-p="bee"'));
    const hair = avatar.itemThumb('sombrero', findItemById('s-vampire'));
    const pumpkin = avatar.itemThumb('sombrero', findItemById('s-pumpkin'));
    assert.ok(hair.includes('no-ant') && pumpkin.includes('no-ant'));
    assert.ok(!avatar.itemThumb('sombrero', findItemById('s-mago')).includes('no-ant'), 'los demás sombreros conservan las antenas');
  } finally {
    delete globalThis.document;
  }
});