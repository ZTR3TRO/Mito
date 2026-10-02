// Apuntes: pestañas de temas y acordeón de preguntas con su respuesta.

import { el, clear, byId } from '../../core/dom.js';
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

export function initNotes(){
  // Un solo listener por host: los botones se regeneran en cada render.
  byId('topicTabs')?.addEventListener('click', e=>{
    const pill = e.target.closest('.topic-pill');
    if(!pill) return;
    document.querySelectorAll('.topic-pill').forEach(p=>p.classList.remove('active'));
    pill.classList.add('active');
    document.querySelectorAll('.note-block').forEach(b=>b.classList.remove('active'));
    document.getElementById(pill.dataset.target)?.classList.add('active');
  });

  byId('notesHost')?.addEventListener('click', e=>{
    const head = e.target.closest('.acc-head');
    if(head) head.closest('.acc-item')?.classList.toggle('open');
  });
}