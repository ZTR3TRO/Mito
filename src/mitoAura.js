// Generado a partir de mito-nuevo.html (auras).
const RB = ['#ff5da2','#ffc93c','#16c98d','#5db2ff','#b98af6'];
const AURAS = [['none','Sin aura'],['mint','Menta'],['gold','Dorada'],['rainbow','Arcoíris'],['cosmic','Cósmica'],['fire','Fuego'],['ice','Escarcha'],['storm','Rayo'],['sakura','Sakura']];
const AU = {fire:[{k:'flame',n:10,c:['#fff']},{k:'rise',n:14,c:['#ffb02e','#ff7a1c','#ffe08a']}],ice:[{k:'shard',n:5,c:['#fff']},{k:'snow',n:16,c:['#fff','#d6f4ff','#a8e4ff']},{k:'star',n:5,c:['#fff','#bfeaff']}],storm:[{k:'bolt',n:5,c:['#fff']},{k:'spark',n:18,c:['#ffe95a','#9fe8ff','#fff']}],sakura:[{k:'petal',n:14,c:['#fff']},{k:'dust',n:8,c:['#ffd1e6','#fff']}],mint:[{k:'rise',n:14,c:['#16c98d','#7bf0c4','#c9ffe9'],leaf:1}],gold:[{k:'twk',n:12,c:['#ffd23c','#fff2a8']},{k:'rise',n:6,c:['#ffe680']}],rainbow:[{k:'orb',n:3,c:['#ff5da2','#5db2ff','#ffc93c']},{k:'rise',n:10,c:RB}],cosmic:[{k:'dust',n:26,c:['#fff','#cfc4ff','#9fdcff']},{k:'star',n:7,c:['#fff','#b9a8ff','#8fd6ff','#ffb3e6']},{k:'shoot',n:2,c:['#fff']}]};
export function setAura(box, id){
  const ap = box.querySelector('.a-parts');
  ap.innerHTML = ''; box.dataset.a = id; box.classList.toggle('on', id !== 'none');
  if(id === 'cosmic') ap.insertAdjacentHTML('beforeend', '<div class="orbit-t"><div class="orbit-ring"><b class="pl"></b><b class="pl b"></b></div></div>');
  (AU[id] || []).forEach(L=>{
    for(let i=0;i<L.n;i++){
      const e = document.createElement('i'), r = Math.random;
      e.className = 'p-' + L.k + (L.leaf ? ' leaf' : '');
      e.style.cssText = `--c:${L.c[i%L.c.length]};--x:${8+r()*84}%;--y:${10+r()*80}%;--s:${L.k==='twk' ? 7+r()*8 : L.k==='star' ? 12+r()*10 : L.k==='bolt' ? 7+r()*5 : L.k==='flame' ? 12+r()*14 : L.k==='petal' ? 7+r()*7 : L.k==='snow' ? 2.5+r()*3 : L.k==='spark' ? 1.5+r()*2.5 : L.k==='dust' ? 1.5+r()*2 : 4+r()*5}px;--dur:${2.4+r()*2.4}s;--del:${-r()*4}s;--dx:${r()*40-20}px`;
      if(L.k === 'orb' || L.k === 'shard'){
        const w = document.createElement('div');
        w.className = 'orb';
        w.style.cssText = `inset:${i*6-2}%;--dur:${7+i*3}s;animation-direction:${i%2 ? 'reverse' : 'normal'}`;
        w.appendChild(e); ap.appendChild(w);
      } else ap.appendChild(e);
    }
  });
}
