import { byId, clear, el } from '../../core/dom.js';
import { SURVIVOR_BALANCE } from './balance.js';
import { PET_WEAPONS } from './pets.js';
import { effectiveStats, powerById } from './powers.js';

const keys = new Set();
const touch = { active:false, id:null, startX:0, startY:0, x:0, y:0 };

let refs = null;
let cssWidth = SURVIVOR_BALANCE.worldWidth;
let cssHeight = SURVIVOR_BALANCE.worldHeight;
let dpr = 1;
let startHandler = null;
let questionKeyHandler = null;
let lastFocus = null;

function formatTime(seconds){
  const total = Math.max(0, Math.floor(seconds));
  const min = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function keyVector(){
  let x = 0, y = 0;
  if(keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
  if(keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
  if(keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
  if(keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
  return { x, y };
}

function touchVector(){
  if(!touch.active) return { x:0, y:0 };
  const dx = touch.x - touch.startX;
  const dy = touch.y - touch.startY;
  const len = Math.hypot(dx, dy);
  if(len < 12) return { x:0, y:0 };
  return { x:dx / len, y:dy / len };
}

function pointerPos(event){
  const rect = refs.shell.getBoundingClientRect?.() || { width:SURVIVOR_BALANCE.worldWidth, height:SURVIVOR_BALANCE.worldHeight };
  return { x:event.clientX - rect.left, y:event.clientY - rect.top };
}

function onKeyDown(event){
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(event.code)){
    keys.add(event.code);
    event.preventDefault();
  }
}

function onKeyUp(event){
  keys.delete(event.code);
}

function onPointerDown(event){
  if(event.pointerType === 'mouse') return;
  event.preventDefault();
  refs.shell.setPointerCapture?.(event.pointerId);
  const pos = pointerPos(event);
  touch.active = true;
  touch.id = event.pointerId;
  touch.startX = pos.x;
  touch.startY = pos.y;
  touch.x = pos.x;
  touch.y = pos.y;
}

function onPointerMove(event){
  if(!touch.active || event.pointerId !== touch.id) return;
  event.preventDefault();
  const pos = pointerPos(event);
  touch.x = pos.x;
  touch.y = pos.y;
}

function onPointerEnd(event){
  if(event.pointerId !== touch.id) return;
  touch.active = false;
  touch.id = null;
}

function ensureRefs(){
  if(refs) return refs;
  refs = {
    shell: byId('survivorShell'),
    canvas: byId('survivorCanvas'),
    mito: byId('survivorMito'),
    hudLife: byId('survivorLife'),
    hudXp: byId('survivorXp'),
    hudXpFill: byId('survivorXpFill'),
    hudTime: byId('survivorTime'),
    hudEnemies: byId('survivorEnemies'),
    overlay: byId('survivorOverlay'),
    card: byId('survivorOverlay')?.querySelector('.survivor-card'),
    overlayTitle: byId('survivorOverlayTitle'),
    overlayText: byId('survivorOverlayText'),
    overlayButton: byId('survivorStart'),
    build: byId('survivorBuild'),
    bossHud: byId('survivorBossHud'),
    bossLife: byId('survivorBossLife'),
    bossLifeFill: byId('survivorBossLifeFill'),
    bossShields: byId('survivorBossShields'),
  };
  refs.shell?.setAttribute('tabindex', '0');
  refs.canvas?.setAttribute('role', 'img');
  if(!refs.build && refs.shell){
    refs.build = el('div', { class:'survivor-build', attrs:{ id:'survivorBuild', 'aria-live':'polite' } });
    refs.shell.append(refs.build);
  }
  if(!refs.bossHud && refs.shell){
    refs.bossLife = el('b', { attrs:{ id:'survivorBossLife' }, text:'0/0' });
    refs.bossLifeFill = el('em', { attrs:{ id:'survivorBossLifeFill' } });
    refs.bossShields = el('b', { attrs:{ id:'survivorBossShields' }, text:'0' });
    refs.bossHud = el('div', { class:'survivor-boss-hud', attrs:{ id:'survivorBossHud', hidden:'' }, children:[
      el('span', { text:'Boss' }),
      refs.bossLife,
      el('i', { children:[refs.bossLifeFill] }),
      el('small', { children:[el('span', { text:'Escudos' }), refs.bossShields] }),
    ] });
    refs.shell.append(refs.bossHud);
  }
  return refs;
}

function markNode(){
  return el('div', { class:'survivor-mark', attrs:{ 'aria-hidden':'true' }, html:`
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4">
      <circle cx="32" cy="32" r="21"></circle>
      <path d="M32 9v46M9 32h46"></path>
      <path d="M44 20l8-8M20 44l-8 8M20 20l-8-8M44 44l8 8"></path>
    </svg>` });
}

function cleanupQuestionKeys(){
  if(!questionKeyHandler) return;
  window.removeEventListener('keydown', questionKeyHandler);
  questionKeyHandler = null;
}

function isVisible(){
  return refs?.shell?.closest('.view')?.classList.contains('active') || false;
}

export function cleanupInput(){
  keys.clear();
  touch.active = false;
  touch.id = null;
}

function prepareOverlay({ gameover = false } = {}){
  ensureRefs();
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if(refs.overlay){
    refs.overlay.hidden = false;
    refs.overlay.classList.toggle('is-gameover', gameover);
    refs.overlay.setAttribute('role', 'dialog');
    refs.overlay.setAttribute('aria-modal', 'true');
    refs.overlay.setAttribute('aria-labelledby', 'survivorOverlayTitle');
    refs.overlay.setAttribute('aria-describedby', 'survivorOverlayText');
  }
}

function restoreFocus(){
  if(lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

function showBasicOverlay({ title, text, buttonText, onClick, gameover = false }){
  ensureRefs();
  cleanupQuestionKeys();
  prepareOverlay({ gameover });
  clear(refs.card);
  refs.overlayTitle = el('h3', { text:title, attrs:{ id:'survivorOverlayTitle' } });
  refs.overlayText = el('p', { text, attrs:{ id:'survivorOverlayText' } });
  refs.overlayButton = el('button', { class:'btn btn-primary', text:buttonText, attrs:{ id:'survivorStart', type:'button' } });
  refs.overlayButton.addEventListener('click', onClick || startHandler);
  refs.card.append(markNode(), refs.overlayTitle, refs.overlayText, el('div', { class:'survivor-actions', children:[refs.overlayButton] }));
  if(isVisible()) refs.overlayButton.focus();
}

export function initView({ onStart }){
  ensureRefs();
  startHandler = onStart;
  refs.overlayButton?.addEventListener('click', onStart);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  refs.shell?.addEventListener('pointerdown', onPointerDown);
  refs.shell?.addEventListener('pointermove', onPointerMove);
  refs.shell?.addEventListener('pointerup', onPointerEnd);
  refs.shell?.addEventListener('pointercancel', onPointerEnd);
}

export function getInput(){
  const k = keyVector();
  const t = touchVector();
  return { x:k.x + t.x, y:k.y + t.y };
}

export function resizeCanvas(){
  ensureRefs();
  if(!refs.canvas || !refs.shell) return null;
  const rect = refs.shell.getBoundingClientRect();
  cssWidth = Math.max(1, rect.width || SURVIVOR_BALANCE.worldWidth);
  cssHeight = Math.max(1, rect.height || SURVIVOR_BALANCE.worldHeight);
  dpr = Math.max(1, Math.min(globalThis.devicePixelRatio || 1, 2));
  refs.canvas.width = Math.round(cssWidth * dpr);
  refs.canvas.height = Math.round(cssHeight * dpr);
  if(!refs.canvas.getContext) return null;
  const ctx = refs.canvas.getContext('2d');
  if(!ctx) return null;
  ctx.setTransform(dpr * cssWidth / SURVIVOR_BALANCE.worldWidth, 0, 0, dpr * cssHeight / SURVIVOR_BALANCE.worldHeight, 0, 0);
  ctx.clearRect(0, 0, SURVIVOR_BALANCE.worldWidth, SURVIVOR_BALANCE.worldHeight);
  return ctx;
}

export function getCanvasContext(){
  ensureRefs();
  if(!refs.canvas || !refs.canvas.getContext) return null;
  const ctx = refs.canvas.getContext('2d');
  if(!ctx) return null;
  ctx.setTransform(dpr * cssWidth / SURVIVOR_BALANCE.worldWidth, 0, 0, dpr * cssHeight / SURVIVOR_BALANCE.worldHeight, 0, 0);
  return ctx;
}

export function syncMito(snapshot){
  ensureRefs();
  if(!refs.mito || !snapshot) return;
  const size = SURVIVOR_BALANCE.render.playerDomSize;
  const x = snapshot.player.x / snapshot.world.width * cssWidth - size / 2;
  const y = snapshot.player.y / snapshot.world.height * cssHeight - size / 2;
  refs.mito.style.transform = `translate(${x}px, ${y}px)`;
  refs.mito.classList.toggle('survivor-hit', snapshot.player.invulnerable > 0);
}

export function renderHud(snapshot){
  ensureRefs();
  if(!snapshot) return;
  refs.hudLife.textContent = `${Math.max(0, Math.round(snapshot.player.life))}/${SURVIVOR_BALANCE.player.maxLife}`;
  const nextXp = snapshot.xpToNext || 1;
  const currentXp = Math.max(0, Math.floor(snapshot.xp || 0));
  refs.hudXp.textContent = `${currentXp}/${nextXp}`;
  refs.hudXpFill.style.width = `${Math.max(0, Math.min(100, currentXp / nextXp * 100))}%`;
  refs.hudTime.textContent = formatTime(snapshot.time);
  refs.hudEnemies.textContent = String(snapshot.enemies.length);
  if(refs.bossHud){
    const boss = snapshot.boss;
    const active = Boolean(boss?.active);
    refs.bossHud.hidden = !active;
    if(active){
      const maxLife = Math.max(1, Math.round(boss.maxLife || 1));
      const life = Math.max(0, Math.round(boss.life || 0));
      refs.bossLife.textContent = `${life}/${maxLife}`;
      refs.bossLifeFill.style.width = `${Math.max(0, Math.min(100, life / maxLife * 100))}%`;
      refs.bossShields.textContent = `${Math.max(0, boss.shields || 0)}/${Math.max(0, boss.maxShields || 0)}`;
    }
  }
}

export function renderBuild(session){
  ensureRefs();
  if(!refs.build || !session) return;
  const powers = Object.entries(session.powers || {}).filter(([, level])=>level > 0);
  const stats = effectiveStats(session);
  const items = [
    el('li', { children:[el('span', { text:'Chispa de Mito' }), el('b', { text:`Nv. ${session.chispaLevel || 1}` })] }),
  ];
  if(session.petWeapon){
    const pet = PET_WEAPONS[session.petWeapon.petId];
    const level = Math.max(0, Math.round(Number(session.petWeapon.level) || 0));
    items.push(el('li', { children:[el('span', { text:pet?.name || 'Arma de mascota' }), el('b', { text:level > 0 ? `Nv. ${level}` : 'Sin arma' })] }));
  }
  for(const [id, level] of powers){
    const power = powerById(id);
    items.push(el('li', { children:[el('span', { text:power?.name || id }), el('b', { text:`Nv. ${level}` })] }));
  }

  clear(refs.build);
  refs.build.append(
    el('strong', { text:'Build' }),
    el('ul', { children:items }),
    el('p', { text:`Vida ${stats.maxLife} · Velocidad ${stats.playerSpeed} · Iman ${stats.pickupRadius}` })
  );
}

export function showIntro(){
  ensureRefs();
  cleanupInput();
  showBasicOverlay({
    title:'Mito Survivor',
    text:'Muévete con WASD, flechas o arrastrando el dedo. Recoge gemas, sube de nivel y responde preguntas de la materia activa.',
    buttonText:'Iniciar partida',
  });
  refs.hudLife.textContent = `${SURVIVOR_BALANCE.player.maxLife}/${SURVIVOR_BALANCE.player.maxLife}`;
  refs.hudXp.textContent = `0/${SURVIVOR_BALANCE.xp.baseToNext}`;
  refs.hudXpFill.style.width = '0%';
  refs.hudTime.textContent = '0:00';
  refs.hudEnemies.textContent = '0';
  if(refs.bossHud) refs.bossHud.hidden = true;
  refs.mito.style.transform = 'translate(-9999px, -9999px)';
}

export function showPlay(){
  ensureRefs();
  cleanupQuestionKeys();
  if(refs.overlay) refs.overlay.hidden = true;
  restoreFocus();
}

export function showNoQuestions(courseLabel){
  showBasicOverlay({
    title:'No hay preguntas',
    text:`La materia ${courseLabel} todavía no tiene banco de preguntas. El modo Survivor necesita preguntas para subir de nivel.`,
    buttonText:'Entendido',
    onClick:showIntro,
  });
}

export function showQuestion(item, { onAnswer, onContinue, titleText = 'Pregunta de nivel', progressText = '' }){
  ensureRefs();
  cleanupQuestionKeys();
  prepareOverlay();
  clear(refs.card);
  const title = el('h3', { text:titleText, attrs:{ id:'survivorOverlayTitle' } });
  const text = el('p', { text:item.q, attrs:{ id:'survivorOverlayText' } });
  const result = el('div', { class:'survivor-result', attrs:{ 'aria-live':'assertive', role:'status' } });
  const options = el('div', { class:'survivor-question-options' });
  const continueButton = el('button', { class:'btn btn-primary', text:'Continuar', attrs:{ type:'button', hidden:'' } });
  let answered = false;

  const buttons = item.opts.map((opt, i)=>{
    const button = el('button', { class:'survivor-option', text:`${i + 1}. ${opt}`, attrs:{ type:'button' } });
    button.addEventListener('click', ()=>answer(i));
    options.append(button);
    return button;
  });

  function answer(idx){
    if(answered) return;
    answered = true;
    buttons.forEach((button, i)=>{
      button.disabled = true;
      if(i === item.correct) button.classList.add('is-correct');
      if(i === idx && i !== item.correct) button.classList.add('is-wrong');
    });
    const outcome = onAnswer(idx);
    if(outcome.correct){
      result.textContent = outcome.resultText || 'Correcto. Elige una mejora para tu build.';
      if(outcome.continueText){
        continueButton.textContent = outcome.continueText;
        continueButton.hidden = false;
        continueButton.focus();
      }
      return;
    }
    const penalties = outcome.penalties || [];
    clear(result);
    result.append(el('p', { text:`Incorrecto. ${outcome.exp || 'Revisa esta idea antes de seguir.'}` }));
    if(penalties.length){
      result.append(el('p', { text:penalties.map(change=>{
        if(change.to <= 0) return `Perdiste ${change.name} nivel ${change.from}.`;
        return `Perdiste ${change.name} nivel ${change.from} a ${change.to}.`;
      }).join(' ') }));
    }
    else if(outcome.penaltyText){
      result.append(el('p', { text:outcome.penaltyText }));
    }
    else{
      result.append(el('p', { text:'No perdiste equipo porque no hay nada que degradar.' }));
    }
    continueButton.hidden = false;
    continueButton.focus();
  }

  continueButton.addEventListener('click', onContinue);
  questionKeyHandler = event=>{
    if(event.key >= '1' && event.key <= '4'){
      event.preventDefault();
      answer(Number(event.key) - 1);
    }
    if(event.key === 'Enter' && !continueButton.hidden){
      event.preventDefault();
      onContinue();
    }
  };
  window.addEventListener('keydown', questionKeyHandler);

  const children = [markNode(), title];
  if(progressText) children.push(el('p', { class:'survivor-progress', text:progressText }));
  children.push(text, options, result, el('div', { class:'survivor-actions', children:[continueButton] }));
  refs.card.append(...children);
  if(isVisible()) buttons[0]?.focus();
}

export function showUpgradeOptions(session, { onSelect, onReroll }){
  ensureRefs();
  cleanupQuestionKeys();
  prepareOverlay();
  clear(refs.card);

  const title = el('h3', { text:'Elige una mejora', attrs:{ id:'survivorOverlayTitle' } });
  const text = el('p', { text:'Selecciona una carta para cambiar la build de esta partida.', attrs:{ id:'survivorOverlayText' } });
  const options = el('div', { class:'survivor-upgrades' });
  const cards = (session.upgradeOptions || []).map(option=>{
    const button = el('button', { class:'survivor-upgrade', attrs:{ type:'button' }, children:[
      el('strong', { text:option.name }),
      el('span', { text:`Nivel ${option.currentLevel} a ${option.nextLevel}` }),
    ] });
    button.addEventListener('click', ()=>onSelect(option.id));
    options.append(button);
    return button;
  });

  if(!cards.length){
    options.append(el('p', { text:'No quedan mejoras disponibles para esta build.' }));
  }

  const reroll = el('button', {
    class:'btn btn-ghost',
    text:`Cambiar opciones (${session.rerolls || 0})`,
    attrs:{ type:'button' },
  });
  reroll.disabled = !session.rerolls;
  reroll.addEventListener('click', onReroll);
  const continueButton = el('button', { class:'btn btn-primary', text:'Continuar', attrs:{ type:'button' } });
  continueButton.hidden = cards.length > 0;
  continueButton.addEventListener('click', ()=>onSelect(null));

  refs.card.append(markNode(), title, text, options, el('div', { class:'survivor-actions', children:[reroll, continueButton] }));
  if(isVisible()) cards[0]?.focus();
}

export function showSummary(summary){
  ensureRefs();
  const totalAnswers = Math.max(0, (summary.correctAnswers || 0) + (summary.wrongAnswers || 0));
  const precision = totalAnswers ? Math.round((summary.correctAnswers || 0) / totalAnswers * 100) : 0;
  showBasicOverlay({
    title:'Resumen final',
    text:`Sobreviviste ${formatTime(summary.time)} y ganaste ${summary.awardedChispas} chispas.${summary.bossDefeated ? ' Derrotaste al boss final.' : ''}`,
    buttonText:'Jugar otra vez',
    gameover:true,
  });
  const list = el('div', { class:'survivor-summary', children:[
    el('div', { children:[el('span', { text:'Tiempo' }), el('b', { text:formatTime(summary.time) })] }),
    el('div', { children:[el('span', { text:'Nivel' }), el('b', { text:String(summary.level) })] }),
    el('div', { children:[el('span', { text:'Precision' }), el('b', { text:`${precision}%` })] }),
    el('div', { children:[el('span', { text:'Racha maxima' }), el('b', { text:String(summary.maxCorrectStreak || 0) })] }),
    el('div', { children:[el('span', { text:'Correctas' }), el('b', { text:String(summary.correctAnswers) })] }),
    el('div', { children:[el('span', { text:'Fallos' }), el('b', { text:String(summary.wrongAnswers) })] }),
    el('div', { children:[el('span', { text:'Chispas' }), el('b', { text:String(summary.awardedChispas) })] }),
    el('div', { children:[el('span', { text:'Boss derrotado' }), el('b', { text:summary.bossDefeated ? 'Si' : 'No' })] }),
  ] });
  refs.card.insertBefore(list, refs.card.querySelector('.survivor-actions'));
}
