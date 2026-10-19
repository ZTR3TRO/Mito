// Respaldo del progreso: exportar, importar y reiniciar todo.
// Los botones se declaran en index.html con data-progress.

import { clearMistakes, exportSave, parseSave, importSave, resetAll } from '../../state/store.js';
import { emit } from '../../core/bus.js';
import { openModal } from '../../core/modal.js';
import { sparkAt } from '../mascot/effects.js';

const FILE_NAME = 'chispa-atp-progreso.json';

function downloadSave(){
  const blob = new Blob([exportSave()], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Lee el archivo y lo valida ANTES de preguntar: si no sirve, se avisa y no se toca nada.
// Solo con un archivo válido se pide confirmar el reemplazo del progreso actual.
function pickSaveFile(btn){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json,.json';
  inp.onchange = ()=>{
    const file = inp.files[0];
    if(!file) return;
    const fr = new FileReader();
    fr.onload = ()=>{
      let incoming;
      try{
        incoming = parseSave(fr.result);
      }catch(err){
        openModal({
          title: 'No se pudo importar',
          text: `${err.message} Tu progreso actual sigue igual.`,
          actions: [{ label:'Entendido' }],
        });
        return;
      }
      confirmImport(incoming, fr.result, btn);
    };
    fr.onerror = ()=> openModal({ title:'No se pudo importar', text:'No se pudo leer el archivo. Tu progreso actual sigue igual.', actions:[{ label:'Entendido' }] });
    fr.readAsText(file);
  };
  inp.click();
}

function confirmImport(incoming, json, btn){
  const n = incoming.history.length;
  openModal({
    title: '¿Reemplazar tu progreso?',
    text: `El archivo trae ${n} ronda${n === 1 ? '' : 's'}, ${incoming.chispas} ⚡ chispas y ${Object.keys(incoming.owned).length} compras. Se reemplazará todo lo que tienes ahora y no se puede deshacer.`,
    actions: [
      { label:'Sí, importar', onClick: ()=>{
        importSave(json);
        emit('state:imported');
        sparkAt(btn, '📥');
      } },
      { label:'Cancelar', ghost:true },
    ],
  });
}

// Destructivo: el foco empieza en "Cancelar" (primera acción) y Esc o tocar fuera también cancelan.
function confirmReset(){
  openModal({
    title: '¿Reiniciar todo el progreso?',
    text: 'Se borrará todo: chispas, compras, mascotas, historial y fallos. No se puede deshacer. Antes de seguir te recomendamos usar "Exportar progreso" para guardar una copia.',
    actions: [
      { label:'Cancelar', ghost:true },
      { label:'Sí, borrar todo', danger:true, onClick: ()=>{
        resetAll();
        emit('state:reset');
      } },
    ],
  });
}

export function init(){
  document.addEventListener('click', e=>{
    const btn = e.target.closest('[data-progress]');
    if(!btn) return;

    switch(btn.dataset.progress){
      case 'export':
        downloadSave();
        sparkAt(btn, '💾');
        break;
      case 'import':
        pickSaveFile(btn);
        break;
      case 'reset':
        confirmReset();
        break;
      case 'limpiar-errores':
        clearMistakes();
        emit('state:imported');
        sparkAt(btn, '🧽');
        break;
    }
  });
}