import { byId, clear, el } from '../../core/dom.js';
import { computeWorld, SURVIVOR_BALANCE } from './balance.js';
import { PET_WEAPONS } from './pets.js';
import { powerById } from './powers.js';

const keys = new Set();
const touch = { active:false, id:null, startX:0, startY:0, x:0, y:0 };
const keyInput = { x:0, y:0 };
const touchInput = { x:0, y:0 };
const combinedInput = { x:0, y:0 };

let refs = null;
let cssWidth = SURVIVOR_BALANCE.world.maxWidth;
let cssHeight = SURVIVOR_BALANCE.world.height;
let dpr = 1;
let currentWorld = computeWorld(cssWidth, cssHeight);
let offsetX = 0;
let startHandler = null;
let pauseHandler = null;
let exitHandler = null;
let orientationPauseHandler = null;
let questionKeyHandler = null;
let lastFocus = null;
let keyboardActive = false;
let keyboardListening = false;
let lastHud = {};
let playModeActive = false;
let escapeHandler = null;
let orientationQuery = null;
let orientationHandler = null;
let popstateHandler = null;
let historyPushed = false;
let viewListening = false;
let listeningShell = null;

function reducedMotion(){
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function softVibrate(ms){
  if(reducedMotion()) return;
  globalThis.navigator?.vibrate?.(ms);
}

function formatTime(seconds){
  const total = Math.max(0, Math.floor(seconds));
  const min = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function keyVector(){
  keyInput.x = 0;
  keyInput.y = 0;
  if(keys.has('ArrowLeft') || keys.has('KeyA')) keyInput.x -= 1;
  if(keys.has('ArrowRight') || keys.has('KeyD')) keyInput.x += 1;
  if(keys.has('ArrowUp') || keys.has('KeyW')) keyInput.y -= 1;
  if(keys.has('ArrowDown') || keys.has('KeyS')) keyInput.y += 1;
  return keyInput;
}

function touchVector(){
  touchInput.x = 0;
  touchInput.y = 0;
  if(!touch.active) return touchInput;
  const dx = touch.x - touch.startX;
  const dy = touch.y - touch.startY;
  const len = Math.hypot(dx, dy);
  if(len < 12) return touchInput;
  touchInput.x = dx / len;
  touchInput.y = dy / len;
  return touchInput;
}

function isMovementBlockedTarget(target){
  if(!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('.survivor-overlay:not([hidden]), .survivor-controls, .survivor-build, button, a, input, textarea, select'));
}

function updateJoystick(){
  if(!refs?.joystick) return;
  refs.joystick.hidden = !touch.active;
  if(!touch.active) return;
  refs.joystick.style.left = `${touch.startX}px`;
  refs.joystick.style.top = `${touch.startY}px`;
  const dx = touch.x - touch.startX;
  const dy = touch.y - touch.startY;
  const len = Math.hypot(dx, dy);
  const max = 44;
  const scale = len > max ? max / len : 1;
  if(refs.joystickKnob) refs.joystickKnob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
}

function pointerPos(event){
  const rect = refs.canvas?.getBoundingClientRect?.() || refs.shell.getBoundingClientRect?.() || { left:0, top:0, width:SURVIVOR_BALANCE.world.maxWidth, height:SURVIVOR_BALANCE.world.height };
  return { x:event.clientX - rect.left, y:event.clientY - rect.top };
}

function applyCanvasTransform(ctx){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, Math.round(cssWidth * dpr), Math.round(cssHeight * dpr));
  ctx.setTransform(dpr * currentWorld.scale, 0, 0, dpr * currentWorld.scale, offsetX * dpr, 0);
}

function onKeyDown(event){
  if(!shouldHandleMovementKey(event)) return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(event.code)){
    keys.add(event.code);
    event.preventDefault();
  }
}

function onKeyUp(event){
  if(!shouldHandleMovementKey(event)) return;
  keys.delete(event.code);
  event.preventDefault();
}

