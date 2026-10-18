// Rejilla de revisión: cada objeto sobre cada piel, en modo claro y oscuro. Solo dev.
//   /dev/items.html                  todo
//   ?cat=ropa|accesorio|sombrero     una categoría   ?theme=light|dark   un modo
//   ?variants                        Lote A: 2 variantes por objeto lado a lado (ver variants.js)
//   ?still                           sin animaciones (para capturas)   ?face=happy|sad|excited
import { WARDROBE } from '../src/content/wardrobe.js';
import { previewAvatar } from '../src/features/mascot/avatar.js';
import { renderVariants } from './variants.js';

const q = new URLSearchParams(location.search);
const cats = ['ropa', 'accesorio', 'sombrero'].filter(c => !q.get('cat') || q.get('cat') === c);
const themes = q.get('theme') ? [q.get('theme')] : ['light', 'dark'];
const skins = WARDROBE.find(c => c.id === 'color').items;
const NONE = { color: 'c-mint', ropa: 'r-none', accesorio: 'ac-none', sombrero: 's-none', aura: 'a-none', pet: 'p-none' };
let n = 0;

const root = document.getElementById('root');

function renderGrid(){
  for(const theme of themes){
    const panel = document.createElement('section');
    panel.className = 'panel' + (q.has('still') ? ' still' : '');
    panel.dataset.theme = theme;
    panel.innerHTML = `<h1>Modo ${theme === 'dark' ? 'oscuro' : 'claro'}</h1>`;
    for(const catId of cats){
      const cat = WARDROBE.find(c => c.id === catId);
      const items = cat.items.filter(i => i.k && !i.secret);
      const head = skins.map(s => `<th>${s.name}</th>`).join('');
      const rows = items.map(item => `<tr><th class="row">${item.name}</th>${skins.map(skin =>
        `<td><div class="mascot face-${q.get('face') || 'normal'}" id="cell-${++n}"><svg class="mito" viewBox="0 0 150 150"></svg></div></td>`).join('')}</tr>`).join('');
      panel.insertAdjacentHTML('beforeend', `<h2>${cat.label}</h2><table><tr><th></th>${head}</tr>${rows}</table>`);
      let i = n - items.length * skins.length;
      for(const item of items) for(const skin of skins){
        i++;

        panel._jobs = (panel._jobs || []).concat([[catId, item.id, `cell-${i}`, skin.id]]);
      }
    }
    root.appendChild(panel);
    for(const [catId, itemId, cellId, skinId] of panel._jobs || [])
      previewAvatar(catId, itemId, cellId, { ...NONE, color: skinId });
  }
}

if(q.has('variants')) renderVariants(root, q); else renderGrid();
document.body.dataset.ready = '1';
