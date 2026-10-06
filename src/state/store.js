// Acceso al estado persistido. Punto único de entrada a la partida guardada.
//
// La implementación está partida por dominio: core guarda y carga, y cada módulo
// sibling (economy, inventory, progress, preferences, backup) expone su parte.
// Este fichero solo reexporta la API pública: lo que la app necesita desde fuera.
// Los módulos de state/ se importan entre sí directamente desde ./core.js, sin
// pasar por aquí, y lo interno no se reexporta.

export { PASSING_BONUS, getChispas, addChispas } from './economy.js';

export {
  owns, getEquipped, equipCategory,
  getPetName, getPetDisplayName, renamePet,
  unlockSecrets, secretsUnlocked, buyAndEquip,
} from './inventory.js';

export {
  recordQuizResult, getHistory, recordAnswer,
  getMistakes, clearMistakes, getStreak,
} from './progress.js';

export { getTheme, setTheme, getCourse, setCourse } from './preferences.js';

export { exportSave, importSave, resetAll } from './backup.js';
