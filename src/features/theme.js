// Tema claro / oscuro. Persiste en el store y se refleja en <html data-theme>.

import { byId } from '../core/dom.js';
import { getTheme, setTheme } from '../state/store.js';

const LABELS = {
  dark:  { emoji:'☀️', label:'Modo claro' },
  light: { emoji:'🌙', label:'Modo oscuro' },
};

export function applyTheme(t){
  document.documentElement.dataset.theme = t;
  const btn = byId('themeToggle');
  if(!btn) return;
  // localStorage es editable a mano: un tema inesperado no debe romper la app.
  const isDark = t === 'dark';
  const labels = isDark ? LABELS.dark : LABELS.light;
  btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  const emoji = btn.querySelector('.tt-emoji');
  const label = btn.querySelector('.tt-label');
  if(emoji) emoji.textContent = labels.emoji;
  if(label) label.textContent = labels.label;
}

export function initTheme(){
  byId('themeToggle')?.addEventListener('click', ()=>{
    applyTheme(setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
  });
  applyTheme(getTheme());
}