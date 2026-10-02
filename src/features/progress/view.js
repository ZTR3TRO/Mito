// Vista de progreso: temas débiles, historial de rondas y lista de fallos.

import { clear, byId } from '../../core/dom.js';
import { getHistory } from '../../state/store.js';
import { escapeHtml, pctColor } from '../../core/utils.js';
import { weakTopics, activeMistakeEntries, findQuestionByKey } from '../quiz/review.js';

function renderWeakTopics(){
  const host = byId('weakTopics');
  if(!host) return;
  const weak = weakTopics();
  if(weak.length === 0){
    host.innerHTML = `<div class="empty-state">Juega al menos 3 preguntas por tema y verás aquí tus temas débiles 📊</div>`;
    return;
  }
  host.innerHTML = weak.map(t=>`
    <div class="wt-row">
      <div class="wt-name">${escapeHtml(t.cat)}</div>
      <div class="wt-num">${Math.round(t.pct*100)}% <small>· ${t.r}/${t.t}</small></div>
      <div class="cb-track"><div class="cb-fill" style="width:${t.pct*100}%; background:${pctColor(t.pct*100)}"></div></div>
    </div>`).join('');
}

function renderHistory(){
  const host = byId('historyList');
  if(!host) return;
  const hist = getHistory();
  if(hist.length === 0){
    host.innerHTML = `<div class="empty-state">Aún no hay rondas registradas. ¡Juega el quiz y tu progreso se guardará aquí! 🎮</div>`;
    return;
  }
  host.innerHTML = hist.slice(-8).reverse().map(h=>{
    const d = new Date(h.t).toLocaleDateString('es-MX', { day:'numeric', month:'short' });
    const aprobada = h.pct >= 70;
    return `
      <div class="hist-row">
        <div class="hist-date">${d}</div>
        <div class="cb-track"><div class="cb-fill" style="width:${h.pct}%; background:${pctColor(h.pct)}"></div></div>
        <div class="hist-pct">${h.pct}%</div>
        <div class="hist-score">${h.score} pts${aprobada ? ' · 🎉' : ''}</div>
      </div>`;
  }).join('');
}

function renderMistakes(){
  const host = byId('mistakesList');
  if(!host) return;
  const pending = activeMistakeEntries();
  if(pending.length === 0){
    host.innerHTML = `<div class="empty-state">Sin fallos registrados en esta materia. Sigue así 💪</div>`;
    return;
  }
  const cards = pending.map(([k, m])=>{
    const item = findQuestionByKey(k);
    if(!item) return '';
    return `
      <div class="mistake-card">
        <div class="mc-top"><span class="q-cat" style="margin:0">${item.cat.toUpperCase()}</span>
          <span class="mc-ratio">✖${m.wrong} · ✔${m.right}</span>
        </div>
        <p class="mc-q">${item.q}</p>
        <div class="mc-correct">✓ ${escapeHtml(item.opts[item.correct])}</div>
        <div class="mc-exp">${item.exp}</div>
      </div>`;
  }).join('');

  host.innerHTML = cards + `
    <div class="mistake-actions">
      <div class="hero-actions" style="justify-content:center;">
        <button class="btn btn-primary" data-action="goReview">🎯 Repasar estos fallos</button>
        <button class="btn btn-ghost" data-progress="limpiar-errores" style="background:var(--pink-pale); color:var(--pink-deep); border-color:var(--pink);">Limpiar lista</button>
      </div>
    </div>`;
}

function renderStats(){
  const host = byId('progressStats');
  if(!host) return;
  const hist = getHistory();
  const total = hist.length;
  const avg = total ? Math.round(hist.reduce((s,h)=>s+h.pct,0)/total) : 0;
  const best = total ? Math.max(...hist.map(h=>h.pct)) : 0;
  clear(host);
  host.innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-lab">rondas jugadas</div></div>
    <div class="stat-card mint"><div class="stat-num">${avg}%</div><div class="stat-lab">promedio general</div></div>
    <div class="stat-card"><div class="stat-num">${best}%</div><div class="stat-lab">mejor ronda</div></div>`;
}

export function renderProgress(){
  if(!byId('weakTopics')) return;
  renderWeakTopics();
  renderHistory();
  renderMistakes();
  renderStats();
}

// Resumen en la sidebar: rondas jugadas y última ronda.
export function renderSidebarStats(){
  const hist = getHistory();
  const n = hist.length;
  const last = hist[n-1];
  const label = byId('sideProgressLabel');
  const bar = byId('sideProgressBar');
  if(!label || !bar) return;
  if(n === 0){
    label.textContent = 'Aún no juegas — 0 rondas';
    bar.style.width = '0%';
    return;
  }
  label.textContent = `${n} ronda${n===1?'':'s'} jugada${n===1?'':'s'} · última: ${last.pct}%`;
  bar.style.width = last.pct + '%';
}