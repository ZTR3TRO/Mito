import { COURSES } from './courses.js';
import { WARDROBE, findItem, findItemById, categoryOf } from './wardrobe.js';
import {
  addChispas, buyAndEquip, equipCategory, getChispas, getEquipped, owns, PASSING_BONUS,
  recordQuizResult, recordAnswer, getMistakes, getHistory, getStreak, clearMistakes,
  getTheme, setTheme, getCourse, setCourse, exportSave, importSave, resetAll,
} from './store.js';
import { applyAvatar, previewAvatar } from './avatar.js';

/* =================== MATERIA ACTIVA =================== */
let activeCourse = COURSES.find(c=>c.id === getCourse()) || COURSES[0];

function switchCourse(id){
  if(id === activeCourse.id) return;
  activeCourse = COURSES.find(c=>c.id === id) || COURSES[0];
  setCourse(activeCourse.id);
  renderCourseTabs();
  renderApuntes();
  renderClaves();
  renderQuizCounts();
  renderReviewCard();
  renderStreak();
  document.getElementById('quizPlay').style.display = 'none';
  resetQuiz();
  document.getElementById('sideBubble').textContent = `Cambiamos a ${activeCourse.label} 📚`;
  if(viewVisible('progreso')) renderProgress();
}

function renderCourseTabs(){
  const host = document.getElementById('courseTabs');
  if(!host) return;
  host.innerHTML = '';
  COURSES.forEach(c=>{
    const pill = document.createElement('button');
    pill.className = 'course-pill' + (c.id === activeCourse.id ? ' active' : '');
    pill.textContent = c.label;
    pill.onclick = ()=> switchCourse(c.id);
    host.appendChild(pill);
  });
}

/* =================== NAVEGACIÓN =================== */
function goTo(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+view).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  if(view === 'progreso') renderProgress();
  if(view === 'quiz') renderReviewCard();
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('.navbtn').forEach(b=>{
  b.addEventListener('click', ()=>goTo(b.dataset.view));
});

