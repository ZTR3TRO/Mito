// Apuntes: pestañas de temas y acordeón de preguntas con su respuesta.

import { el, clear, byId } from '../../core/dom.js';
import { on, emit } from '../../core/bus.js';
import { activeCourse } from './course.js';

const CHEV = `<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>`;

export function renderNotes(){
  const tabHost = byId('topicTabs');
  const host = byId('notesHost');
  const cheatWrap = byId('cheatSheet');
  const cheatGrid = byId('cheatGrid');
  if(!tabHost || !host || !cheatGrid) return;

  clear(tabHost);
  clear(host);
  if(cheatWrap) cheatWrap.style.display = (activeCourse().cheats || []).length ? '' : 'none';

  const notes = activeCourse().notes || [];
  if(notes.length === 0){
    host.innerHTML = `<div class="empty-state">Aún no hay apuntes para esta materia. Agrégalos en src/courses.js 📚</div>`;
    return;
  }

  notes.forEach((topic, i)=>{
    tabHost.appendChild(el('button', {
      class: 'topic-pill' + (i===0 ? ' active' : ''),
      html: topic.label,
      attrs: { 'data-target': 'block-' + topic.id },
    }));

    const acc = el('div', { class:'accordion' });
    topic.items.forEach((item, j)=>{
      const row = el('div', {
        class: 'acc-item' + (j===0 ? ' open' : ''),
        html: `
          <button class="acc-head">
            <h4>${item.q}</h4>
            ${CHEV}
          </button>
          <div class="acc-body"><div class="acc-body-inner">${item.a}</div></div>
        `,
      });
      acc.appendChild(row);
    });

    host.appendChild(el('div', {
      class: 'note-block' + (i===0 ? ' active' : ''),
      attrs: { id: 'block-' + topic.id },
      children: [acc],
    }));
  });

  renderCheats();
}

function renderCheats(){
  const grid = byId('cheatGrid');
  if(!grid) return;
  clear(grid);
  (activeCourse().cheats || []).forEach(c=>{
    grid.appendChild(el('div', {
      class: 'cheat-item',
      html: `<b>${c.n}</b>${c.l}`,
    }));
  });
}

function activateTopic(blockId){
  document.querySelectorAll('.topic-pill').forEach(p=>p.classList.toggle('active', p.dataset.target === blockId));
  document.querySelectorAll('.note-block').forEach(b=>b.classList.toggle('active', b.id === blockId));
}

// Palabras compartidas mínimas para dar una nota por relacionada.
const RELATED_MIN_WORDS = 2;

const words = text => String(text).replace(/<[^>]*>/g, ' ').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .split(/[^a-z0-9]+/).filter(w=>w.length > 3);

// Un tema se reconoce por su etiqueta: cada pregunta del banco trae como `cat` la etiqueta de su tema.
// Dentro del tema, la nota relacionada es la que más palabras comparte con la pregunta, su respuesta y su explicación
// (devuelve -1 si ninguna comparte lo bastante: mejor no abrir una nota al azar).
export function relatedNote(topic, question){
  const wanted = new Set(words(`${question.q} ${question.opts[question.correct]} ${question.exp}`));
  let best = -1, bestScore = 0;
  topic.items.forEach((item, i)=>{
    const itemWords = new Set(words(`${item.q} ${item.q} ${item.a}`));
    let score = 0;
    wanted.forEach(w=>{ if(itemWords.has(w)) score++; });
    if(score > bestScore){ best = i; bestScore = score; }
  });
  return bestScore >= RELATED_MIN_WORDS ? best : -1;
}
let pendingScroll = null;

// Lleva a Apuntes: pestaña del tema de la pregunta activa y su nota abierta (si se encuentra).
// Devuelve false si la materia no tiene ese tema. La navegación la pide quien llama.
export function openNotesFor(question){
  const notes = activeCourse().notes || [];
  const topic = notes.find(t=>t.label === question.cat);
  if(!topic) return false;
  activateTopic('block-' + topic.id);
  const i = relatedNote(topic, question);
  pendingScroll = null;
  if(i >= 0){
    const row = byId('block-' + topic.id)?.querySelectorAll('.acc-item')[i];
    if(row){
      row.classList.add('open');
      pendingScroll = row;
    }
  }
  byId('backToQuiz')?.removeAttribute('hidden');
  return true;
}

export function initNotes(){
  // El aviso "Volver a tu ronda" solo vale mientras se llegó desde el quiz.
  on('nav:after', view=>{
    if(view !== 'apuntes') byId('backToQuiz')?.setAttribute('hidden', '');
    else if(pendingScroll){
      const row = pendingScroll;
      pendingScroll = null;
      // la navegación sube al inicio de la página justo después de este evento
      setTimeout(()=>row.scrollIntoView?.({ block:'center', behavior:'smooth' }), 60);
    }
  });
  byId('backToQuiz')?.addEventListener('click', ()=>emit('nav:request', 'quiz'));

  // Un solo listener por host: los botones se regeneran en cada render.
  byId('topicTabs')?.addEventListener('click', e=>{
    const pill = e.target.closest('.topic-pill');
    if(pill) activateTopic(pill.dataset.target);
  });

  byId('notesHost')?.addEventListener('click', e=>{
    const head = e.target.closest('.acc-head');
    if(head) head.closest('.acc-item')?.classList.toggle('open');
  });
}