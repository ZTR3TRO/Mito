import { on } from '../../core/bus.js';
import { addChispas, getEquipped, recordAnswer } from '../../state/store.js';
import { activeCourse } from '../course/course.js';
import { applyAvatar } from '../mascot/avatar.js';
import { createEngine } from './engine.js';
import { createPetWeapon } from './pets.js';
import { hasQuestionBank, nextSurvivorQuestion, resetQuestionDeck } from './questions.js';
import { applySurvivorUpgrade, completeRevive, endSession, getSession, pauseSession, prepareUpgradeOptions, recordBossAnswer, recordLevelUp, recordReviveAnswer, recordSurvivorAnswer, resetSession, resumeSession, spendReroll, startReviveChallenge, startSession, updateSessionFromEngine } from './session.js';
import { getCanvasContext, getInput, initView, renderBuild, renderHud, resizeCanvas, showNoQuestions, showQuestion, showSummary, showIntro, showPlay, showUpgradeOptions, startGameInput, stopGameInput, syncMito } from './view.js';
import { CHISPA_MITO_ID } from './weapons.js';

let engine = null;
let resizeHandler = null;
let pausedByVisibility = false;

function stopEngine(){
  engine?.stop();
  engine = null;
  stopGameInput();
}

function draw(snapshot){
  const ctx = getCanvasContext();
  if(ctx && engine) engine.render(ctx);
  syncMito(snapshot);
  renderHud(snapshot);
  updateSessionFromEngine(snapshot);
}

function applyEngineLevels(current){
  engine?.setWeaponLevel(CHISPA_MITO_ID, current.chispaLevel);
  if(current.petWeapon) engine?.setWeaponLevel(current.petWeapon.id, current.petWeapon.level);
}

function resumeGame(){
  resumeSession();
  showPlay();
  engine?.resume();
}

function finishGame(reason, snapshot){
  updateSessionFromEngine(snapshot);
  const summary = endSession(reason);
  addChispas(summary.awardedChispas);
  draw(snapshot);
  stopEngine();
  showSummary(summary);
}

function askBossShieldQuestion(snapshot){
  pauseSession();
  draw(snapshot);
  const item = nextSurvivorQuestion();
  if(!item){
    finishGame('no-questions', snapshot);
    return;
  }
  showQuestion(item, {
    titleText:'Escudo del boss',
    progressText:`Escudos restantes: ${snapshot.boss?.shields || 0}`,
    onAnswer:idx=>{
      const correct = idx === item.correct;
      recordAnswer(activeCourse().id, item.q, correct);
      recordBossAnswer(correct);
      if(correct){
        const next = engine?.breakBossShield() || snapshot;
        draw(next);
        const shields = next.boss?.shields || 0;
        return {
          correct,
          exp:item.exp,
          resultText:shields > 0 ? 'Correcto. Rompiste un escudo y el boss queda congelado.' : 'Correcto. El boss ya es vulnerable.',
          continueText:'Volver al combate',
        };
      }
      const next = engine?.pressureBoss() || snapshot;
      draw(next);
      return { correct, exp:item.exp, penalties:[], penaltyText:'El boss aumenta la presión y llama más enemigos.' };
    },
    onContinue:resumeGame,
  });
}

function showUpgradeMenu(current){
  showUpgradeOptions(current, {
    onSelect:id=>{
      const next = applySurvivorUpgrade(id);
      applyEngineLevels(next);
      renderBuild(next);
      resumeGame();
    },
    onReroll:()=>{
      const next = spendReroll();
      showUpgradeMenu(next);
    },
  });
}

