import { SURVIVOR_BALANCE } from './balance.js';
import { PET_WEAPONS } from './pets.js';
import { SURVIVOR_POWERS, powerById } from './powers.js';
import { CHISPA_MITO_ID } from './weapons.js';

const initial = () => ({
  status: 'intro',
  life: SURVIVOR_BALANCE.player.maxLife,
  maxLife: SURVIVOR_BALANCE.player.maxLife,
  time: 0,
  level: 1,
  xp: 0,
  xpToNext: xpToNext(1),
  correctAnswers: 0,
  wrongAnswers: 0,
  answerStreak: 0,
  correctStreak: 0,
  maxCorrectStreak: 0,
  wrongStreak: 0,
  rerolls: 0,
  reviveUsed: false,
  reviveProgress: 0,
  bossActive: false,
  bossLife: 0,
  bossMaxLife: SURVIVOR_BALANCE.boss.life,
  bossShields: 0,
  bossMaxShields: SURVIVOR_BALANCE.boss.shields,
  bossDefeated: false,
  awardedChispas: 0,
  endedReason: '',
  chispaLevel: 1,
  petWeapon: null,
  powers: {},
  upgradeOptions: [],
  penaltyChanges: [],
});

let session = initial();

export function xpToNext(level, balance = SURVIVOR_BALANCE){
  const xp = balance.xp || SURVIVOR_BALANCE.xp;
  return Math.max(1, xp.baseToNext + Math.max(0, level - 1) * xp.growth);
}

export function finalChispas(result, balance = SURVIVOR_BALANCE){
  const rewards = balance.rewards || SURVIVOR_BALANCE.rewards;
  const revived = Boolean(result.reviveUsed || result.revived);
  return rewards.base
    + Math.max(0, result.correctAnswers || 0) * rewards.correctAnswer
    + (revived ? 0 : rewards.noRevive)
    + (result.bossDefeated ? rewards.bossDefeated : 0);
}

function cloneOption(option){
  return { ...option };
}

function cloneSession(value){
  return {
    ...value,
    petWeapon:value.petWeapon ? { ...value.petWeapon } : null,
    powers:{ ...value.powers },
    upgradeOptions:value.upgradeOptions.map(cloneOption),
    penaltyChanges:(value.penaltyChanges || []).map(cloneOption),
  };
}

function bossFields(snapshot){
  const boss = snapshot?.boss;
  if(!boss) return {};
  return {
    bossActive:Boolean(boss.active),
    bossLife:Math.max(0, Math.round(boss.life || 0)),
    bossMaxLife:Math.max(1, Math.round(boss.maxLife || SURVIVOR_BALANCE.boss.life)),
    bossShields:Math.max(0, Math.round(boss.shields || 0)),
    bossMaxShields:Math.max(0, Math.round(boss.maxShields || SURVIVOR_BALANCE.boss.shields)),
  };
}

function powerLevel(value){
  return Math.max(0, Math.min(8, Math.round(Number(value) || 0)));
}

function penaltyCandidates(currentSession){
  const candidates = [];
  const petLevel = powerLevel(currentSession?.petWeapon?.level);
  if(currentSession?.petWeapon && petLevel > 0){
    const petDefinition = PET_WEAPONS[currentSession.petWeapon.petId];
    candidates.push({ type:'pet', id:currentSession.petWeapon.id, name:petDefinition?.name || 'Arma de mascota', level:petLevel, order:0 });
  }

  let order = 1;
  for(const [id, value] of Object.entries(currentSession?.powers || {})){
    const level = powerLevel(value);
    const power = powerById(id);
    if(!power || level <= 0) continue;
    candidates.push({ type:'power', id, name:power.name, level, order });
    order++;
  }

  candidates.sort((a, b)=>a.level - b.level || a.order - b.order);
  return candidates;
}

function applyOnePenalty(currentSession){
  const target = penaltyCandidates(currentSession)[0];
  if(!target) return { session:currentSession, change:null };
  const nextLevel = target.level - 1;
  const change = { type:target.type, id:target.id, name:target.name, from:target.level, to:nextLevel };

  if(target.type === 'pet'){
    return {
      session:{ ...currentSession, petWeapon:{ ...currentSession.petWeapon, level:nextLevel } },
      change,
    };
  }

  const powers = { ...currentSession.powers };
  if(nextLevel <= 0) delete powers[target.id];
  else powers[target.id] = nextLevel;
  return { session:{ ...currentSession, powers }, change };
}

