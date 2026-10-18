// Capturas de la rejilla de revisión. Uso: node dev/shoot.mjs <carpeta de salida>   (con `pnpm dev` corriendo)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] || 'docs/shots/ref';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('pageerror', e.message));
for(const theme of ['light', 'dark']) for(const cat of ['ropa', 'accesorio', 'sombrero']){
  await page.goto(`http://localhost:5173/dev/items.html?still&theme=${theme}&cat=${cat}`);
  await page.waitForSelector('body[data-ready]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${cat}-${theme}.png`, fullPage: true });
  console.log('ok', cat, theme);
}
await browser.close();