function askLevelQuestion(snapshot){
  pauseSession();
  recordLevelUp(snapshot);
  draw(snapshot);
  const item = nextSurvivorQuestion();
  if(!item){
    finishGame('no-questions', snapshot);
    return;
  }
  showQuestion(item, {
    onAnswer:idx=>{
      const correct = idx === item.correct;
      recordAnswer(activeCourse().id, item.q, correct);
      const next = recordSurvivorAnswer(correct);
      if(correct){
        showUpgradeMenu(prepareUpgradeOptions());
      }
      else{
        applyEngineLevels(next);
        renderBuild(next);
      }
      return { correct, exp:item.exp, penalties:next.penaltyChanges || [] };
    },
    onContinue:resumeGame,
  });
}

function askReviveQuestion(snapshot){
  const current = getSession();
  const item = nextSurvivorQuestion();
  if(!item){
    finishGame('dead', snapshot);
    return;
  }

  let failedRevive = false;
  showQuestion(item, {
    titleText:'Reto de revivida',
    progressText:`Pregunta ${Math.min(3, current.reviveProgress + 1)} de 3`,
    onAnswer:idx=>{
      const correct = idx === item.correct;
      recordAnswer(activeCourse().id, item.q, correct);
      const next = recordReviveAnswer(correct);
      if(!correct){
        failedRevive = true;
        return { correct, exp:item.exp, penalties:[], continueText:'Ver resumen' };
      }
      if(next.reviveProgress >= 3){
        const revived = engine?.revive(Math.ceil(next.maxLife * 0.5)) || snapshot;
        const revivedSession = completeRevive(revived);
        renderBuild(revivedSession);
        draw(revived);
        return { correct, exp:item.exp, resultText:'Correcto. Revives con media vida y la misma build.', continueText:'Volver a la partida' };
      }
      return { correct, exp:item.exp, resultText:'Correcto. Sigue el repaso para revivir.', continueText:'Siguiente pregunta' };
    },
    onContinue:()=>{
      if(failedRevive){
        finishGame('dead', snapshot);
        return;
      }
      const next = getSession();
      if(next.reviveProgress >= 3){
        resumeGame();
        return;
      }
      askReviveQuestion(snapshot);
    },
  });
}

function handlePlayerDead(snapshot){
  const current = getSession();
  if(current.reviveUsed){
    finishGame('dead', snapshot);
    return;
  }
  startReviveChallenge(snapshot);
  draw(snapshot);
  askReviveQuestion(snapshot);
}

function startGame(){
  const course = activeCourse();
  if(!hasQuestionBank()){
    showNoQuestions(course.label);
    return;
  }
  stopEngine();
  resetQuestionDeck();
  const petWeapon = createPetWeapon(getEquipped().pet);
  const current = startSession(petWeapon);
  showPlay();
  startGameInput();
  renderBuild(current);
  applyAvatar();

  engine = createEngine({
    getInput,
    petWeapon,
    onFrame: draw,
    onPlayerDead:handlePlayerDead,
    onLevelUp:askLevelQuestion,
    onBossShieldReady:askBossShieldQuestion,
    onGameWon:snapshot=>finishGame('won', snapshot),
  });

  resizeCanvas();
  draw(engine.start());
}

export function renderIntro(){
  stopEngine();
  const current = resetSession();
  resizeCanvas();
  showIntro();
  renderBuild(current);
}

export function init(){
  initView({ onStart:startGame });
  resizeHandler = ()=>{
    const ctx = resizeCanvas();
    if(ctx && engine){
      engine.render(ctx);
      const snapshot = engine.snapshot();
      syncMito(snapshot);
      renderHud(snapshot);
    }
  };
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('visibilitychange', ()=>{
    if(document.hidden){
      pausedByVisibility = getSession().status === 'running';
      if(pausedByVisibility){
        pauseSession();
        engine?.pause();
      }
      return;
    }
    if(pausedByVisibility){
      pausedByVisibility = false;
      resumeSession();
      engine?.resume();
    }
  });

  on('nav:after', view=>{
    if(view !== 'survivor'){
      renderIntro();
    }
  });

  on('course:changed', renderIntro);
  on('state:imported', renderIntro);
  on('state:reset', renderIntro);
}
