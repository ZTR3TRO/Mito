// Efectos de celebración: confeti y chispas flotantes.

const CONFETTI_COLORS = ['#ff5da2','#16c98d','#ffc93c','#b98af6','#ff8fc0'];

export function burstConfetti(x, y, count){
  const host = document.getElementById('confettiHost');
  if(!host) return;
  for(let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetto';
    const size = 6 + Math.random()*6;
    c.style.width = size+'px';
    c.style.height = (size*0.4)+'px';
    c.style.left = (x + (Math.random()*200-100)) + 'px';
    c.style.top = (y - 20) + 'px';
    c.style.background = CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)];
    c.style.animationDuration = (1.1 + Math.random()*0.9) + 's';
    c.style.transform = `rotate(${Math.random()*360}deg)`;
    host.appendChild(c);
    setTimeout(()=>c.remove(), 2200);
  }
}

// Emoji que sube desde un elemento.
export function sparkAt(el, emoji){
  if(!el) return;
  const rect = el.getBoundingClientRect();
  const s = document.createElement('div');
  s.className = 'spark-pop';
  s.textContent = emoji;
  s.style.left = (rect.left + rect.width/2 - 10) + 'px';
  s.style.top = (rect.top) + 'px';
  s.style.position = 'fixed';
  document.body.appendChild(s);
  setTimeout(()=>s.remove(), 750);
}