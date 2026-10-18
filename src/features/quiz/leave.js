// Confirmación al salir de una ronda a medias. Usa el modal de la app (no el confirm nativo).

let open = null;

export function askLeaveRound(onConfirm){
  if(open) return;
  const prev = document.activeElement;
  const back = document.createElement('div');
  back.className = 'pet-modal-backdrop';
  back.innerHTML = `
    <div class="pet-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="leaveTitle" aria-describedby="leaveText">
      <h2 id="leaveTitle">¿Salir de la ronda?</h2>
      <p id="leaveText">Tu progreso de esta ronda no se guardará.</p>
      <div class="pet-modal-actions">
        <button type="button" class="btn-mini equip-only" data-leave="stay">Seguir jugando</button>
        <button type="button" class="btn-mini pet-modal-ghost" data-leave="exit">Salir</button>
      </div>
    </div>`;
  document.body.appendChild(back);
  const btns = [...back.querySelectorAll('button')];

  const close = confirmed=>{
    document.removeEventListener('keydown', onKey, true);
    back.remove();
    open = null;
    if(confirmed) onConfirm();
    else if(prev && prev.focus && document.contains(prev)) prev.focus({ preventScroll:true });
  };
  function onKey(e){
    if(e.key === 'Escape'){ e.preventDefault(); close(false); }
    else if(e.key === 'Tab'){
      e.preventDefault();
      const i = btns.indexOf(document.activeElement);
      btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
    }
  }
  document.addEventListener('keydown', onKey, true);
  back.addEventListener('click', e=>{
    const b = e.target.closest('[data-leave]');
    if(b) close(b.dataset.leave === 'exit');
    else if(e.target === back) close(false);
  });
  open = back;
  btns[0].focus();
}
