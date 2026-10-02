// Pintado de la vista del quiz: intro, pregunta en curso y resultado.
// No guarda estado: todo entra desde session.js y vuelve por callbacks.

import { el, clear, byId, setText } from '../../core/dom.js';
import { setFace, playState } from '../mascot/face.js';
import { burstConfetti, sparkAt } from '../mascot/effects.js';
import * as s from './session.js';

const LETTERS = ['A','B','C','D'];
const PASS_PCT = 70;
const GREAT_PCT = 90;

function showQuizPart(part){
  byId('quizIntro').style.display = part === 'intro' ? 'block' : 'none';
  byId('quizResult').style.display = part === 'result' ? 'block' : 'none';
  byId('quizPlay').style.display = part === 'play' ? 'block' : 'none';
}

export function showIntro(){
  showQuizPart('intro');
  setFace(byId('mascotIntro'), 'normal');
}

export function showPlay(){
  showQuizPart('play');
  // Los corazones se dibujan al empezar la ronda: si solo se pintaran al
  // responder, la primera pregunta mostraría la fila vacía y las rondas
  // siguientes los vidas de la ronda anterior.
  renderLives();
}

function renderLives(){
  const host = byId('livesRow');
  if(!host) return;
  let html = '';
  for(let i=0;i<3;i++){
    const filled = i < s.getSession().lives;
    html += `<svg viewBox="0 0 24 24" fill="${filled ? '#ff5da2' : 'none'}" stroke="${filled ? '#e83e8c' : '#f0c9dd'}" stroke-width="1.8"><path d="M13 2 3 14h7l-1 8 11-14h-8l1-6Z"/></svg>`;
  }
  host.innerHTML = html;
}

function renderHud(){
  const { index, questions, score, streak } = s.getSession();
  setText('qIndexLabel', index + 1);
  setText('qTotalLabel', questions.length);
  setText('streakLabel', streak);
  setText('scoreLabel', score);
  setText('flameEmoji', streak >= 3 ? '🔥' : '');
  const bar = byId('qbarFill');
  if(bar) bar.style.width = (index / questions.length * 100) + '%';
}

export function renderQuestion(onAnswer){
  const session = s.getSession();
  const item = s.prepareQuestion(s.currentQuestion());

  setText('qCat', item.cat.toUpperCase());
  setText('qText', item.q);
  renderHud();
  const fb = byId('qFeedback');
  if(fb) fb.className = 'feedback';
  const nextBtn = byId('nextBtn');
  if(nextBtn) nextBtn.style.display = 'none';
  setFace(byId('mascotQuiz'), 'normal');

  const optsHost = byId('qOpts');
  clear(optsHost);
  item.opts.forEach((opt, idx)=>{
    const b = el('button', { class:'opt', attrs:{ type:'button' } }, undefined);
    b.append(
      el('span', { class:'letter', text: LETTERS[idx] }),
      el('span', { text: opt }),
    );
    b.onclick = ()=> onAnswer(idx);
    optsHost.appendChild(b);
  });
}

export function renderAnswerResult(idx, outcome){
  const item = s.currentQuestion();
  const opts = [...document.querySelectorAll('.opt')];
  const mascot = byId('mascotQuiz');

  opts.forEach((o, i)=>{
    o.classList.add('disabled');
    if(i === item.correct) o.classList.add('correct');
    if(i === idx && !outcome.correct) o.classList.add('wrong');
  });

  const fb = byId('qFeedback');
  fb.classList.add('show');

  if(outcome.correct){
    fb.classList.add('ok');
    fb.classList.remove('no');
    setText('fbHead', outcome.streak >= 3 ? `¡Racha de ${outcome.streak}! Correcto.` : '¡Correcto!');
    setFace(mascot, 'happy');
    playState(mascot, 'happy');
    const rect = opts[idx].getBoundingClientRect();
    burstConfetti(rect.left + rect.width/2, rect.top, outcome.hotStreak ? 26 : 14);
    sparkAt(opts[idx], `+${outcome.gain} ⚡`);
    if(outcome.hotStreak) sparkAt(mascot, '🔥');
  } else {
    fb.classList.add('no');
    fb.classList.remove('ok');
    setText('fbHead', 'No era esa.');
    setFace(mascot, 'sad');
    playState(mascot, 'sad');
    sparkAt(mascot, '💔');
  }

  setText('fbBody', item.exp);
  renderHud();
  renderLives();

  const nextBtn = byId('nextBtn');
  if(nextBtn){
    nextBtn.textContent = s.isGameOver() ? 'Ver resultado' : 'Siguiente →';
    nextBtn.style.display = 'inline-flex';
  }
}

export function renderResult({ score, right, answered, pct }){
  showQuizPart('result');
  const bar = byId('qbarFill');
  if(bar) bar.style.width = '100%';

  setText('resultScore', score);
  setText('resultSub', `puntos · ${right}/${answered} correctas (${pct}%)`);

  const mascotResult = byId('mascotResult');
  let title = '¡Sigue así!';
  if(s.getSession().lives <= 0){
    title = 'Se acabaron las vidas';
    setFace(mascotResult, 'sad');
    playState(mascotResult, 'sad');
  } else if(pct >= GREAT_PCT){
    title = '¡Dominas el tema!';
    setFace(mascotResult, 'excited');
    playState(mascotResult, 'excited');
    setTimeout(()=>burstConfetti(window.innerWidth/2, 120, 60), 150);
  } else if(pct >= PASS_PCT){
    title = 'Muy buen manejo';
    setFace(mascotResult, 'happy');
    playState(mascotResult, 'happy');
    burstConfetti(window.innerWidth/2, 120, 30);
  } else {
    setFace(mascotResult, 'normal');
  }
  setText('resultTitle', title);

  renderBreakdown();
}

function renderBreakdown(){
  const cb = byId('catBreakdown');
  if(!cb) return;
  clear(cb);
  const stats = s.getSession().catStats;
  Object.keys(stats).forEach(cat=>{
    const st = stats[cat];
    const p = Math.round(st.right/st.total*100);
    cb.innerHTML += `
      <div class="cb-row">
        <div class="cb-name">${cat}</div>
        <div class="cb-track"><div class="cb-fill" style="width:${p}%"></div></div>
        <div class="cb-frac">${st.right}/${st.total}</div>
      </div>`;
  });
}

export { PASS_PCT };