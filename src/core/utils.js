// Utilidades puras, sin dependencias del DOM ni del store.

export function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

export function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// Opciones como ['2','10','24','38'] se leen mejor en orden, no revueltas.
export function isNumericSeries(opts){
  if(!opts.every(o=>/^\s*[<>~≈]?\s*-?\d/.test(o))) return false;
  const nums = opts.map(o=>parseFloat(String(o).replace(/[^0-9.,-]/g,'').replace(',','.')));
  if(nums.some(n=>!Number.isFinite(n))) return false;
  return nums.every((n,i)=> i===0 || n>=nums[i-1]) || nums.every((n,i)=> i===0 || n<=nums[i-1]);
}

// Las preguntas tipo "A y B" dependen de la posición de las opciones: no se barajan.
export function keepsOptionOrder(opts){
  return opts.some(o=>/^\s*[A-D]\s*(y|e|,)\s*[A-D]\s*$|anteriores/i.test(o));
}

export function dayStr(d = new Date()){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

export function dayBefore(iso){
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate()-1);
  return dayStr(d);
}

export function pctColor(p){
  if(p >= 80) return 'var(--mint)';
  if(p >= 60) return 'var(--yellow)';
  return '#ff6b6b';
}