/* =================== TEMA (dark / light) =================== */
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  const btn = document.getElementById('themeToggle');
  if(btn){
    btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    const emoji = btn.querySelector('.tt-emoji');
    const label = btn.querySelector('.tt-label');
    if(emoji) emoji.textContent = t === 'dark' ? '☀️' : '🌙';
    if(label) label.textContent = t === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }
}
function toggleTheme(){
  applyTheme(setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
}
const themeToggle = document.getElementById('themeToggle');
if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
applyTheme(getTheme());

/* =================== RACHA DIARIA =================== */
function renderStreak(){
  ['sideStreak','heroStreak','progressStreak'].forEach(id=>{
    const el = document.getElementById(id);
    if(el && el.dataset.mode !== 'days'){
      el.textContent = getStreak();
    }
  });
  const days = document.getElementById('sideStreakDays');
  if(days){
    const s = getStreak();
    days.textContent = s === 0 ? 'juega hoy para encender la racha' : (s === 1 ? '1 día seguido' : `${s} días seguidos`);
  }
}

/* =================== MASCOTA: helpers =================== */
function setFace(el, face){
  el.classList.remove('face-normal','face-happy','face-sad','face-excited');
  el.classList.add('face-'+face);
}
function playState(el, state){
  el.classList.remove('state-happy','state-sad','state-excited');
  void el.offsetWidth;
  if(state) el.classList.add('state-'+state);
}
const sideBubbleMsgs = [
  'Zare, ¿sabías que reciclas casi tu peso en ATP cada día? 🔋',
  'El ATP guarda 7.3 kcal/mol, listas para usarse ⚡',
  'La ATP-sintasa gira como una turbina diminuta 🌀',
  'Repasa los apuntes antes de intentar el examen completo 📖',
  '¡Vamos, Zare! Una racha más en el quiz 🔥',
  'Junta chispas en el quiz y ven a cambiarme de look 🎨',
];
const bubbleTimer = setInterval(()=>{
  document.getElementById('sideBubble').textContent = sideBubbleMsgs[Math.floor(Math.random()*sideBubbleMsgs.length)];
}, 5000);

/* =================== CONFETTI =================== */
function burstConfetti(x, y, count){
  const host = document.getElementById('confettiHost');
  const colors = ['#ff5da2','#16c98d','#ffc93c','#b98af6','#ff8fc0'];
  for(let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetto';
    const size = 6 + Math.random()*6;
    c.style.width = size+'px';
    c.style.height = (size*0.4)+'px';
    c.style.left = (x + (Math.random()*200-100)) + 'px';
    c.style.top = (y - 20) + 'px';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDuration = (1.1 + Math.random()*0.9) + 's';
    c.style.transform = `rotate(${Math.random()*360}deg)`;
    host.appendChild(c);
    setTimeout(()=>c.remove(), 2200);
  }
}
function sparkAt(el, emoji){
  const rect = el.getBoundingClientRect();
  const s = document.createElement('div');
  s.className = 'spark-pop';
  s.textContent = emoji;
  s.style.left = (rect.left + rect.width/2 - 10) + 'px';
  s.style.top = (rect.top) + 'px';
  s.style.position = 'fixed';
  document.body.appendChild(s);
  setTimeout(()=>s.remove(), 750);
}

/* =================== RENDER: APUNTES =================== */
function renderApuntes(){
  const tabHost = document.getElementById('topicTabs');
  const host = document.getElementById('notesHost');
  const cheatWrap = document.getElementById('cheatSheet');
  const cheatGrid = document.getElementById('cheatGrid');
  tabHost.innerHTML = '';
  host.innerHTML = '';
  if(cheatWrap) cheatWrap.style.display = (activeCourse.cheats || []).length ? '' : 'none';

  const notes = activeCourse.notes || [];
  if(notes.length === 0){
    host.innerHTML = `<div class="empty-state">Aún no hay apuntes para esta materia. Agrégalos en src/courses.js 📚</div>`;
    return;
  }
  notes.forEach((topic, i)=>{
    const pill = document.createElement('button');
    pill.className = 'topic-pill' + (i===0 ? ' active' : '');
    pill.innerHTML = topic.label;
    pill.onclick = ()=>{
      document.querySelectorAll('.topic-pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active');
      document.querySelectorAll('.note-block').forEach(b=>b.classList.remove('active'));
      document.getElementById('block-'+topic.id).classList.add('active');
    };
    tabHost.appendChild(pill);

    const block = document.createElement('div');
    block.className = 'note-block' + (i===0 ? ' active' : '');
    block.id = 'block-'+topic.id;
    const acc = document.createElement('div');
    acc.className = 'accordion';
    topic.items.forEach((item, j)=>{
      const el = document.createElement('div');
      el.className = 'acc-item' + (j===0 ? ' open' : '');
      el.innerHTML = `
        <button class="acc-head">
          <h4>${item.q}</h4>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="acc-body"><div class="acc-body-inner">${item.a}</div></div>
      `;
      el.querySelector('.acc-head').onclick = ()=> el.classList.toggle('open');
      acc.appendChild(el);
    });
    block.appendChild(acc);
    host.appendChild(block);
  });

  cheatGrid.innerHTML = '';
  (activeCourse.cheats || []).forEach(c=>{
    const d = document.createElement('div');
    d.className = 'cheat-item';
    d.innerHTML = `<b>${c.n}</b>${c.l}`;
    cheatGrid.appendChild(d);
  });
}

/* =================== RENDER: PUNTOS CLAVE =================== */
function renderClaves(){
  const host = document.getElementById('keyGrid');
  host.innerHTML = '';
  const kps = activeCourse.keypoints || [];
  if(kps.length === 0){
    host.innerHTML = `<div class="empty-state">Aún no hay puntos clave para esta materia. Agrégalos en src/courses.js ✨</div>`;
    return;
  }
  kps.forEach((k, i)=>{
    const c = document.createElement('div');
    c.className = 'key-card';
    c.innerHTML = `<span class="key-num">${i+1}</span>${k}`;
    host.appendChild(c);
  });
}

/* =================== RENDER: contadores =================== */
function renderQuizCounts(){
  const n = activeCourse.questions.length;
  const all = document.getElementById('modeAllN');
  const stat = document.getElementById('statBankSize');
  const startBtn = document.querySelector('[data-action="startQuiz"]');
  const quick = document.getElementById('modeQuickN');
  const rec = document.getElementById('modeRecN');
  const modeCards = document.querySelectorAll('.mode-card');
  const quickN = n === 0 ? 0 : Math.min(n, Math.max(1, Math.round(n * 0.3)));
  const recN = n === 0 ? 0 : Math.min(n, Math.max(1, Math.round(n * 0.6)));
  if(all) all.textContent = n;
  if(stat) stat.textContent = n;
  if(quick){
    quick.textContent = quickN;
    const card = quick.closest('.mode-card');
    if(card) card.dataset.n = quickN;
  }
  if(rec){
    rec.textContent = recN;
    const card = rec.closest('.mode-card');
    if(card) card.dataset.n = recN;
  }
  if(startBtn){
    startBtn.disabled = n === 0;
    startBtn.textContent = n === 0 ? 'Sin preguntas aún' : 'Comenzar';
  }
  const title = document.getElementById('quizTitle');
  if(title) title.textContent = 'Quiz de ' + activeCourse.label;
}

/* =================== QUIZ LOGIC =================== */
let quizQuestions = [];
let qIndex = 0;
let score = 0;
let streak = 0;
let lives = 3;
let answered = false;
let catStats = {};
let roundsPlayed = 0;

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* =================== REPASO INTELIGENTE =================== */
function qPrefix(id){
  return id + '::';
}

function activeMistakeEntries(){
  const prefix = qPrefix(activeCourse.id);
  return Object.entries(getMistakes()).filter(([k])=>
    k.startsWith(prefix) || (!k.includes('::') && activeCourse.id === COURSES[0].id)
  );
}

function findQuestionByKey(key){
  if(key.includes('::')){
    const i = key.indexOf('::');
    const cid = key.slice(0, i);
    const txt = key.slice(i + 2);
    const c = COURSES.find(x=>x.id === cid);
    if(c) return c.questions.find(x=>x.q === txt);
    return null;
  }
  for(const c of COURSES){
    const f = c.questions.find(x=>x.q === key);
    if(f) return f;
  }
  return null;
}

function weakTopics(minAnswers = 3){
  const agg = {};
  getHistory().forEach(h=>{
    if(h.courseId && h.courseId !== activeCourse.id) return;
    if(!h.courseId && activeCourse.id !== COURSES[0].id) return;
    Object.entries(h.cats || {}).forEach(([cat, s])=>{
      agg[cat] = agg[cat] || { r:0, t:0 };
      agg[cat].r += s.r || 0;
      agg[cat].t += s.t || 0;
    });
  });
  return Object.entries(agg)
    .map(([cat, s])=>({ cat, r:s.r, t:s.t, pct: s.t ? s.r/s.t : 1 }))
    .filter(x=>x.t >= minAnswers)
    .sort((a,b)=>a.pct-b.pct);
}

function buildReviewPool(){
  const qs = activeCourse.questions;
  const byQ = new Map(qs.map(q=>[q.q, q]));

  const pool = [];
  const pushQ = qq=>{ if(qq && !pool.includes(qq)) pool.push(qq); };

  activeMistakeEntries().forEach(([k])=>{
    const q = findQuestionByKey(k);
    if(q) pushQ(byQ.get(q.q) || q);
  });
  weakTopics(2).forEach(t=>{
    qs.filter(q=>q.cat === t.cat).forEach(q=>pushQ(q));
  });

  const rest = shuffle(qs.filter(q=>!pool.includes(q)));
  const final = shuffle(pool).concat(rest);
  const n = Math.min(Math.max(pool.length * 2, 4), qs.length);
  return final.slice(0, n);
}

function renderReviewCard(){
  const card = document.getElementById('modeRev');
  if(!card) return;
  const n = activeMistakeEntries().length;
  const num = document.getElementById('modeRevN');
  const lab = document.getElementById('modeRevL');
  if(n === 0){
    card.classList.add('emptied');
    card.removeAttribute('data-setup');
    card.setAttribute('aria-disabled','true');
    if(num) num.textContent = '0';
    if(lab) lab.textContent = 'sin fallos aún';
    return;
  }
  card.classList.remove('emptied');
  card.setAttribute('data-setup','repaso');
  card.removeAttribute('aria-disabled');
  if(num) num.textContent = n;
  if(lab) lab.textContent = 'repaso inteligente';
}

document.querySelectorAll('.mode-card').forEach(m=>{
  m.addEventListener('click', ()=>{
    if(m.getAttribute('aria-disabled') === 'true') return;
    document.querySelectorAll('.mode-card').forEach(x=>x.classList.remove('selected'));
    m.classList.add('selected');
  });
});

function startQuiz(){
  const qs = activeCourse.questions;
  if(qs.length === 0) return;
  const cards = document.querySelectorAll('.mode-card');
  let mode = 'normal';
  let setup = '';
  cards.forEach(c=>{ if(c.classList.contains('selected')) setup = c.dataset.setup || 'normal'; });
  mode = setup;

  if(mode === 'repaso'){
    quizQuestions = buildReviewPool();
  } else {
    const nRaw = parseInt(document.querySelector('.mode-card.selected').dataset.n, 10);
    const n = nRaw >= qs.length ? qs.length : nRaw;
    quizQuestions = shuffle(qs).slice(0, n);
  }
  qIndex = 0; score = 0; streak = 0; lives = 3; catStats = {};
  document.getElementById('quizIntro').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizPlay').style.display = 'block';
  document.getElementById('qTotalLabel').textContent = quizQuestions.length;
  renderLives();
  renderQuestion();
}

function renderLives(){
  const host = document.getElementById('livesRow');
  host.innerHTML = '';
  for(let i=0;i<3;i++){
    const filled = i < lives;
    host.innerHTML += `<svg viewBox="0 0 24 24" fill="${filled ? '#ff5da2' : 'none'}" stroke="${filled ? '#e83e8c' : '#f0c9dd'}" stroke-width="1.8"><path d="M13 2 3 14h7l-1 8 11-14h-8l1-6Z"/></svg>`;
  }
}

function renderQuestion(){
  answered = false;
  const item = quizQuestions[qIndex];
  document.getElementById('qCat').textContent = item.cat.toUpperCase();
  document.getElementById('qText').textContent = item.q;
  document.getElementById('qIndexLabel').textContent = qIndex + 1;
  document.getElementById('streakLabel').textContent = streak;
  document.getElementById('scoreLabel').textContent = score;
  document.getElementById('flameEmoji').textContent = streak >= 3 ? '🔥' : '';
  document.getElementById('qbarFill').style.width = (qIndex / quizQuestions.length * 100) + '%';
  document.getElementById('qFeedback').className = 'feedback';
  document.getElementById('nextBtn').style.display = 'none';
  setFace(document.getElementById('mascotQuiz'), 'normal');

  const optsHost = document.getElementById('qOpts');
  optsHost.innerHTML = '';
  const letters = ['A','B','C','D'];
  item.opts.forEach((opt, idx)=>{
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="letter">${letters[idx]}</span><span>${opt}</span>`;
    b.onclick = ()=> selectAnswer(idx);
    optsHost.appendChild(b);
  });
}

function selectAnswer(idx){
  if(answered) return;
  answered = true;
  const item = quizQuestions[qIndex];
  const opts = document.querySelectorAll('.opt');
  const correct = idx === item.correct;
  const mascot = document.getElementById('mascotQuiz');

  if(!catStats[item.cat]) catStats[item.cat] = {right:0, total:0};
  catStats[item.cat].total++;
  recordAnswer(activeCourse.id, item.q, correct);

  opts.forEach((o, i)=>{
    o.classList.add('disabled');
    if(i === item.correct) o.classList.add('correct');
    if(i === idx && !correct) o.classList.add('wrong');
  });

  const fb = document.getElementById('qFeedback');
  fb.classList.add('show');
  if(correct){
    streak++;
    const gain = 10 + Math.min(streak*2, 20);
    score += gain;
    catStats[item.cat].right++;
    fb.classList.add('ok'); fb.classList.remove('no');
    document.getElementById('fbHead').textContent = streak >= 3 ? `¡Racha de ${streak}! Correcto.` : '¡Correcto!';
    setFace(mascot, 'happy');
    playState(mascot, 'happy');
    const rect = opts[idx].getBoundingClientRect();
    burstConfetti(rect.left + rect.width/2, rect.top, streak>=3 ? 26 : 14);
    sparkAt(opts[idx], `+${gain} ⚡`);
    if(streak>=3) sparkAt(mascot, '🔥');
  } else {
    streak = 0;
    lives--;
    fb.classList.add('no'); fb.classList.remove('ok');
    document.getElementById('fbHead').textContent = 'No era esa.';
    setFace(mascot, 'sad');
    playState(mascot, 'sad');
    sparkAt(mascot, '💔');
  }
  document.getElementById('fbBody').textContent = item.exp;
  document.getElementById('scoreLabel').textContent = score;
  document.getElementById('streakLabel').textContent = streak;
  document.getElementById('flameEmoji').textContent = streak >= 3 ? '🔥' : '';
  renderLives();

  document.getElementById('nextBtn').textContent = (lives <= 0 || qIndex === quizQuestions.length-1) ? 'Ver resultado' : 'Siguiente →';
  document.getElementById('nextBtn').style.display = 'inline-flex';
}

function nextQuestion(){
  if(lives <= 0 || qIndex === quizQuestions.length - 1){
    finishQuiz();
    return;
  }
  qIndex++;
  renderQuestion();
}

function finishQuiz(){
  roundsPlayed++;
  document.getElementById('quizPlay').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';
  document.getElementById('qbarFill').style.width = '100%';

  const totalAnswered = Object.values(catStats).reduce((s,c)=>s+c.total,0);
  const totalRight = Object.values(catStats).reduce((s,c)=>s+c.right,0);
  const pct = totalAnswered ? Math.round(totalRight/totalAnswered*100) : 0;

  document.getElementById('resultScore').textContent = score;
  document.getElementById('resultSub').textContent = `puntos · ${totalRight}/${totalAnswered} correctas (${pct}%)`;

  const approved = pct >= 70;
  const awarded = score + (approved ? PASSING_BONUS : 0);
  if(awarded > 0){
    addChispas(awarded);
    renderShop();
    updateBalance();
    setTimeout(()=>sparkAt(mascotResult, `+${awarded} ⚡`), 400);
    document.getElementById('resultSub').textContent =
      `puntos · ${totalRight}/${totalAnswered} correctas (${pct}%) · Ganaste +${awarded} ⚡ chispas${approved ? ' (bono por aprobar)' : ''}`;
  }

  let title = '¡Sigue así!';
  const mascotResult = document.getElementById('mascotResult');
  if(lives <= 0){
    title = 'Se acabaron las vidas';
    setFace(mascotResult, 'sad');
    playState(mascotResult, 'sad');
  } else if(pct >= 90){
    title = '¡Dominas el tema!';
    setFace(mascotResult, 'excited');
    playState(mascotResult, 'excited');
    setTimeout(()=>burstConfetti(window.innerWidth/2, 120, 60), 150);
  } else if(pct >= 70){
    title = 'Muy buen manejo';
    setFace(mascotResult, 'happy');
    playState(mascotResult, 'happy');
    burstConfetti(window.innerWidth/2, 120, 30);
  } else {
    setFace(mascotResult, 'normal');
  }
  document.getElementById('resultTitle').textContent = title;

  const cb = document.getElementById('catBreakdown');
  cb.innerHTML = '';
  Object.keys(catStats).forEach(cat=>{
    const s = catStats[cat];
    const p = Math.round(s.right/s.total*100);
    cb.innerHTML += `
      <div class="cb-row">
        <div class="cb-name">${cat}</div>
        <div class="cb-track"><div class="cb-fill" style="width:${p}%"></div></div>
        <div class="cb-frac">${s.right}/${s.total}</div>
      </div>`;
  });

  updateSideProgress(pct);

  recordQuizResult({ score, right: totalRight, total: totalAnswered, pct, cats: catStats, courseId: activeCourse.id });
  renderStreak();
  renderReviewCard();
  renderSidebarStats();
  if(viewVisible('progreso')) renderProgress();
}

function viewVisible(v){
  return document.getElementById('view-'+v).classList.contains('active');
}

function resetQuiz(){
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizIntro').style.display = 'block';
  setFace(document.getElementById('mascotIntro'), 'normal');
}

function renderSidebarStats(){
  const hist = getHistory();
  const n = hist.length;
  const last = hist[n-1];
  const label = document.getElementById('sideProgressLabel');
  const bar = document.getElementById('sideProgressBar');
  if(!label || !bar) return;
  if(n === 0){
    label.textContent = 'Aún no juegas — 0 rondas';
    bar.style.width = '0%';
    document.getElementById('sideBubble').textContent = '¡Vamos, Zare! Primera ronda del quiz 🔥';
    return;
  }
  label.textContent = `${n} ronda${n===1?'':'s'} jugada${n===1?'':'s'} · última: ${last.pct}%`;
  bar.style.width = last.pct + '%';
}

function updateSideProgress(pct){
  renderSidebarStats();
  document.getElementById('sideBubble').textContent = pct >= 80 ? '¡Wow, vas increíble! 🌟' : '¡Buen intento! Repasemos un poco más 💪';
}

/* =================== ACCIONES (data-action / data-nav) =================== */
const actionHandlers = {
  startQuiz,
  resetQuiz,
  nextQuestion,
  goReview: ()=>{
    const card = document.getElementById('modeRev');
    if(!card || card.getAttribute('aria-disabled') === 'true') return;
    document.querySelectorAll('.mode-card').forEach(x=>x.classList.remove('selected'));
    card.classList.add('selected');
    goTo('quiz');
  },
};

document.addEventListener('click', (e)=>{
  const nav = e.target.closest('[data-nav]');
  if(nav){ goTo(nav.dataset.nav); return; }
  const action = e.target.closest('[data-action]');
  if(action && actionHandlers[action.dataset.action]) actionHandlers[action.dataset.action]();
});

/* =================== GUARDARROPA =================== */
function updateBalance(){
  const n = getChispas();
  const side = document.getElementById('sideSparks');
  const bal = document.getElementById('sparkBalance');
  if(side) side.textContent = n;
  if(bal) bal.textContent = n;
}

function updatePreviewLabels(){
  const eq = getEquipped();
  const set = (elId, catId)=>{
    const it = findItem(catId, eq[catId]);
    const el = document.getElementById(elId);
    if(el) el.textContent = it ? it.name : '—';
  };
  set('pvColor','color');
  set('pvRopa','ropa');
  set('pvAccesorio','accesorio');
  set('pvAura','aura');
  set('pvPet','pet');
}

function renderShop(){
  const host = document.getElementById('shopHost');
  if(!host) return;
  host.innerHTML = '';
  WARDROBE.forEach(cat=>{
    const sec = document.createElement('div');
    sec.className = 'shop-cat';
    const h = document.createElement('h3');
    h.textContent = cat.label;
    const grid = document.createElement('div');
    grid.className = 'shop-items';

    cat.items.forEach(item=>{
      const equipped = getEquipped()[cat.id] === item.id;
      const owned = item.cost === 0 || owns(item.id);
      const affordable = getChispas() >= item.cost;

      const card = document.createElement('div');
      card.className = 'shop-item' + (equipped ? ' equipped' : '');
      const visual = item.swatch
        ? `<span class="swatch" style="background:${item.swatch}"></span>`
        : item.icon || '';
      card.innerHTML = `
        <div class="si-visual">${visual}</div>
        <div class="si-name">${item.name}</div>`;

      const mini = document.createElement('span');
      mini.className = 'btn-mini' + (owned && !equipped ? ' equip-only' : '');
      if(equipped){
        mini.textContent = 'Equipado';
        mini.setAttribute('disabled','');
      } else if(owned){
        mini.textContent = 'Equipar';
        mini.dataset.buy = item.id;
      } else {
        mini.textContent = '⚡ ' + item.cost;
        mini.dataset.buy = item.id;
        if(!affordable) mini.setAttribute('disabled','');
      }
      card.appendChild(mini);
      card.addEventListener('mouseenter', ()=>previewAvatar(cat.id, item.id));
      card.addEventListener('mouseleave', ()=>applyAvatar());
      grid.appendChild(card);
    });

    sec.appendChild(h);
    sec.appendChild(grid);
    host.appendChild(sec);
  });
}

document.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-buy]');
  if(!btn) return;
  const item = findItemById(btn.dataset.buy);
  if(!item) return;
  const cat = categoryOf(item.id);
  const equipped = getEquipped()[cat] === item.id;
  const owned = item.cost === 0 || owns(item.id);
  let bought = false;

  if(!owned && item.cost > 0){
    bought = buyAndEquip(cat, item.id, item.cost);
  } else if(!equipped){
    equipCategory(cat, item.id);
  }

  const preview = document.getElementById('mascotPreview');
  if(preview) sparkAt(preview, bought ? '🛍️' : '✨');
  applyAvatar();
  renderShop();
  updateBalance();
  updatePreviewLabels();
});

document.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-progress]');
  if(!btn) return;

  if(btn.dataset.progress === 'export'){
    const blob = new Blob([exportSave()], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chispa-atp-progreso.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    sparkAt(document.getElementById('mascotPreview'), '💾');
    return;
  }

  if(btn.dataset.progress === 'import'){
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
        refreshAfterState();
        sparkAt(document.getElementById('mascotPreview'), '📥');
      };
      fr.readAsText(file);
    };
    inp.click();
    return;
  }

  if(btn.dataset.progress === 'reset'){
    if(!confirm('¿Reiniciar TODO el progreso? Chispas, guardarropa, racha e historial volverán a cero.')) return;
    resetAll();
    refreshAfterState();
    document.getElementById('sideBubble').textContent = 'Listo, fresco como una célula nueva 🧼';
    return;
  }

  if(btn.dataset.progress === 'limpiar-errores'){
    clearMistakes();
    renderProgress();
    renderReviewCard();
    sparkAt(document.getElementById('mascotPreview'), '🧽');
  }
});

function refreshAfterState(){
  applyTheme(getTheme());
  renderShop();
  updateBalance();
  updatePreviewLabels();
  renderStreak();
  renderSidebarStats();
  renderReviewCard();
  renderProgress();
}

window.addChispas = (n) => {
  addChispas(n);
  renderShop();
  updateBalance();
  updatePreviewLabels();
  return getChispas();
};

/* =================== PROGRESO =================== */
function pctColor(p){
  if(p >= 80) return 'var(--mint)';
  if(p >= 60) return 'var(--yellow)';
  return '#ff6b6b';
}

function renderWeakTopics(){
  const host = document.getElementById('weakTopics');
  if(!host) return;
  const weak = weakTopics();
  if(weak.length === 0){
    host.innerHTML = `<div class="empty-state">Juega al menos 3 preguntas por tema y verás aquí tus temas débiles 📊</div>`;
    return;
  }
  host.innerHTML = weak.map(t=>`
    <div class="wt-row">
      <div class="wt-name">${t.cat}</div>
      <div class="wt-num">${Math.round(t.pct*100)}% <small>· ${t.r}/${t.t}</small></div>
      <div class="cb-track"><div class="cb-fill" style="width:${t.pct*100}%; background:${pctColor(t.pct*100)}"></div></div>
    </div>`).join('');
}

function renderHistory(){
  const host = document.getElementById('historyList');
  if(!host) return;
  const hist = getHistory();
  if(hist.length === 0){
    host.innerHTML = `<div class="empty-state">Aún no hay rondas registradas. ¡Juega el quiz y tu progreso se guardará aquí! 🎮</div>`;
    return;
  }
  const recent = hist.slice(-8).reverse();
  host.innerHTML = recent.map(h=>{
    const d = new Date(h.t).toLocaleDateString('es-MX', { day:'numeric', month:'short' });
    const aprobada = h.pct >= 70;
    return `
      <div class="hist-row">
        <div class="hist-date">${d}</div>
        <div class="cb-track"><div class="cb-fill" style="width:${h.pct}%; background:${pctColor(h.pct)}"></div></div>
        <div class="hist-pct">${h.pct}%</div>
        <div class="hist-score">${h.score} pts${aprobada ? ' · 🎉' : ''}</div>
      </div>`;
  }).join('');
}

function renderMistakes(){
  const host = document.getElementById('mistakesList');
  if(!host) return;
  const pending = activeMistakeEntries();
  if(pending.length === 0){
    host.innerHTML = `<div class="empty-state">Sin fallos registrados en esta materia. Sigue así 💪</div>`;
    return;
  }
  host.innerHTML = pending.map(([k, m])=>{
    const item = findQuestionByKey(k);
    if(!item) return '';
    const correct = item.opts[item.correct];
    return `
      <div class="mistake-card">
        <div class="mc-top"><span class="q-cat" style="margin:0">${item.cat.toUpperCase()}</span>
          <span class="mc-ratio">✖${m.wrong} · ✔${m.right}</span>
        </div>
        <p class="mc-q">${item.q}</p>
        <div class="mc-correct">✓ ${escapeHtml(correct)}</div>
        <div class="mc-exp">${item.exp}</div>
      </div>`;
  }).join('') + `
    <div class="mistake-actions">
      <div class="hero-actions" style="justify-content:center;">
        <button class="btn btn-primary" data-action="goReview">🎯 Repasar estos fallos</button>
        <button class="btn btn-ghost" data-progress="limpiar-errores" style="background:var(--pink-pale); color:var(--pink-deep); border-color:var(--pink);">Limpiar lista</button>
      </div>
    </div>`;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function renderProgress(){
  if(!document.getElementById('weakTopics')) return;
  renderWeakTopics();
  renderHistory();
  renderMistakes();
  const hist = getHistory();
  const total = hist.length;
  const avg = hist.length ? Math.round(hist.reduce((s,h)=>s+h.pct,0)/hist.length) : 0;
  const best = hist.length ? Math.max(...hist.map(h=>h.pct)) : 0;
  const presents = document.getElementById('progressStats');
  if(presents){
    presents.innerHTML = `
      <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-lab">rondas jugadas</div></div>
      <div class="stat-card mint"><div class="stat-num">${avg}%</div><div class="stat-lab">promedio general</div></div>
      <div class="stat-card"><div class="stat-num">${best}%</div><div class="stat-lab">mejor ronda</div></div>`;
  }
}

/* =================== INIT =================== */
renderCourseTabs();
renderApuntes();
renderClaves();
renderQuizCounts();
applyAvatar();
renderShop();
updateBalance();
updatePreviewLabels();
renderStreak();
renderSidebarStats();
renderReviewCard();
renderProgress();