function shuffleCandidates(candidates, rng){
  const pool = candidates.map(cloneOption);
  const selected = [];
  while(pool.length && selected.length < 3){
    const index = Math.min(pool.length - 1, Math.floor((Number(rng()) || 0) * pool.length));
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}

export function buildUpgradeOptions(currentSession, rng = Math.random){
  const candidates = [];
  const chispaLevel = Math.max(1, Math.min(8, Math.round(Number(currentSession?.chispaLevel) || 1)));
  if(chispaLevel < 8){
    candidates.push({ type:'weapon', id:CHISPA_MITO_ID, name:'Chispa de Mito', currentLevel:chispaLevel, nextLevel:chispaLevel + 1 });
  }

  const petWeapon = currentSession?.petWeapon;
  const petLevel = Math.max(0, Math.min(8, Math.round(Number(petWeapon?.level) || 0)));
  if(petWeapon && petLevel < 8){
    const petDefinition = PET_WEAPONS[petWeapon.petId];
    candidates.push({ type:'pet', id:petWeapon.id, name:petDefinition?.name || 'Arma de mascota', currentLevel:petLevel, nextLevel:petLevel + 1 });
  }

  const powers = currentSession?.powers || {};
  for(const power of SURVIVOR_POWERS){
    const level = Math.max(0, Math.min(8, Math.round(Number(powers[power.id]) || 0)));
    if(level >= 8) continue;
    candidates.push({ type:'power', id:power.id, name:power.name, currentLevel:level, nextLevel:level + 1 });
  }

  return shuffleCandidates(candidates, rng);
}

export function applyPenalty(currentSession){
  let next = cloneSession(currentSession);
  const changes = [];
  const total = next.wrongStreak >= 3 ? 2 : 1;

  for(let i=0; i<total; i++){
    const result = applyOnePenalty(next);
    next = result.session;
    if(result.change) changes.push(result.change);
  }

  if(next.wrongStreak >= 3) next = { ...next, wrongStreak:0 };
  return { session:{ ...next, penaltyChanges:changes }, changes };
}

export function resetSession(){
  session = initial();
  return getSession();
}

export function startSession(petWeapon = null){
  session = { ...initial(), status:'running', petWeapon:petWeapon ? { ...petWeapon, level:petWeapon.level || 1 } : null };
  return getSession();
}

export function pauseSession(){
  if(session.status === 'running') session = { ...session, status:'paused' };
  return getSession();
}

export function resumeSession(){
  if(session.status === 'paused') session = { ...session, status:'running' };
  return getSession();
}

export function updateSessionFromEngine(snapshot){
  if(session.status !== 'running' && session.status !== 'gameover') return getSession();
  session = {
    ...session,
    life: Math.max(0, Math.round(snapshot.player.life)),
    time: snapshot.time,
    level: snapshot.level || session.level,
    xp: snapshot.xp ?? session.xp,
    xpToNext: snapshot.xpToNext || session.xpToNext,
    ...bossFields(snapshot),
  };
  return getSession();
}

export function recordLevelUp(snapshot){
  session = {
    ...session,
    status:'question',
    life: Math.max(0, Math.round(snapshot.player.life)),
    time: snapshot.time,
    level: snapshot.level || session.level,
    xp: snapshot.xp ?? session.xp,
    xpToNext: snapshot.xpToNext || session.xpToNext,
    ...bossFields(snapshot),
  };
  return getSession();
}

export function startReviveChallenge(snapshot){
  if(session.reviveUsed) return getSession();
  session = {
    ...session,
    status:'revive',
    reviveProgress:0,
    life: Math.max(0, Math.round(snapshot.player.life)),
    time: snapshot.time,
    level: snapshot.level || session.level,
    xp: snapshot.xp ?? session.xp,
    xpToNext: snapshot.xpToNext || session.xpToNext,
    ...bossFields(snapshot),
    penaltyChanges:[],
  };
  return getSession();
}

export function recordReviveAnswer(correct){
  const answerStreak = correct ? session.answerStreak + 1 : 0;
  session = {
    ...session,
    correctAnswers:session.correctAnswers + (correct ? 1 : 0),
    wrongAnswers:session.wrongAnswers + (correct ? 0 : 1),
    reviveProgress:correct ? Math.min(3, session.reviveProgress + 1) : session.reviveProgress,
    answerStreak,
    maxCorrectStreak:Math.max(session.maxCorrectStreak, answerStreak),
    penaltyChanges:[],
  };
  return getSession();
}

export function completeRevive(snapshot){
  session = {
    ...session,
    status:'paused',
    reviveUsed:true,
    reviveProgress:3,
    life: Math.max(0, Math.round(snapshot.player.life)),
    time: snapshot.time,
    level: snapshot.level || session.level,
    xp: snapshot.xp ?? session.xp,
    xpToNext: snapshot.xpToNext || session.xpToNext,
    ...bossFields(snapshot),
  };
  return getSession();
}

export function recordSurvivorAnswer(correct){
  if(correct){
    const nextStreak = session.correctStreak + 1;
    const answerStreak = session.answerStreak + 1;
    session = {
      ...session,
      correctAnswers:session.correctAnswers + 1,
      answerStreak,
      correctStreak:nextStreak,
      maxCorrectStreak:Math.max(session.maxCorrectStreak, answerStreak),
      wrongStreak:0,
      rerolls:nextStreak % 3 === 0 ? Math.min(3, session.rerolls + 1) : session.rerolls,
      penaltyChanges:[],
    };
    return getSession();
  }
  const next = {
    ...session,
    wrongAnswers:session.wrongAnswers + 1,
    answerStreak:0,
    wrongStreak:session.wrongStreak + 1,
    correctStreak:0,
  };
  session = applyPenalty(next).session;
  return getSession();
}

export function recordBossAnswer(correct){
  const answerStreak = correct ? session.answerStreak + 1 : 0;
  session = {
    ...session,
    correctAnswers:session.correctAnswers + (correct ? 1 : 0),
    wrongAnswers:session.wrongAnswers + (correct ? 0 : 1),
    answerStreak,
    maxCorrectStreak:Math.max(session.maxCorrectStreak, answerStreak),
    penaltyChanges:[],
  };
  return getSession();
}

export function prepareUpgradeOptions(rng = Math.random){
  session = { ...session, upgradeOptions:buildUpgradeOptions(session, rng) };
  return getSession();
}

export function spendReroll(rng = Math.random){
  if(session.rerolls <= 0) return getSession();
  const next = { ...session, rerolls:session.rerolls - 1 };
  session = { ...next, upgradeOptions:buildUpgradeOptions(next, rng) };
  return getSession();
}

export function applySurvivorUpgrade(optionId){
  const option = session.upgradeOptions.find(item => item.id === optionId);
  if(!option) return getSession();

  if(option.type === 'weapon' && option.id === CHISPA_MITO_ID){
    session = { ...session, chispaLevel:Math.min(8, session.chispaLevel + 1), upgradeOptions:[] };
    return getSession();
  }

  if(option.type === 'pet' && session.petWeapon?.id === option.id){
    session = { ...session, petWeapon:{ ...session.petWeapon, level:Math.min(8, (Number(session.petWeapon.level) || 0) + 1) }, upgradeOptions:[] };
    return getSession();
  }

  if(option.type === 'power' && powerById(option.id)){
    const level = Math.min(8, (session.powers[option.id] || 0) + 1);
    session = { ...session, powers:{ ...session.powers, [option.id]:level }, upgradeOptions:[] };
  }

  return getSession();
}

export function endSession(reason = 'dead'){
  const ended = { ...session, status:'gameover', endedReason:reason };
  if(reason === 'dead') ended.life = 0;
  if(reason === 'won') ended.bossDefeated = true;
  ended.awardedChispas = finalChispas(ended);
  session = ended;
  return getSession();
}

export function getSession(){
  return cloneSession(session);
}
