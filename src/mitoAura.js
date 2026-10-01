// Generado a partir de mito-nuevo.html (auras). Embrujada y Panal se añadieron después (ver HAUNT_HTML / PANAL_HTML).
import { AURA_BAT, AURA_BEE } from './secretArt.js';
const RB = ['#ff5da2','#ffc93c','#16c98d','#5db2ff','#b98af6'];
const AURAS = [['none','Sin aura'],['mint','Menta'],['gold','Dorada'],['rainbow','Arcoíris'],['cosmic','Cósmica'],['fire','Fuego'],['ice','Escarcha'],['storm','Rayo'],['sakura','Sakura']];
const AU = {haunt:[{k:'wisp',n:6,c:['#b36bff','#8a5cff','#ff9a3c']},{k:'ember',n:18,c:['#ff8a1c','#ffd27a','#ff5a1c','#ffb347']},{k:'twk',n:4,c:['#ffd27a','#fff']}],panal:[{k:'hex',n:10,c:['#fff']},{k:'rise',n:7,c:['#ffd23c','#ffb300','#fff2a8']},{k:'twk',n:4,c:['#fff2a8','#fff']}],fire:[{k:'flame',n:10,c:['#fff']},{k:'rise',n:14,c:['#ffb02e','#ff7a1c','#ffe08a']}],ice:[{k:'shard',n:5,c:['#fff']},{k:'snow',n:16,c:['#fff','#d6f4ff','#a8e4ff']},{k:'star',n:5,c:['#fff','#bfeaff']}],storm:[{k:'bolt',n:5,c:['#fff']},{k:'spark',n:18,c:['#ffe95a','#9fe8ff','#fff']}],sakura:[{k:'petal',n:14,c:['#fff']},{k:'dust',n:8,c:['#ffd1e6','#fff']}],mint:[{k:'rise',n:14,c:['#16c98d','#7bf0c4','#c9ffe9'],leaf:1}],gold:[{k:'twk',n:12,c:['#ffd23c','#fff2a8']},{k:'rise',n:6,c:['#ffe680']}],rainbow:[{k:'orb',n:3,c:['#ff5da2','#5db2ff','#ffc93c']},{k:'rise',n:10,c:RB}],cosmic:[{k:'dust',n:26,c:['#fff','#cfc4ff','#9fdcff']},{k:'star',n:7,c:['#fff','#b9a8ff','#8fd6ff','#ffb3e6']},{k:'shoot',n:2,c:['#fff']}]};

// Aura Embrujada: círculo mágico en el suelo (con perspectiva), murciélagos en órbita y neblina.
// Los elementos de órbita usan .fo (órbita) + .fb (el que vuela, contra-rotado para quedar derecho).
const orbit = (inset, dur, delay, inner, rev) =>
  `<div class="fo${rev ? ' rev' : ''}" style="--in:${inset}%;--dur:${dur}s;--del:${delay}s"><div class="fb">${inner}</div></div>`;
const RUNES = `<svg viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="100" r="95" stroke="#ff9a3c" stroke-width="2.6"/><circle cx="100" cy="100" r="86" stroke="#ffd27a" stroke-width="1" stroke-dasharray="3 5" opacity=".8"/><circle cx="100" cy="100" r="78" stroke="#b36bff" stroke-width="5" stroke-dasharray="2 10" opacity=".9"/><circle cx="100" cy="100" r="66" stroke="#ff9a3c" stroke-width="1.8"/><path d="M100 36L137.6 151.8L39.1 80.2L160.9 80.2L62.4 151.8Z" stroke="#ffb347" stroke-width="2.4"/></g><g fill="#ffd27a"><circle cx="100" cy="36" r="3.4"/><circle cx="137.6" cy="151.8" r="3.4"/><circle cx="39.1" cy="80.2" r="3.4"/><circle cx="160.9" cy="80.2" r="3.4"/><circle cx="62.4" cy="151.8" r="3.4"/></g></svg>`;
const HAUNT_HTML =
  '<div class="hn-floor"><div class="hn-runes">' + RUNES + '</div></div>' +
  '<div class="hn-mist"></div>' +
  orbit(7, 11, 0, AURA_BAT) + orbit(13, 15, -5, AURA_BAT, true) + orbit(3, 19, -11, AURA_BAT);

// Aura Panal (secreta): abejitas en órbita. El panal de fondo y los hexágonos van en CSS.
const PANAL_HTML =
  orbit(8, 9, 0, AURA_BEE) + orbit(14, 12, -6, AURA_BEE, true);
export function setAura(box, id){
  const ap = box.querySelector('.a-parts');
  ap.innerHTML = ''; box.dataset.a = id; box.classList.toggle('on', id !== 'none');
  if(id === 'cosmic') ap.insertAdjacentHTML('beforeend', '<div class="orbit-t"><div class="orbit-ring"><b class="pl"></b><b class="pl b"></b></div></div>');
  if(id === 'haunt') ap.insertAdjacentHTML('beforeend', HAUNT_HTML);
  if(id === 'panal') ap.insertAdjacentHTML('beforeend', PANAL_HTML);
  (AU[id] || []).forEach(L=>{
    for(let i=0;i<L.n;i++){
      const e = document.createElement('i'), r = Math.random;
      e.className = 'p-' + L.k + (L.leaf ? ' leaf' : '');
      e.style.cssText = `--c:${L.c[i%L.c.length]};--x:${8+r()*84}%;--y:${10+r()*80}%;--s:${L.k==='twk' ? 7+r()*8 : L.k==='star' ? 12+r()*10 : L.k==='bolt' ? 7+r()*5 : L.k==='flame' ? 12+r()*14 : L.k==='petal' ? 7+r()*7 : L.k==='wisp' ? 14+r()*12 : L.k==='ember' ? 1.8+r()*2.6 : L.k==='hex' ? 8+r()*9 : L.k==='snow' ? 2.5+r()*3 : L.k==='spark' ? 1.5+r()*2.5 : L.k==='dust' ? 1.5+r()*2 : 4+r()*5}px;--dur:${2.4+r()*2.4}s;--del:${-r()*4}s;--dx:${r()*40-20}px`;
      if(L.k === 'orb' || L.k === 'shard'){
        const w = document.createElement('div');
        w.className = 'orb';
        w.style.cssText = `inset:${i*6-2}%;--dur:${7+i*3}s;animation-direction:${i%2 ? 'reverse' : 'normal'}`;
        w.appendChild(e); ap.appendChild(w);
      } else ap.appendChild(e);
    }
  });
}