function isTextInput(target){
  if(typeof HTMLElement === 'undefined') return false;
  if(!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

function shouldHandleMovementKey(event){
  if(!keyboardActive || !isVisible() || isTextInput(event.target)) return false;
  return ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(event.code);
}

function onPointerDown(event){
  if(event.pointerType === 'mouse') return;
  if(!keyboardActive || isMovementBlockedTarget(event.target)) return;
  const pos = pointerPos(event);
  const rect = refs.canvas?.getBoundingClientRect?.() || refs.shell.getBoundingClientRect?.();
  if(rect && pos.y < rect.height * 0.5) return;
  event.preventDefault();
  refs.shell.setPointerCapture?.(event.pointerId);
  touch.active = true;
  touch.id = event.pointerId;
  touch.startX = pos.x;
  touch.startY = pos.y;
  touch.x = pos.x;
  touch.y = pos.y;
  updateJoystick();
}

function onPointerMove(event){
  if(!touch.active || event.pointerId !== touch.id) return;
  event.preventDefault();
  const pos = pointerPos(event);
  touch.x = pos.x;
  touch.y = pos.y;
  updateJoystick();
}

function onPointerEnd(event){
  if(event.pointerId !== touch.id) return;
  touch.active = false;
  touch.id = null;
  updateJoystick();
}

function iconButton(label, html){
  return el('button', { class:'survivor-icon-btn', attrs:{ type:'button', 'aria-label':label }, html });
}

function pauseIcon(){
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M8 5v14M16 5v14"></path></svg>';
}

function exitIcon(){
  return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 5l14 14M19 5 5 19"></path></svg>';
}

function upgradeIcon(){
  return '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3"><path d="M24 5l5.2 12.6L42 19l-9.8 8.7L35 41l-11-7-11 7 2.8-13.3L6 19l12.8-1.4L24 5z"></path></svg>';
}

function buildIcon(){
  return '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3"><path d="M24 8v32M8 24h32"></path><circle cx="24" cy="24" r="14"></circle></svg>';
}

function phoneTurnIcon(){
  return el('div', { class:'survivor-phone-turn', attrs:{ 'aria-hidden':'true' }, html:`
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="4">
      <rect x="30" y="12" width="36" height="64" rx="8"></rect>
      <path d="M43 68h10"></path>
      <path d="M18 46c-6 8-6 20 1 28 6 7 16 9 24 5"></path>
      <path d="M78 50c6-8 6-20-1-28-6-7-16-9-24-5"></path>
      <path d="M20 74l-1-18 17 3"></path>
      <path d="M76 22l1 18-17-3"></path>
    </svg>` });
}

function ensureRefs(){
  if(refs && refs.shell && document.contains(refs.shell)) return refs;
  refs = {
    shell: byId('survivorShell'),
    canvas: byId('survivorCanvas'),
    mito: byId('survivorMito'),
    hud: byId('survivorShell')?.querySelector('.survivor-hud'),
    hudLife: byId('survivorLife'),
    hudLifeFill: byId('survivorLifeFill'),
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
    controls: byId('survivorControls'),
    joystick: byId('survivorJoystick'),
    joystickKnob: byId('survivorJoystickKnob'),
  };
  refs.shell?.setAttribute('tabindex', '0');
  refs.canvas?.setAttribute('role', 'img');
  if(!refs.build && refs.shell){
    refs.build = el('div', { class:'survivor-build', attrs:{ id:'survivorBuild' } });
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
  if(!refs.controls && refs.shell){
    const pauseButton = iconButton('Pausar partida', pauseIcon());
    const exitButton = iconButton('Salir de la partida', exitIcon());
    pauseButton.addEventListener('click', ()=>pauseHandler?.());
    exitButton.addEventListener('click', ()=>exitHandler?.());
    refs.controls = el('div', { class:'survivor-controls', attrs:{ id:'survivorControls' }, children:[pauseButton, exitButton] });
    (refs.hud || refs.shell).append(refs.controls);
  }
  if(refs.controls && refs.hud && refs.controls.parentElement !== refs.hud){
    refs.hud.append(refs.controls);
  }
  if(!refs.joystick && refs.shell){
    refs.joystickKnob = el('span', { attrs:{ id:'survivorJoystickKnob' } });
    refs.joystick = el('div', { class:'survivor-joystick', attrs:{ id:'survivorJoystick', hidden:'', 'aria-hidden':'true' }, children:[refs.joystickKnob] });
    refs.shell.append(refs.joystick);
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
  updateJoystick();
}

export function startGameInput(){
  keyboardActive = true;
  if(keyboardListening) return;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  keyboardListening = true;
}

export function stopGameInput(){
  keyboardActive = false;
  if(keyboardListening){
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    keyboardListening = false;
  }
  cleanupInput();
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
  if(refs.card){
    refs.card.setAttribute('role', 'dialog');
    refs.card.setAttribute('aria-modal', 'true');
    refs.card.setAttribute('aria-labelledby', 'survivorOverlayTitle');
  }
}

function overlayActions(buttons){
  return el('div', { class:'survivor-actions', children:buttons });
}

function fillOverlay({ icon, title, body, actions, gameover = false }){
  prepareOverlay({ gameover });
  clear(refs.card);
  const titleNode = el('h3', { text:title, attrs:{ id:'survivorOverlayTitle' } });
  const bodyNode = el('div', { class:'survivor-card-body', attrs:{ id:'survivorOverlayText' }, children:body });
  refs.card.append(icon || markNode(), titleNode, bodyNode, overlayActions(actions));
  refs.overlay?.setAttribute('aria-describedby', 'survivorOverlayText');
  return { titleNode, bodyNode };
}

function restoreFocus(){
  if(lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

function showBasicOverlay({ title, text, buttonText, onClick, gameover = false }){
  ensureRefs();
  cleanupQuestionKeys();
  refs.overlayButton = el('button', { class:'btn btn-primary', text:buttonText, attrs:{ id:'survivorStart', type:'button' } });
  refs.overlayButton.addEventListener('click', onClick || startHandler);
  fillOverlay({ title, body:[el('p', { text })], actions:[refs.overlayButton], gameover });
  if(isVisible()) refs.overlayButton.focus();
}

export function initView({ onStart, onPause, onExit, onOrientationPause }){
  ensureRefs();
  startHandler = onStart;
  pauseHandler = onPause;
  exitHandler = onExit;
  orientationPauseHandler = onOrientationPause;
  if(viewListening && listeningShell === refs.shell) return;
  refs.overlayButton?.addEventListener('click', ()=>startHandler?.());
  refs.shell?.addEventListener('pointerdown', onPointerDown);
  refs.shell?.addEventListener('pointermove', onPointerMove);
  refs.shell?.addEventListener('pointerup', onPointerEnd);
  refs.shell?.addEventListener('pointercancel', onPointerEnd);
  viewListening = true;
  listeningShell = refs.shell;
}

export function shouldPauseForLandscape({ width, height, pointerCoarse }){
  return Boolean(pointerCoarse) && Number(width) > Number(height);
}

function touchLandscapeMatches(){
  if(typeof window === 'undefined') return false;
  if(window.matchMedia){
    return Boolean(window.matchMedia('(orientation: landscape) and (pointer: coarse)').matches);
  }
  return shouldPauseForLandscape({ width:window.innerWidth, height:window.innerHeight, pointerCoarse:false });
}

function cleanupPlayModeListeners(){
  if(escapeHandler){
    window.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
  if(orientationQuery && orientationHandler){
    orientationQuery.removeEventListener?.('change', orientationHandler);
    orientationQuery.removeListener?.(orientationHandler);
  }
  orientationQuery = null;
  orientationHandler = null;
  if(popstateHandler){
    window.removeEventListener('popstate', popstateHandler);
    popstateHandler = null;
  }
}

function tryLockPortrait(){
  try{
    const lock = screen.orientation?.lock?.('portrait');
    lock?.catch?.(()=>{});
  }
  catch{}
}

export function enterPlayMode(){
  ensureRefs();
  playModeActive = true;
  document.body.classList.add('survivor-playing');
  refs.shell?.classList.add('is-fullscreen');

  try{
    const fullscreen = refs.shell?.requestFullscreen?.({ navigationUI:'hide' });
    fullscreen?.then?.(tryLockPortrait).catch?.(()=>{});
  }
  catch{}

  cleanupPlayModeListeners();
  escapeHandler = event=>{
    if(!playModeActive || !isVisible() || event.key !== 'Escape' || isTextInput(event.target)) return;
    event.preventDefault();
    pauseHandler?.();
  };
  window.addEventListener('keydown', escapeHandler);

  if(window.matchMedia){
    orientationQuery = window.matchMedia('(orientation: landscape) and (pointer: coarse)');
    orientationHandler = event=>{
      if(playModeActive && event.matches) orientationPauseHandler?.();
    };
    orientationQuery.addEventListener?.('change', orientationHandler);
    orientationQuery.addListener?.(orientationHandler);
  }

  popstateHandler = ()=>{
    if(!playModeActive) return;
    pauseHandler?.();
    try{ history.pushState({ survivor:true }, ''); }
    catch{}
  };
  window.addEventListener('popstate', popstateHandler);
  try{
    history.pushState({ survivor:true }, '');
    historyPushed = true;
  }
  catch{
    historyPushed = false;
  }
}

export function exitPlayMode(){
  ensureRefs();
  if(!playModeActive && !document.body.classList.contains('survivor-playing') && !refs.shell?.classList.contains('is-fullscreen')) return;
  playModeActive = false;
  document.body.classList.remove('survivor-playing');
  refs.shell?.classList.remove('is-fullscreen');
  cleanupPlayModeListeners();
  try{ screen.orientation?.unlock?.(); }
  catch{}
  try{
    if(document.fullscreenElement) document.exitFullscreen?.();
  }
  catch{}
  if(historyPushed){
    historyPushed = false;
    try{ history.back(); }
    catch{}
  }
}

export function isTouchLandscape(){
  return touchLandscapeMatches();
}

export function getInput(){
  const k = keyVector();
  const t = touchVector();
  combinedInput.x = k.x + t.x;
  combinedInput.y = k.y + t.y;
  return combinedInput;
}

export function resizeCanvas(){
  ensureRefs();
  if(!refs.canvas || !refs.shell) return null;
  const rect = refs.canvas.getBoundingClientRect();
  cssWidth = Math.max(1, rect.width || SURVIVOR_BALANCE.world.maxWidth);
  cssHeight = Math.max(1, rect.height || SURVIVOR_BALANCE.world.height);
  currentWorld = computeWorld(cssWidth, cssHeight);
  offsetX = Math.max(0, (cssWidth - currentWorld.width * currentWorld.scale) / 2);
  dpr = Math.max(1, Math.min(globalThis.devicePixelRatio || 1, 2));
  refs.canvas.width = Math.round(cssWidth * dpr);
  refs.canvas.height = Math.round(cssHeight * dpr);
  if(!refs.canvas.getContext) return null;
  const ctx = refs.canvas.getContext('2d');
  if(!ctx) return null;
  applyCanvasTransform(ctx);
  return { ctx, world:currentWorld };
}

export function getCanvasContext(){
  ensureRefs();
  if(!refs.canvas || !refs.canvas.getContext) return null;
  const ctx = refs.canvas.getContext('2d');
  if(!ctx) return null;
  applyCanvasTransform(ctx);
  return ctx;
}

export function syncMito(snapshot){
  ensureRefs();
  if(!refs.mito || !snapshot) return;
  const scale = snapshot.world.scale || currentWorld.scale;
  const size = SURVIVOR_BALANCE.render.playerDomSize * scale;
  const x = offsetX + snapshot.player.x * scale - size / 2;
  const y = snapshot.player.y * scale - size / 2;
  refs.mito.style.width = `${size}px`;
  refs.mito.style.height = `${size}px`;
  refs.mito.style.transform = `translate(${x}px, ${y}px)`;
  refs.mito.classList.toggle('survivor-hit', snapshot.player.invulnerable > 0);
}

export function renderHud(snapshot){
  ensureRefs();
  if(!snapshot) return;
  const lifeValue = Math.max(0, Math.round(snapshot.player.life));
  const maxLife = Math.max(1, Math.round(snapshot.player.maxLife || SURVIVOR_BALANCE.player.maxLife));
  const life = `${lifeValue}/${maxLife}`;
  const lifeWidth = `${Math.max(0, Math.min(100, lifeValue / maxLife * 100))}%`;
  const nextXp = snapshot.xpToNext || 1;
  const currentXp = Math.max(0, Math.floor(snapshot.xp || 0));
  const level = Math.max(1, Math.round(snapshot.level || 1));
  const xp = `Nv. ${level} · ${currentXp}/${nextXp}`;
  const xpWidth = `${Math.max(0, Math.min(100, currentXp / nextXp * 100))}%`;
  const time = formatTime(snapshot.time);
  const enemies = String(snapshot.enemies.length);
  if(lastHud.lifeValue != null && lifeValue < lastHud.lifeValue) softVibrate(30);
  if(refs.hudLife && lastHud.life !== life){ refs.hudLife.textContent = life; lastHud.life = life; }
  if(refs.hudLifeFill && lastHud.lifeWidth !== lifeWidth){ refs.hudLifeFill.style.width = lifeWidth; lastHud.lifeWidth = lifeWidth; }
  refs.shell?.classList.toggle('is-low-life', lifeValue / maxLife < 0.3);
  lastHud.lifeValue = lifeValue;
  if(refs.hudXp && lastHud.xp !== xp){ refs.hudXp.textContent = xp; lastHud.xp = xp; }
  if(refs.hudXpFill && lastHud.xpWidth !== xpWidth){ refs.hudXpFill.style.width = xpWidth; lastHud.xpWidth = xpWidth; }
  if(refs.hudTime && lastHud.time !== time){ refs.hudTime.textContent = time; lastHud.time = time; }
  if(refs.hudEnemies && lastHud.enemies !== enemies){ refs.hudEnemies.textContent = enemies; lastHud.enemies = enemies; }
  if(refs.bossHud){
    const boss = snapshot.boss;
    const active = Boolean(boss?.active);
    if(lastHud.bossActive !== active){ refs.bossHud.hidden = !active; lastHud.bossActive = active; }
    if(active){
      const maxLife = Math.max(1, Math.round(boss.maxLife || 1));
      const life = Math.max(0, Math.round(boss.life || 0));
      const bossLife = `${life}/${maxLife}`;
      const bossWidth = `${Math.max(0, Math.min(100, life / maxLife * 100))}%`;
      const bossShields = `${Math.max(0, boss.shields || 0)}/${Math.max(0, boss.maxShields || 0)}`;
      if(lastHud.bossLife !== bossLife){ refs.bossLife.textContent = bossLife; lastHud.bossLife = bossLife; }
      if(lastHud.bossWidth !== bossWidth){ refs.bossLifeFill.style.width = bossWidth; lastHud.bossWidth = bossWidth; }
      if(lastHud.bossShields !== bossShields){ refs.bossShields.textContent = bossShields; lastHud.bossShields = bossShields; }
    }
  }
}

export function renderBuild(session){
  ensureRefs();
  if(!refs.build || !session) return;
  const powers = Object.entries(session.powers || {}).filter(([, level])=>level > 0);
  const items = [
    el('li', { attrs:{ title:'Chispa de Mito' }, children:[el('span', { html:buildIcon() }), el('b', { text:String(session.chispaLevel || 1) })] }),
  ];
  if(session.petWeapon){
    const pet = PET_WEAPONS[session.petWeapon.petId];
    const level = Math.max(0, Math.round(Number(session.petWeapon.level) || 0));
    items.push(el('li', { attrs:{ title:pet?.name || 'Arma de mascota' }, children:[el('span', { html:buildIcon() }), el('b', { text:String(level || 0) })] }));
  }
  for(const [id, level] of powers){
    const power = powerById(id);
    items.push(el('li', { attrs:{ title:power?.name || id }, children:[el('span', { html:buildIcon() }), el('b', { text:String(level) })] }));
  }

  clear(refs.build);
  refs.build.append(
    el('strong', { text:'Build' }),
    el('ul', { children:items })
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
  if(refs.hudLife) refs.hudLife.textContent = `${SURVIVOR_BALANCE.player.maxLife}/${SURVIVOR_BALANCE.player.maxLife}`;
  if(refs.hudLifeFill) refs.hudLifeFill.style.width = '100%';
  if(refs.hudXp) refs.hudXp.textContent = `Nv. 1 · 0/${SURVIVOR_BALANCE.xp.baseToNext}`;
  if(refs.hudXpFill) refs.hudXpFill.style.width = '0%';
  if(refs.hudTime) refs.hudTime.textContent = '0:00';
  if(refs.hudEnemies) refs.hudEnemies.textContent = '0';
  lastHud = {};
  if(refs.bossHud) refs.bossHud.hidden = true;
  refs.mito.style.transform = 'translate(-9999px, -9999px)';
}

export function showPlay(){
  ensureRefs();
  cleanupQuestionKeys();
  if(refs.overlay) refs.overlay.hidden = true;
  restoreFocus();
}

export function showPauseMenu({ onContinue, onExit }){
  ensureRefs();
  cleanupQuestionKeys();
  const continueButton = el('button', { class:'btn btn-primary', text:'Continuar', attrs:{ type:'button' } });
  const exitButton = el('button', { class:'btn btn-ghost', text:'Salir', attrs:{ type:'button' } });
  continueButton.addEventListener('click', onContinue);
  exitButton.addEventListener('click', onExit);
  fillOverlay({ title:'Pausa', body:[el('p', { text:'La partida queda detenida hasta que decidas continuar.' })], actions:[continueButton, exitButton] });
  if(isVisible()) continueButton.focus();
}

export function showExitConfirm({ onCancel, onConfirm }){
  ensureRefs();
  cleanupQuestionKeys();
  const cancelButton = el('button', { class:'btn btn-primary', text:'Continuar', attrs:{ type:'button' } });
  const confirmButton = el('button', { class:'btn btn-ghost', text:'Salir', attrs:{ type:'button' } });
  cancelButton.addEventListener('click', onCancel);
  confirmButton.addEventListener('click', onConfirm);
  fillOverlay({ title:'Salir de la partida', body:[el('p', { text:'Perderás esta partida.' })], actions:[cancelButton, confirmButton] });
  if(isVisible()) cancelButton.focus();
}

export function showLandscapePause({ onContinue }){
  ensureRefs();
  cleanupQuestionKeys();
  const continueButton = el('button', { class:'btn btn-primary', text:'Continuar', attrs:{ type:'button' } });
  continueButton.addEventListener('click', onContinue);
  fillOverlay({ icon:phoneTurnIcon(), title:'Gira el teléfono', body:[el('p', { text:'Gira el teléfono a vertical para jugar' })], actions:[continueButton] });
  if(isVisible()) continueButton.focus();
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
  const text = el('p', { class:'survivor-question-text', text:item.q });
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
      softVibrate(12);
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
    if(outcome.continueText) continueButton.textContent = outcome.continueText;
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

  const body = [];
  if(progressText) body.push(el('p', { class:'survivor-progress', text:progressText }));
  body.push(text, options, result);
  fillOverlay({ title:titleText, body, actions:[continueButton] });
  if(isVisible()) buttons[0]?.focus();
}

export function showUpgradeOptions(session, { onSelect, onReroll }){
  ensureRefs();
  cleanupQuestionKeys();
  const options = el('div', { class:'survivor-upgrades' });
  const cards = (session.upgradeOptions || []).map(option=>{
    const button = el('button', { class:'survivor-upgrade', attrs:{ type:'button' }, children:[
      el('span', { class:'survivor-upgrade-icon', html:upgradeIcon() }),
      el('strong', { text:option.name }),
      el('span', { text:`Nivel ${option.currentLevel} a ${option.nextLevel}` }),
      el('small', { text:option.description || 'Mejora tu build para esta partida.' }),
    ] });
    button.addEventListener('click', ()=>onSelect(option.id));
    options.append(button);
    return button;
  });

  if(!cards.length){
    options.append(el('p', { text:'No quedan mejoras disponibles para esta build.' }));
  }

  const reroll = el('button', {
    class:'btn btn-ghost survivor-reroll',
    text:`Cambiar opciones: ${session.rerolls || 0}`,
    attrs:{ type:'button' },
  });
  reroll.disabled = !session.rerolls;
  reroll.addEventListener('click', onReroll);
  const continueButton = el('button', { class:'btn btn-primary', text:'Continuar', attrs:{ type:'button' } });
  continueButton.hidden = cards.length > 0;
  continueButton.addEventListener('click', ()=>onSelect(null));

  fillOverlay({ title:'Elige una mejora', body:[el('p', { text:'Selecciona una carta para cambiar la build de esta partida.' }), options], actions:[reroll, continueButton] });
  if(isVisible()) cards[0]?.focus();
}

export function showSummary(summary){
  ensureRefs();
  const totalAnswers = Math.max(0, (summary.correctAnswers || 0) + (summary.wrongAnswers || 0));
  const precision = totalAnswers ? Math.round((summary.correctAnswers || 0) / totalAnswers * 100) : 0;
  cleanupQuestionKeys();
  const replayButton = el('button', { class:'btn btn-primary', text:'Jugar otra vez', attrs:{ type:'button' } });
  const exitButton = el('button', { class:'btn btn-ghost', text:'Salir', attrs:{ type:'button' } });
  replayButton.addEventListener('click', ()=>startHandler?.());
  exitButton.addEventListener('click', ()=>exitHandler?.());
  const list = el('div', { class:'survivor-summary', children:[
    el('div', { children:[el('span', { text:'Tiempo' }), el('b', { text:formatTime(summary.time) })] }),
    el('div', { children:[el('span', { text:'Nivel' }), el('b', { text:String(summary.level) })] }),
    el('div', { children:[el('span', { text:'Precisión' }), el('b', { text:`${precision}%` })] }),
    el('div', { children:[el('span', { text:'Racha máxima' }), el('b', { text:String(summary.maxCorrectStreak || 0) })] }),
    el('div', { children:[el('span', { text:'Correctas' }), el('b', { text:String(summary.correctAnswers) })] }),
    el('div', { children:[el('span', { text:'Fallos' }), el('b', { text:String(summary.wrongAnswers) })] }),
    el('div', { children:[el('span', { text:'Chispas' }), el('b', { text:String(summary.awardedChispas) })] }),
    el('div', { children:[el('span', { text:'Boss derrotado' }), el('b', { text:summary.bossDefeated ? 'Sí' : 'No' })] }),
  ] });
  fillOverlay({
    title:'Resumen final',
    body:[el('p', { text:`Sobreviviste ${formatTime(summary.time)} y ganaste ${summary.awardedChispas} chispas.${summary.bossDefeated ? ' Derrotaste al boss final.' : ''}` }), list],
    actions:[replayButton, exitButton],
    gameover:true,
  });
  if(isVisible()) replayButton.focus();
}
