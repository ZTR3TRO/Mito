import test from 'node:test';
import assert from 'node:assert/strict';
import { WARDROBE, SECRET_IDS, secretIdsFor, findItemById } from '../src/content/wardrobe.js';
import { SECRET_PETS } from '../src/content/art/secrets.js';

function fakeStorage(){
  let saved = null;
  globalThis.localStorage = { getItem:()=>saved, setItem:(_, v)=>{ saved = v; } };
}

test('premios secretos: un aura y dos mascotas, gratis, no se venden y no estorban a los demás', ()=>{
  assert.deepEqual([...SECRET_IDS].sort(), ['a-panal', 'p-ajolote', 'p-bee']);
  assert.deepEqual([...secretIdsFor('tap10')].sort(), ['a-panal', 'p-bee'], 'los 10 toques regalan el aura Panal y la Abejita');
  assert.deepEqual([...secretIdsFor('perfect')], ['p-ajolote'], 'la ronda perfecta regala el Ajolote');
  for(const id of SECRET_IDS){
    const item = findItemById(id);
    assert.equal(item.secret, true);
    assert.equal(item.cost, 0);
    assert.ok(!item.seasonal);
  }
  assert.ok(SECRET_PETS.bee.includes('data-p="bee"'));
  assert.ok(SECRET_PETS.ajolote.includes('data-p="ajolote"'));
  assert.ok(WARDROBE.every(cat=>!cat.items[0].secret), 'el primer ítem de cada categoría sigue siendo el básico');
});

test('easter egg: no se pueden equipar ni comprar sin desbloquear; al desbloquear se añaden al armario una sola vez', async ()=>{
  fakeStorage();
  try{
    const store = await import('../src/state/store.js?secrets-1');
    store.addChispas(9999);
    for(const id of SECRET_IDS){
      const cat = WARDROBE.find(c=>c.items.some(i=>i.id === id)).id;
      assert.equal(store.equipCategory(cat, id), false, `${id}: no equipable antes de desbloquear`);
      assert.equal(store.buyAndEquip(cat, id), false, `${id}: no comprable`);
      assert.equal(store.owns(id), false);
    }
    assert.equal(store.secretsUnlocked('tap10'), false);
    assert.equal(store.secretsUnlocked('perfect'), false, 'ningún egg desbloqueado todavía');
    const balance = store.getChispas();

    assert.deepEqual([...store.unlockSecrets('tap10')].sort(), ['a-panal', 'p-bee']);
    assert.equal(store.getChispas(), balance, 'desbloquear no cuesta chispas');
    assert.equal(store.secretsUnlocked('tap10'), true);
    assert.equal(store.secretsUnlocked('perfect'), false, 'el Ajolote es de otro egg: sigue sin desbloquearse');
    assert.deepEqual(store.unlockSecrets('tap10'), [], 'segunda vez: no hay nada nuevo');
    assert.deepEqual([...store.unlockSecrets('perfect')], ['p-ajolote']);
    assert.equal(store.secretsUnlocked('perfect'), true);
    assert.equal(store.equipCategory('aura', 'a-panal'), true);
    assert.equal(store.equipCategory('pet', 'p-bee'), true);
    assert.equal(store.equipCategory('pet', 'p-ajolote'), true);

    // sobrevive a recargar y a exportar/importar el progreso
    const backup = store.exportSave();
    const reloaded = await import('../src/state/store.js?secrets-2');
    assert.equal(reloaded.secretsUnlocked('tap10'), true);
    assert.equal(reloaded.secretsUnlocked('perfect'), true);
    reloaded.resetAll();
    assert.equal(reloaded.secretsUnlocked('tap10'), false);
    assert.equal(reloaded.secretsUnlocked('perfect'), false);
    reloaded.importSave(backup);
    assert.equal(reloaded.secretsUnlocked('tap10'), true);
    assert.equal(reloaded.secretsUnlocked('perfect'), true);
  } finally {
    delete globalThis.localStorage;
  }
});

test('avatar: la abejita se dibuja como mascota y el cabello de vampiro/sombrero calabaza marcan "sin antenas"', async ()=>{
  globalThis.document = { getElementById:()=>({}) };
  try{
    const avatar = await import('../src/features/mascot/avatar.js');
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