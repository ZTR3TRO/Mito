// Con pnpm dev activo: node tests/shop-browser.mjs
// Capturas fuera del repo; SHOP_SCREENSHOTS y SHOP_URL permiten cambiar el destino y servidor.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const output = process.env.SHOP_SCREENSHOTS || join(tmpdir(), 'opencode', 'shop-checks');
await mkdir(output, { recursive:true });
const browser = await chromium.launch();
try{
  for(const [width, height] of [[1440,900],[1440,800],[390,844],[360,740]]){
    for(const theme of ['light','dark']){
      const mobile = width < 881;
      const context = await browser.newContext({ viewport:{ width,height }, reducedMotion:'reduce', isMobile:mobile, hasTouch:mobile });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
      await page.goto(process.env.SHOP_URL || 'http://127.0.0.1:5173');
      await page.evaluate(()=> document.fonts.ready);
      await page.evaluate(async theme => {
        const store = await import('/src/state/store.js');
        store.setTheme(theme);
        (await import('/src/features/theme/index.js')).applyTheme(theme);
        store.addChispas(1000);
      }, theme);
      const nav = view => page.locator(`.navbtn[data-view="${view}"]`).click();
      const tab = id => page.locator(`[data-shop-tab="${id}"]`).click();
      const active = ()=> page.locator('#shopTabs [aria-selected="true"]').getAttribute('data-shop-tab');
      const visible = '#shopHost .shop-sec:not([hidden])';
      const shot = async name => {
        await page.screenshot({ path:join(output, `${width}x${height}-${theme}-${name}.png`) });
        assert.ok(await page.evaluate(()=> document.documentElement.scrollWidth <= innerWidth), 'sin desbordamiento horizontal');
      };
      await nav('shop');
      assert.equal(await active(), 'ropa');
      assert.equal(await page.locator(visible).count(), 1);
      assert.equal(await page.locator('#view-shop .shop-head-actions > .btn-mini').isVisible(), !mobile);
      if(!mobile){
        assert.ok(await page.locator('#shopTabs').evaluate(e => e.scrollWidth <= e.clientWidth), 'todas las pestañas caben');
        assert.ok((await page.locator('#shopPreview').boundingBox()).height < 100);
        const cards = await page.locator(`${visible} .shop-item`).evaluateAll(es => es.map(e => ({ y:e.getBoundingClientRect().y, bottom:e.getBoundingClientRect().bottom })));
        assert.equal(cards.filter(c => c.y === cards[0].y).length, 7);
        assert.ok(cards.every(c => c.bottom <= height), 'dos filas visibles sin bajar');
      }
      const preview = async ()=> {
        const card = page.locator(`${visible} .shop-item`).first();
        if(mobile) await card.click(); else await card.hover();
      };
      await preview(); await shot('ropa');
      await tab('food'); await preview(); await shot('food');
      // Compra repetible desde la vista previa (barra en móvil).
      const buy = page.locator(mobile ? '#trialBar .tb-act' : '#spAct');
      await buy.click(); await buy.click();
      assert.ok(await page.evaluate(async ()=> (await import('/src/state/store.js')).foodCount('f-apple') === 2));
      await tab('furn');
      if(mobile){
        assert.ok(await page.locator('#shopTabs').evaluate(e => e.scrollLeft > 0 && e.classList.contains('can-left')));
      }
      await page.locator(`${visible} [data-furn-room="kitchen"]`).click();
      await preview(); await shot('furn');
      const heights = await page.locator(`${visible} .shop-item`).evaluateAll(es => es.map(e => e.getBoundingClientRect().height));
      assert.equal(new Set(heights).size, 1);
      // Compra de un mueble: desaparece y el aviso abre la Casa con Decorar.
      const furniture = page.locator(`${visible} .shop-item:has([data-buy-furn])`).first();
      const id = await furniture.getAttribute('data-item');
      if(mobile) await furniture.click(); else await furniture.hover();
      await buy.click();
      assert.equal(await page.locator(`#shopHost [data-item="${id}"]`).count(), 0);
      await page.locator('#shopNotice [data-place-furn]').click();
      assert.ok(await page.locator('#houseRoom').evaluate(e => e.classList.contains('is-decorating')));
      await page.locator(`[data-furn-item="${id}"]`).click();
      await page.locator('[data-decor-shop]').click();
      assert.equal(await active(), 'furn');
      assert.equal(await page.locator(`${visible} [data-furn-room="bedroom"]`).getAttribute('aria-pressed'), 'true');
      await tab('ropa');
      if(mobile) await page.locator(`${visible} select`).selectOption('down');
      else await page.locator(`${visible} [data-shop-sort="down"]`).click();
      const prices = await page.locator(`${visible} .si-price`).allTextContents();
      const nums = prices.map(s => Number(s.replace(/\D/g,'')));
      assert.deepEqual(nums, [...nums].sort((a,b)=>b-a));
      await page.evaluate(async ()=> { const s = await import('/src/state/store.js'); s.addChispas(-s.getChispas()); });
      await page.locator(`${visible} .shop-afford`).click();
      assert.ok(await page.locator(`${visible} .shop-empty`).isVisible());
      assert.equal(await page.locator(`${visible} .shop-done`).count(), 0);
      await shot('no-alcanza');
      await page.evaluate(async ()=> (await import('/src/state/store.js')).addChispas(60));
      assert.ok(await page.locator(`${visible} .shop-item`).count() > 0, 'Me alcanza responde al saldo nuevo');
      assert.ok((await page.locator(`${visible} .si-price`).allTextContents()).every(s => Number(s.replace(/\D/g,'')) <= 60));
      await nav('home'); await nav('shop');
      assert.equal(await active(), 'ropa');
      assert.equal(await page.locator(`${visible} input`).isChecked(), false);
      assert.equal(await page.locator(`${visible} [data-shop-sort="rec"]`).getAttribute('aria-pressed'), 'true');
      await tab('sombrero');
      await page.reload(); await nav('shop');
      assert.equal(await active(), 'sombrero', 'persiste tras recargar');
      await page.evaluate(async ()=> {
        const { state, commit } = await import('/src/state/core.js');
        const { WARDROBE } = await import('/src/content/wardrobe.js');
        for(const i of WARDROBE.find(c => c.id === 'sombrero').items) state.owned[i.id] = true;
        commit();
        (await import('/src/features/shop/index.js')).renderShop();
      });
      assert.ok(await page.locator(`${visible} .shop-done`).isVisible());
      assert.equal(await page.locator(`${visible} .shop-afford`).count(), 0);
      await shot('done');
      await page.locator(`${visible} [data-nav="wardrobe"]`).click();
      assert.equal(await page.locator('body').getAttribute('data-view'), 'wardrobe');
      // Navegación de teclado y pestañas fijas al bajar.
      await nav('shop'); await tab('furn');
      await page.locator('[data-shop-tab="furn"]').focus();
      await page.keyboard.press('Home'); assert.equal(await active(), 'color');
      await tab('furn');
      await page.evaluate(()=> window.scrollTo(0, 500));
      assert.ok(Math.abs((await page.locator('#shopTop').boundingBox()).y) < 2, 'pestañas fijas');
      // Invitación de Mito con hambre y charola vacía: llega directo a Comida.
      await page.evaluate(async ()=> {
        const { state, commit } = await import('/src/state/core.js');
        delete state.pantry;
        state.house = { v:3, at:Date.now(), needs:{ hunger:20, clean:100, energy:100, mood:100 }, sleepSince:null };
        commit();
      });
      await nav('house');
      await page.locator('.go-chip').click();
      assert.equal(await active(), 'food');
      // La charola vacía usa el mismo destino, incluso con otra pestaña recordada.
      await tab('ropa');
      await page.evaluate(async ()=> (await import('/src/state/store.js')).setMito({ room:'kitchen' }));
      await nav('house');
      await page.locator('[data-house-act="eat"]').click();
      await page.locator('[data-food-shop]').click();
      assert.equal(await active(), 'food');
      assert.deepEqual(errors, [], 'sin errores de consola');
      console.log(`OK ${width} × ${height} ${theme}`);
      await context.close();
    }
  }
} finally { await browser.close(); }
console.log(`Capturas: ${output}`);
