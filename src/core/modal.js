// Diálogo modal genérico con el estilo de la app (no el confirm/alert nativo).
// Sin dominio: quien lo usa pone los textos y las acciones. Esc o tocar fuera = cancelar (la última acción
// "ghost" o, si no hay, no hace nada). Tab queda atrapado entre los botones.
//
// actions: [{ label, ghost?, danger?, onClick? }] (danger = acción destructiva). El primer botón recibe el foco; el modal se cierra al pulsar cualquiera.

let open = null;

export function openModal({ title, text, actions }){
  if(open) return;
  const prev = document.activeElement;
  const back = document.createElement('div');
  back.className = 'pet-modal-backdrop';
  const card = document.createElement('div');
  card.className = 'pet-modal-card';
  card.setAttribute('role', 'alertdialog');
  card.setAttribute('aria-modal', 'true');
  const h = document.createElement('h2');
  h.textContent = title;
  const p = document.createElement('p');
  p.textContent = text;
  const row = document.createElement('div');
  row.className = 'pet-modal-actions';
  card.append(h, p, row);
  back.appendChild(card);

  const btns = actions.map(a=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-mini ' + (a.ghost ? 'pet-modal-ghost' : a.danger ? 'pet-modal-danger' : 'equip-only');
    b.textContent = a.label;
    b.onclick = ()=>close(a);
    row.appendChild(b);
    return b;
  });
  const cancel = actions.find(a=>a.ghost) || null;

  function close(action){
    document.removeEventListener('keydown', onKey, true);
    back.remove();
    open = null;
    if(prev && prev.focus && document.contains(prev)) prev.focus({ preventScroll:true });
    action?.onClick?.();
  }
  function onKey(e){
    if(e.key === 'Escape'){ e.preventDefault(); close(cancel); }
    else if(e.key === 'Tab'){
      e.preventDefault();
      const i = btns.indexOf(document.activeElement);
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  }
  document.addEventListener('keydown', onKey, true);
  back.addEventListener('click', e=>{ if(e.target === back) close(cancel); });
  document.body.appendChild(back);
  open = back;
  btns[0].focus();
}
