// Reacciones de Mito y de la mascota compañera durante el quiz. Durante una ronda no hay temporizador (speech.js lo pausa):
// solo hablan cuando pasa algo. En cada evento habla uno solo y se alternan (Mito empieza); sin mascota, habla Mito.
// Las dos reacciones salen en la pantalla del quiz, junto a la mascota de arriba (Mito a la derecha, la mascota a la izquierda),
// en móvil y escritorio; el panel lateral no las repite. Las frases están en content/quizMessages.js (nunca dan pistas).

import { on } from '../../core/bus.js';
import { byId } from '../../core/dom.js';
import { getEquipped } from '../../state/store.js';
import { findItem } from '../../content/wardrobe.js';
import { resultMessage, resultTier } from '../../content/messages.js';
import { MITO_QUIZ, PET_QUIZ, quizMessage } from '../../content/quizMessages.js';
import { quizSay, petSpeak, hideReactions } from './speech.js';

const STREAK_MIN = 3;   // a partir de cuántas seguidas se nota el combo
const lastMsg = {};
let turn = 0;

const petKey = ()=>{
  const k = (findItem('pet', getEquipped().pet) || {}).k;
  return PET_QUIZ[k] ? k : null;
};

// kind: correct | streak | wrong | lastLife | lastQuestion | finish (con pct)
function react(kind, { n = '', pct = 0, outOfLives = false } = {}){
  hideReactions();
  const pet = petKey();
  const petTurn = !!pet && turn % 2 === 1;
  turn++;
  if(petTurn){
    const pool = PET_QUIZ[pet][kind === 'finish' ? { great: 'finishGreat', ok: 'finishOk', low: 'finishLow' }[resultTier(pct, outOfLives)] : kind];
    const key = pet + kind;
    const msg = lastMsg[key] = quizMessage(pool, lastMsg[key], n);
    petSpeak(msg, byId('mascotQuiz'), byId('mascotResult'));
    return;
  }
  const msg = kind === 'finish' ? resultMessage(pct, outOfLives) : (lastMsg[kind] = quizMessage(MITO_QUIZ[kind], lastMsg[kind], n));
  quizSay(msg);
}

export function init(){
  on('quiz:started', ()=>{ turn = 0; });
  on('quiz:answered', ({ correct, streak, lives })=>{
    if(correct) react(streak >= STREAK_MIN ? 'streak' : 'correct', { n: streak });
    else react(lives === 1 ? 'lastLife' : 'wrong');
  });
  on('quiz:question', ({ last, index })=>{ if(last && index > 0) react('lastQuestion'); });
  on('quiz:finished', ({ pct, outOfLives })=> react('finish', { pct, outOfLives }));
}
