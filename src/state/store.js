// Acceso al estado persistido. Punto único de entrada a la partida guardada.
//
// La implementación está partida por dominio: core guarda y carga, y cada módulo
// sibling (economy, inventory, progress, preferences, backup) expone su parte.
// Este fichero solo reexporta, de modo que la app importa siempre desde aquí y la
// API pública no cambia respecto a la versión anterior: mismos nombres, misma
// semántica, mismos errores.

export { state, KEY, onChange } from './core.js';

export { PASSING_BONUS, getChispas, addChispas, spendChispas } from './economy.js';

export {
  owns, ownItem, getEquipped, equipCategory,
  unlockSecrets, secretsUnlocked, buyAndEquip,
} from './inventory.js';

export {
  recordQuizResult, getHistory, recordAnswer,
  getMistakes, clearMistakes, getStreak,
} from './progress.js';

export { getTheme, setTheme, getCourse, setCourse } from './preferences.js';

export { exportSave, importSave, resetAll } from './backup.js';
