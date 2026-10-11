import { SURVIVOR_BALANCE } from './balance.js';
import { PET_WEAPONS, petWeaponStats } from './pets.js';
import { xpToNext } from './session.js';
import { CHISPA_MITO_ID, nearestEnemy, protectedWeaponLevel, weaponStats } from './weapons.js';

const raf = fn => (globalThis.requestAnimationFrame || (cb => setTimeout(()=>cb(performance.now()), 16)))(fn);
const caf = id => (globalThis.cancelAnimationFrame || clearTimeout)(id);

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function distance(a, b){
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(input){
  const x = Number(input?.x) || 0;
  const y = Number(input?.y) || 0;
  const len = Math.hypot(x, y);
  if(!len) return { x:0, y:0 };
  return { x:x / len, y:y / len };
}

function spawnPoint(balance, random){
  const edge = Math.floor(random() * 4);
  const pad = balance.waves.spawnPadding;
  if(edge === 0) return { x:random() * balance.worldWidth, y:-pad };
  if(edge === 1) return { x:balance.worldWidth + pad, y:random() * balance.worldHeight };
  if(edge === 2) return { x:random() * balance.worldWidth, y:balance.worldHeight + pad };
  return { x:-pad, y:random() * balance.worldHeight };
}

function cloneEnemy(enemy){
  return { ...enemy };
}

function cloneProjectile(projectile){
  return {
    x: projectile.x,
    y: projectile.y,
    vx: projectile.vx,
    vy: projectile.vy,
    damage: projectile.damage,
    life: projectile.life,
    hitsLeft: projectile.hitsLeft,
    explosionRadius: projectile.explosionRadius,
    weaponId: projectile.weaponId,
  };
}

function cloneGem(gem){
  return { ...gem };
}

function cloneBoss(boss){
  return { ...boss };
}

function rotate(vector, angle){
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

function directionTo(origin, target){
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x:dx / len, y:dy / len };
}

export function createEngine(options = {}){
  const balance = options.balance || SURVIVOR_BALANCE;
  const getInput = options.getInput || (()=>({ x:0, y:0 }));
  const random = options.random || Math.random;
  const onFrame = options.onFrame || (()=>{});
  const onPlayerDead = options.onPlayerDead || (()=>{});
  const onLevelUp = options.onLevelUp || (()=>{});
  const onBossShieldReady = options.onBossShieldReady || (()=>{});
  const onGameWon = options.onGameWon || (()=>{});
  const initialPetWeapon = options.petWeapon && PET_WEAPONS[options.petWeapon.petId] ? { ...options.petWeapon } : null;

  let player, enemies, enemyPool, projectiles, gems, gemPool, boss, running, paused, frameId, lastTime, elapsed, nextWave, nextBossWave, nextId, deadSent, levelSent, bossShieldSent, gameWonSent, level, xp, nextXp, lastLevelQuestionAt, weaponLevels, weaponCooldowns, activePetWeapon;

  function snapshot(){
    return {
      time: elapsed,
      running,
      paused,
      player: { ...player },
      enemies: enemies.map(cloneEnemy),
      projectiles: projectiles.filter(projectile => projectile.active).map(cloneProjectile),
      gems: gems.map(cloneGem),
      boss: cloneBoss(boss),
      level,
      xp,
      xpToNext: nextXp,
      petWeapon: activePetWeapon ? { ...activePetWeapon } : null,
      world: { width:balance.worldWidth, height:balance.worldHeight },
    };
  }

  function reset(){
    player = {
      x: balance.worldWidth / 2,
      y: balance.worldHeight / 2,
      life: balance.player.maxLife,
      invulnerable: 0,
    };
    enemies = [];
    enemyPool = [];
    gems = [];
    gemPool = [];
    boss = {
      active: false,
      x: balance.worldWidth / 2,
      y: -80,
      life: balance.boss?.life || SURVIVOR_BALANCE.boss.life,
      maxLife: balance.boss?.life || SURVIVOR_BALANCE.boss.life,
      shields: balance.boss?.shields ?? SURVIVOR_BALANCE.boss.shields,
      maxShields: balance.boss?.shields ?? SURVIVOR_BALANCE.boss.shields,
      frozen: 0,
      pressure: 0,
      questionPending: false,
      nextQuestionAt: Infinity,
      vulnerable: false,
    };
    projectiles = Array.from({ length:balance.weapons?.projectilePoolSize || SURVIVOR_BALANCE.weapons.projectilePoolSize }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      damage: 0,
      life: 0,
      hitsLeft: 0,
      explosionRadius: 0,
      weaponId: '',
      targetId: 0,
      turn: 0,
      hitIds: [],
    }));
    running = false;
    paused = false;
    frameId = 0;
    lastTime = 0;
    elapsed = 0;
    nextWave = balance.waves.firstDelay;
    nextBossWave = Infinity;
    nextId = 1;
    deadSent = false;
    levelSent = false;
    bossShieldSent = false;
    gameWonSent = false;
    level = 1;
    xp = 0;
    nextXp = xpToNext(level, balance);
    lastLevelQuestionAt = -Infinity;
    activePetWeapon = initialPetWeapon ? { ...initialPetWeapon, level:protectedWeaponLevel(initialPetWeapon.id, initialPetWeapon.level) || 1 } : null;
    weaponLevels = { [CHISPA_MITO_ID]:1 };
    weaponCooldowns = { [CHISPA_MITO_ID]:0 };
    if(activePetWeapon){
      weaponLevels[activePetWeapon.id] = activePetWeapon.level;
      weaponCooldowns[activePetWeapon.id] = 0;
    }
  }

  function waveSize(){
    return balance.waves.baseCount + Math.floor(elapsed / balance.waves.growthEvery) * balance.waves.growthAmount;
  }

  function bossBalance(){
    return balance.boss || SURVIVOR_BALANCE.boss;
  }

  function matchDuration(){
    return balance.match?.duration ?? SURVIVOR_BALANCE.match.duration;
  }

  function spawnWave(){
    const available = Math.max(0, balance.enemy.maxCount - enemies.length);
    const count = Math.min(available, waveSize());
    for(let i=0; i<count; i++){
      spawnEnemy();
    }
  }

  function spawnEnemy(){
    const point = spawnPoint(balance, random);
    const enemy = enemyPool.pop() || { id:0, life:0, x:0, y:0, blocked:0 };
    enemy.id = nextId++;
    enemy.life = balance.enemy.life || SURVIVOR_BALANCE.enemy.life;
    enemy.x = point.x;
    enemy.y = point.y;
    enemy.blocked = 0;
    enemies.push(enemy);
  }

  function startBoss(){
    if(boss.active) return;
    const cfg = bossBalance();
    boss = {
      ...boss,
      active: true,
      x: balance.worldWidth / 2,
      y: Math.max(cfg.radius, 72),
      life: cfg.life,
      maxLife: cfg.life,
      shields: cfg.shields,
      maxShields: cfg.shields,
      frozen: 0,
      pressure: 0,
      questionPending: false,
      nextQuestionAt: elapsed,
      vulnerable: cfg.shields <= 0,
    };
    nextBossWave = elapsed + cfg.waveInterval;
  }

  function spawnBossWave(){
    const cfg = bossBalance();
    const available = Math.max(0, balance.enemy.maxCount - enemies.length);
    const count = Math.min(available, cfg.baseWaveCount + boss.pressure * cfg.pressureWaveBonus);
    for(let i=0; i<count; i++){
      spawnEnemy();
    }
  }

  function nearestCombatTarget(origin){
    const enemy = nearestEnemy(origin, enemies);
    if(!boss.active || boss.life <= 0) return enemy;
    if(!enemy) return boss;
    const enemyDx = enemy.x - origin.x;
    const enemyDy = enemy.y - origin.y;
    const bossDx = boss.x - origin.x;
    const bossDy = boss.y - origin.y;
    return bossDx * bossDx + bossDy * bossDy < enemyDx * enemyDx + enemyDy * enemyDy ? boss : enemy;
  }

  function targetById(id){
    if(id === 'boss' && boss.active && boss.life > 0) return boss;
    for(const enemy of enemies){
      if(enemy.id === id && enemy.life > 0) return enemy;
    }
    return null;
  }

  function projectileSlot(){
    return projectiles.find(projectile => !projectile.active);
  }

  function launchProjectile(stats, direction, extra = {}){
    const slot = projectileSlot();
    if(!slot) return;
    slot.active = true;
    slot.x = player.x;
    slot.y = player.y;
    slot.vx = direction.x * stats.speed;
    slot.vy = direction.y * stats.speed;
    slot.damage = stats.damage;
    slot.life = extra.life || balance.weapons?.projectileLife || SURVIVOR_BALANCE.weapons.projectileLife;
    slot.hitsLeft = stats.pierce + 1;
    slot.explosionRadius = stats.explosionRadius;
    slot.weaponId = extra.weaponId || CHISPA_MITO_ID;
    slot.targetId = extra.targetId || 0;
    slot.turn = extra.turn || 0;
    slot.hitIds.length = 0;
  }

  function fireChispa(){
    const target = nearestCombatTarget(player);
    if(!target) return;
    const stats = weaponStats(CHISPA_MITO_ID, weaponLevels[CHISPA_MITO_ID], balance);
    const direction = directionTo(player, target);
    const spread = stats.projectiles === 1 ? 0 : 0.18;
    const start = -spread * (stats.projectiles - 1) / 2;
    for(let i=0; i<stats.projectiles; i++) launchProjectile(stats, rotate(direction, start + spread * i));
  }

  function fireShortProjectiles(stats){
    const target = nearestCombatTarget(player);
    if(!target) return;
    const direction = directionTo(player, target);
    const spread = stats.projectiles === 1 ? 0 : stats.spread;
    const start = -spread * (stats.projectiles - 1) / 2;
    const life = stats.range / stats.speed;
    for(let i=0; i<stats.projectiles; i++){
      launchProjectile(stats, rotate(direction, start + spread * i), { life, weaponId:activePetWeapon.id });
    }
  }

  function fireHomingProjectiles(stats){
    const target = nearestCombatTarget(player);
    if(!target) return;
    const total = stats.projectiles * stats.burst;
    const direction = directionTo(player, target);
    const spread = total === 1 ? 0 : 0.2;
    const start = -spread * (total - 1) / 2;
    for(let i=0; i<total; i++){
      launchProjectile(stats, rotate(direction, start + spread * i), { weaponId:activePetWeapon.id, targetId:target === boss ? 'boss' : target.id, turn:stats.turn });
    }
  }

  function firePulse(stats){
    if(stats.shieldTime > 0) player.invulnerable = Math.max(player.invulnerable, stats.shieldTime);
    for(let pulse=0; pulse<stats.pulses; pulse++){
      for(const enemy of enemies){
        if(enemy.life <= 0 || distance(player, enemy) > stats.radius) continue;
        damageEnemy(enemy, stats.damage);
        const dir = directionTo(player, enemy);
        enemy.x = clamp(enemy.x + dir.x * stats.knockback, -balance.waves.spawnPadding, balance.worldWidth + balance.waves.spawnPadding);
        enemy.y = clamp(enemy.y + dir.y * stats.knockback, -balance.waves.spawnPadding, balance.worldHeight + balance.waves.spawnPadding);
        if(stats.weakBlock && enemy.life <= (balance.enemy.life || SURVIVOR_BALANCE.enemy.life)) enemy.blocked = Math.max(enemy.blocked || 0, 0.45);
      }
      if(boss.active && boss.life > 0 && distance(player, boss) <= stats.radius + (bossBalance().radius || SURVIVOR_BALANCE.boss.radius)){
        damageBoss(stats.damage);
      }
    }
    compactEnemies();
  }

  function firePetWeapon(){
    if(!activePetWeapon) return;
    const weapon = PET_WEAPONS[activePetWeapon.petId];
    if((weaponLevels[activePetWeapon.id] || 0) <= 0) return;
    const stats = petWeaponStats(activePetWeapon.petId, weaponLevels[activePetWeapon.id], balance);
    if(!weapon || !stats) return;
    weapon.fire(stats, { fireShortProjectiles, fireHomingProjectiles, firePulse });
  }

  function updateWeapons(step){
    weaponCooldowns[CHISPA_MITO_ID] = Math.max(0, weaponCooldowns[CHISPA_MITO_ID] - step);
    if(weaponCooldowns[CHISPA_MITO_ID] <= 0){
      const stats = weaponStats(CHISPA_MITO_ID, weaponLevels[CHISPA_MITO_ID], balance);
      fireChispa();
      weaponCooldowns[CHISPA_MITO_ID] = stats.cooldown;
    }
    if(!activePetWeapon) return;
    const petId = activePetWeapon.id;
    weaponCooldowns[petId] = Math.max(0, weaponCooldowns[petId] - step);
    if(weaponCooldowns[petId] > 0) return;
    const stats = petWeaponStats(activePetWeapon.petId, weaponLevels[petId], balance);
    firePetWeapon();
    if(stats) weaponCooldowns[petId] = stats.cooldown;
  }

  function damageEnemy(enemy, damage){
    const wasAlive = enemy.life > 0;
    enemy.life = Math.max(0, enemy.life - damage);
    if(wasAlive && enemy.life <= 0){
      const xpBalance = balance.xp || SURVIVOR_BALANCE.xp;
      spawnGem(enemy.x, enemy.y, xpBalance.gemValue);
    }
  }

  function spawnGem(x, y, value){
    const xpBalance = balance.xp || SURVIVOR_BALANCE.xp;
    const maxGems = xpBalance.maxGems || SURVIVOR_BALANCE.xp.maxGems || 90;
    if(gems.length >= maxGems) return;
    const gem = gemPool.pop() || { id:0, x:0, y:0, value:0 };
    gem.id = nextId++;
    gem.x = x;
    gem.y = y;
    gem.value = value;
    gems.push(gem);
  }

  function compactEnemies(){
    let write = 0;
    for(let read=0; read<enemies.length; read++){
      const enemy = enemies[read];
      if(enemy.life > 0){
        enemies[write++] = enemy;
      }
      else{
        enemyPool.push(enemy);
      }
    }
    enemies.length = write;
  }

  function damageBoss(damage){
    if(!boss.active || boss.life <= 0) return;
    const cfg = bossBalance();
    const amount = boss.shields > 0 ? Math.min(Math.max(0, damage), cfg.shieldedDamage) : Math.max(0, damage);
    boss.life = Math.max(0, boss.life - amount);
    if(boss.life <= 0 && !gameWonSent){
      boss.life = 0;
      gameWonSent = true;
      running = false;
      onGameWon(snapshot());
    }
  }

  function explode(projectile, directHit){
    if(projectile.explosionRadius <= 0) return;
    for(const enemy of enemies){
      if(enemy === directHit || enemy.life <= 0) continue;
      if(distance(projectile, enemy) <= projectile.explosionRadius) damageEnemy(enemy, projectile.damage);
    }
    if(boss.active && boss !== directHit && boss.life > 0 && distance(projectile, boss) <= projectile.explosionRadius + (bossBalance().radius || SURVIVOR_BALANCE.boss.radius)){
      damageBoss(projectile.damage);
    }
  }

  function projectileHits(projectile, enemy){
    const hitId = enemy === boss ? 'boss' : enemy.id;
    if(enemy.life <= 0 || projectile.hitIds.includes(hitId)) return false;
    const targetRadius = enemy === boss ? (bossBalance().radius || SURVIVOR_BALANCE.boss.radius) : balance.enemy.radius;
    const radius = (balance.weapons?.projectileRadius || SURVIVOR_BALANCE.weapons.projectileRadius) + targetRadius;
    return distance(projectile, enemy) <= radius;
  }

  function updateProjectiles(step){
    for(const projectile of projectiles){
      if(!projectile.active) continue;
      if(projectile.turn > 0){
        const target = targetById(projectile.targetId) || nearestCombatTarget(projectile);
        if(target){
          const dir = directionTo(projectile, target);
          const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
          const amount = Math.min(1, projectile.turn * step);
          projectile.vx = projectile.vx * (1 - amount) + dir.x * speed * amount;
          projectile.vy = projectile.vy * (1 - amount) + dir.y * speed * amount;
        }
      }
      projectile.x += projectile.vx * step;
      projectile.y += projectile.vy * step;
      projectile.life -= step;
      if(projectile.life <= 0){
        projectile.active = false;
        continue;
      }
      for(const enemy of enemies){
        if(!projectileHits(projectile, enemy)) continue;
        projectile.hitIds.push(enemy.id);
        damageEnemy(enemy, projectile.damage);
        explode(projectile, enemy);
        projectile.hitsLeft--;
        if(projectile.hitsLeft <= 0){
          projectile.active = false;
          break;
        }
      }
      if(projectile.active && boss.active && boss.life > 0 && projectileHits(projectile, boss)){
        projectile.hitIds.push('boss');
        damageBoss(projectile.damage);
        explode(projectile, boss);
        projectile.hitsLeft--;
        if(projectile.hitsLeft <= 0) projectile.active = false;
      }
    }
    compactEnemies();
  }

  function collectGems(){
    const xpBalance = balance.xp || SURVIVOR_BALANCE.xp;
    const radius = xpBalance.pickupRadius;
    let write = 0;
    for(let read=0; read<gems.length; read++){
      const gem = gems[read];
      if(distance(player, gem) <= radius){
        xp += gem.value;
        gemPool.push(gem);
      } else {
        gems[write++] = gem;
      }
    }
    gems.length = write;
    const questionCooldown = xpBalance.questionCooldown || 0;
    if(xp < nextXp || levelSent || elapsed - lastLevelQuestionAt < questionCooldown) return;
    xp -= nextXp;
    level++;
    nextXp = xpToNext(level, balance);
    paused = true;
    levelSent = true;
    lastLevelQuestionAt = elapsed;
    onLevelUp(snapshot());
  }

  function applyDamage(){
    if(player.invulnerable > 0) return;
    const bossHit = boss.active && boss.life > 0 && distance(player, boss) <= balance.player.radius + (bossBalance().radius || SURVIVOR_BALANCE.boss.radius);
    const hit = bossHit || enemies.some(enemy => distance(player, enemy) <= balance.player.radius + balance.enemy.radius);
    if(!hit) return;
    player.life = Math.max(0, player.life - (bossHit ? bossBalance().damage : balance.enemy.damage));
    player.invulnerable = balance.player.invulnerableTime;
    if(player.life <= 0 && !deadSent){
      deadSent = true;
      running = false;
      onPlayerDead(snapshot());
    }
  }

  function updateBoss(step){
    if(!boss.active || boss.life <= 0) return;
    const cfg = bossBalance();
    if(boss.frozen > 0){
      boss.frozen = Math.max(0, boss.frozen - step);
    }
    else{
      const dx = player.x - boss.x;
      const dy = player.y - boss.y;
      const len = Math.hypot(dx, dy) || 1;
      boss.x += dx / len * cfg.speed * step;
      boss.y += dy / len * cfg.speed * step;
      boss.x = clamp(boss.x, cfg.radius, balance.worldWidth - cfg.radius);
      boss.y = clamp(boss.y, cfg.radius, balance.worldHeight - cfg.radius);
    }

    if(elapsed >= nextBossWave){
      spawnBossWave();
      nextBossWave += cfg.waveInterval;
    }

    if(boss.shields > 0 && elapsed >= boss.nextQuestionAt && !boss.questionPending && !bossShieldSent){
      boss.questionPending = true;
      bossShieldSent = true;
      paused = true;
      onBossShieldReady(snapshot());
    }
  }

  function update(dt){
    if(!running || paused) return snapshot();
    const step = Math.min(Math.max(dt, 0), 0.05);
    elapsed += step;
    if(!boss.active && elapsed >= matchDuration()) startBoss();
    if(player.invulnerable > 0) player.invulnerable = Math.max(0, player.invulnerable - step);

    const dir = normalize(getInput());
    player.x = clamp(player.x + dir.x * balance.player.speed * step, balance.player.radius, balance.worldWidth - balance.player.radius);
    player.y = clamp(player.y + dir.y * balance.player.speed * step, balance.player.radius, balance.worldHeight - balance.player.radius);

    while(!boss.active && elapsed >= nextWave){
      spawnWave();
      nextWave += balance.waves.interval;
    }

    for(const enemy of enemies){
      if(enemy.blocked > 0){
        enemy.blocked = Math.max(0, enemy.blocked - step);
        continue;
      }
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const len = Math.hypot(dx, dy) || 1;
      enemy.x += dx / len * balance.enemy.speed * step;
      enemy.y += dy / len * balance.enemy.speed * step;
    }

    updateBoss(step);
    if(paused){
      const state = snapshot();
      onFrame(state);
      return state;
    }

    updateWeapons(step);
    updateProjectiles(step);
    collectGems();
    if(paused){
      const state = snapshot();
      onFrame(state);
      return state;
    }
    applyDamage();
    const state = snapshot();
    onFrame(state);
    return state;
  }

  function render(ctx){
    const w = balance.worldWidth;
    const h = balance.worldHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff7fb';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,93,162,0.14)';
    ctx.lineWidth = 1;
    for(let x=0; x<=w; x+=balance.render.gridSize){
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for(let y=0; y<=h; y+=balance.render.gridSize){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    ctx.fillStyle = '#ff7aa8';
    ctx.strokeStyle = '#7f2d54';
    ctx.lineWidth = 3;
    for(const enemy of enemies){
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, balance.render.enemySize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if(boss.active && boss.life > 0){
      const cfg = bossBalance();
      ctx.save();
      ctx.translate(boss.x, boss.y);
      ctx.fillStyle = boss.frozen > 0 ? '#b8f4ff' : '#7f2d54';
      ctx.strokeStyle = boss.shields > 0 ? '#5ad7ff' : '#341528';
      ctx.lineWidth = boss.shields > 0 ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(0, -cfg.radius);
      ctx.lineTo(cfg.radius * 0.9, -cfg.radius * 0.25);
      ctx.lineTo(cfg.radius * 0.55, cfg.radius * 0.95);
      ctx.lineTo(-cfg.radius * 0.55, cfg.radius * 0.95);
      ctx.lineTo(-cfg.radius * 0.9, -cfg.radius * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff7fb';
      ctx.beginPath();
      ctx.arc(-cfg.radius * 0.28, -cfg.radius * 0.12, 5, 0, Math.PI * 2);
      ctx.arc(cfg.radius * 0.28, -cfg.radius * 0.12, 5, 0, Math.PI * 2);
      ctx.fill();
      if(boss.shields > 0){
        ctx.strokeStyle = 'rgba(90,215,255,0.42)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, cfg.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = '#ffd34d';
    ctx.strokeStyle = '#f05d9b';
    ctx.lineWidth = 2;
    for(const gem of gems){
      ctx.beginPath();
      ctx.moveTo(gem.x, gem.y - 7);
      ctx.lineTo(gem.x + 7, gem.y);
      ctx.lineTo(gem.x, gem.y + 7);
      ctx.lineTo(gem.x - 7, gem.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    for(const projectile of projectiles){
      if(!projectile.active) continue;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, balance.weapons?.projectileRadius || SURVIVOR_BALANCE.weapons.projectileRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function setWeaponLevel(id, level){
    if(id !== CHISPA_MITO_ID && id !== activePetWeapon?.id) return 0;
    weaponLevels[id] = protectedWeaponLevel(id, level);
    if(activePetWeapon?.id === id) activePetWeapon = { ...activePetWeapon, level:weaponLevels[id] };
    return weaponLevels[id];
  }

  function levelUpWeapon(id){
    return setWeaponLevel(id, (weaponLevels[id] || 0) + 1);
  }

  function pushEnemiesAway(){
    const safeRadius = balance.player.radius + balance.enemy.radius + 90;
    for(const enemy of enemies){
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const len = Math.hypot(dx, dy) || 1;
      if(len >= safeRadius) continue;
      enemy.x = clamp(player.x + dx / len * safeRadius, -balance.waves.spawnPadding, balance.worldWidth + balance.waves.spawnPadding);
      enemy.y = clamp(player.y + dy / len * safeRadius, -balance.waves.spawnPadding, balance.worldHeight + balance.waves.spawnPadding);
      enemy.blocked = Math.max(enemy.blocked || 0, 0.4);
    }
  }

  function revive(life){
    const amount = Math.max(1, Math.min(balance.player.maxLife, Math.round(Number(life) || 0)));
    player.life = amount;
    player.invulnerable = Math.max(player.invulnerable || 0, balance.player.invulnerableTime * 4, 1.5);
    deadSent = false;
    running = true;
    paused = true;
    pushEnemiesAway();
    return snapshot();
  }

  function breakBossShield(){
    if(!boss.active || boss.shields <= 0) return snapshot();
    const cfg = bossBalance();
    boss.shields = Math.max(0, boss.shields - 1);
    boss.vulnerable = boss.shields <= 0;
    boss.frozen = cfg.freezeTime;
    boss.questionPending = false;
    boss.nextQuestionAt = elapsed + cfg.shieldQuestionInterval;
    bossShieldSent = false;
    return snapshot();
  }

  function pressureBoss(){
    if(!boss.active) return snapshot();
    const cfg = bossBalance();
    boss.pressure++;
    boss.questionPending = false;
    boss.nextQuestionAt = elapsed + cfg.shieldQuestionInterval;
    bossShieldSent = false;
    spawnBossWave();
    return snapshot();
  }

  function loop(now){
    if(!running || paused) return;
    const dt = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    update(dt);
    frameId = raf(loop);
  }

  function start(){
    stop();
    reset();
    running = true;
    frameId = raf(loop);
    return snapshot();
  }

  function pause(){
    if(!running || paused) return snapshot();
    paused = true;
    caf(frameId);
    frameId = 0;
    return snapshot();
  }

  function resume(){
    if(!running || !paused) return snapshot();
    paused = false;
    levelSent = false;
    lastTime = 0;
    frameId = raf(loop);
    return snapshot();
  }

  function stop(){
    if(frameId) caf(frameId);
    reset();
    return snapshot();
  }

  reset();

  return { start, pause, resume, stop, update, render, snapshot, setWeaponLevel, levelUpWeapon, revive, breakBossShield, pressureBoss };
}
