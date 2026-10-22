// Que Mito nunca se pierda. Mito puede quedar detrás de un mueble (está libre, Fase 5); cuando lo tapan en su
// mayoría, se dibuja su silueta (un contorno suave de su cuerpo) por encima de los muebles y aparece "Traer a Mito",
// que lo hace saltar a un lugar del piso donde se vea. Si se quedó dormido en otro cuarto, el botón dice "Ir con
// Mito" y lleva la cámara hasta él. Cuánto lo tapan lo calcula furniture-layout.js (coverage); aquí solo se dibuja.

export const COVERED = .55;   // desde esta parte del cuerpo tapada, "en su mayoría"

// El cuerpo de Mito (content/art/base.js), con sus antenas: solo el contorno.
const SILHOUETTE = `<svg viewBox="0 0 150 150" aria-hidden="true">
  <path d="M60 22Q56 10 50 6M90 22Q94 10 100 6M75 18V2" fill="none"/>
  <path d="M75 18c-30 0-52 24-52 54 0 32 24 54 52 54s52-22 52-54c0-30-22-54-52-54Z"/></svg>`;
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="7"/><path d="M9.5 12.5h.01M14.5 12.5h.01M10 15.5q2 1.5 4 0M12 6V3"/></svg>';

// onBring(): el botón (la Casa decide si salta o si va al cuarto donde está).
export function createSeek(room, mascot, { onBring = ()=>{} } = {}){
  const ghost = document.createElement('div');
  ghost.className = 'mito-ghost';
  ghost.innerHTML = SILHOUETTE;
  ghost.hidden = true;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bring-mito';
  btn.hidden = true;
  btn.addEventListener('click', ()=> onBring());
  room.append(ghost, btn);

  return {
    // covered: lo tapan en su mayoría (y está en el cuarto que se ve); away: está en otro cuarto.
    update({ covered = false, away = false } = {}){
      room.classList.toggle('mito-covered', covered);
      if(covered){
        const r = room.getBoundingClientRect(), s = mascot.querySelector(':scope > svg.mito')?.getBoundingClientRect();
        if(s && s.width){
          Object.assign(ghost.style, { left: (s.left - r.left) + 'px', top: (s.top - r.top) + 'px', width: s.width + 'px', height: s.height + 'px' });
        }
      }
      ghost.hidden = !covered;
      btn.hidden = !covered && !away;
      btn.innerHTML = ICON + `<span>${away ? 'Ir con Mito' : 'Traer a Mito'}</span>`;
      btn.setAttribute('aria-label', away ? 'Ir al cuarto donde está Mito' : 'Traer a Mito a un lugar donde se vea');
    },
    hide(){ ghost.hidden = true; btn.hidden = true; room.classList.remove('mito-covered'); },
  };
}
