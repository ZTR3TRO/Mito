// Respaldo del progreso: exportar, importar y reiniciar todo.
// Los botones se declaran en index.html con data-progress.

import { clearMistakes, exportSave, importSave, resetAll } from '../../state/store.js';
import { emit } from '../../core/bus.js';
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

function pickSaveFile(btn){
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json,.json';
  inp.onchange = ()=>{
    const file = inp.files[0];
    if(!file) return;
    const fr = new FileReader();
    fr.onload = ()=>{
      try{
        importSave(fr.result);
      }catch(err){
        alert('Ese archivo no parece un progreso válido.');
        return;
      }
      emit('state:imported');
      sparkAt(btn, '📥');
    };
    fr.readAsText(file);
  };
  inp.click();
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
        if(!confirm('¿Reiniciar TODO el progreso? Chispas, armario, racha e historial volverán a cero.')) return;
        resetAll();
        emit('state:reset');
        break;
      case 'limpiar-errores':
        clearMistakes();
        emit('state:imported');
        sparkAt(btn, '🧽');
        break;
    }
  });
}