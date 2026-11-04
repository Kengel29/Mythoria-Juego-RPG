// GLOBAL GAME STATE
let gameState = {
  player: null,
  selectedClassKey: null,
  enemies: [],
  selectedEnemyIndex: 0,
  stage: 1,
  isPlayerTurn: true,
  inventory: {
    hpPotions: 2,
    mpPotions: 2
  }
};

// RESALTAR SELECCIÓN DE CLASE
    function highlightClass(classKey) {
      gameState.selectedClassKey = classKey;
      document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('border-amber-400', 'ring-4', 'ring-amber-500/30', 'bg-slate-800');
      });

      const selectedCard = document.getElementById(`card-${classKey}`);
      if (selectedCard) {
        selectedCard.classList.add('border-amber-400', 'ring-4', 'ring-amber-500/30', 'bg-slate-800');
      }

      document.getElementById('selection-actions').classList.remove('hidden');
    }

    // REGISTRO DE MENSAJES DE COMBATE
    function logMessage(msg, type = 'normal') {
      const log = document.getElementById('combat-log');
      if (!log) return;
      const p = document.createElement('p');
      const isLight = document.body.classList.contains('light-mode');

      let colors = isLight ? 'text-slate-800 font-medium' : 'text-slate-300';
      if (type === 'player') colors = isLight ? 'text-blue-700 font-bold' : 'text-cyan-300';
      if (type === 'enemy') colors = isLight ? 'text-red-700 font-bold' : 'text-rose-400';
      if (type === 'buff') colors = isLight ? 'text-amber-700 font-bold' : 'text-amber-300';
      if (type === 'system') colors = isLight ? 'text-emerald-800 font-black' : 'text-emerald-400 font-bold';

      p.className = `${colors} leading-snug`;
      p.innerHTML = msg;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
    }

    function toggleTheme() {
      const body = document.body;
      const themeIcon = document.getElementById('theme-icon');
      const themeText = document.getElementById('theme-text');

      if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeIcon.className = 'fa-solid fa-moon text-indigo-600';
        themeText.innerText = 'Modo Oscuro';
      } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeIcon.className = 'fa-solid fa-sun text-amber-400';
        themeText.innerText = 'Modo Claro';
      }
    }

    function selectClass(classKey) {
      const base = CLASSES[classKey];
      gameState.player = {
        key: classKey,
        ...JSON.parse(JSON.stringify(base)),
        hp: base.maxHp,
        mp: base.maxMp,
        shield: 0,
        buffs: { atkBonus: 0, defBonus: 0, turns: 0 },
        status: [],
        stunImmune: false,
        level: 1,
        xp: 0,
        maxXp: 100
      };

      gameState.stage = 1;
      gameState.isPlayerTurn = true;
      gameState.inventory = { hpPotions: 2, mpPotions: 2 };

      document.getElementById('selection-screen').classList.add('hidden');
      document.getElementById('exit-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden');
      document.getElementById('top-controls').classList.remove('hidden');

      renderPlayerInfo();
      spawnEnemies();
      renderSkills();

      document.getElementById('combat-log').innerHTML = '';
      logMessage(`¡Has encarnado al <strong>${base.name}</strong>! Tu aventura en Mythoria comienza.`, 'system');
    }

    function startAdventure() {
      if (!gameState.selectedClassKey) return;
      selectClass(gameState.selectedClassKey);
    }

    function restartSameClass() {
      document.getElementById('game-modal').classList.add('hidden');
      if (gameState.selectedClassKey) {
        selectClass(gameState.selectedClassKey);
      } else {
        resetGameToSelection();
      }
    }

    function exitGameScreen() {
      document.getElementById('upgrade-modal')?.classList.add('hidden');
      document.getElementById('selection-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.add('hidden');
      document.getElementById('game-modal').classList.add('hidden');
      document.getElementById('top-controls').classList.add('hidden');
      document.getElementById('exit-screen').classList.remove('hidden');
    }

    function resetToMainMenu() {
      document.getElementById('exit-screen').classList.add('hidden');
      resetGameToSelection();
    }

    function getCurrentRegion(stage) {
      for (let i = REGIONS.length - 1; i >= 0; i--) {
        if (stage >= REGIONS[i].minStage) return REGIONS[i];
      }
      return REGIONS[0];
    }

    function spawnEnemies() {
      const isBossWave = gameState.stage % 10 === 0;
      const currentRegion = getCurrentRegion(gameState.stage);

      document.getElementById('region-badge').innerText = `${currentRegion.icon} ${currentRegion.name}`;
      document.getElementById('stage-badge').innerText = isBossWave ? `¡JEFE! Oleada ${gameState.stage}` : `Oleada ${gameState.stage}`;
      document.getElementById('stage-badge').className = isBossWave 
        ? "px-3 py-1 bg-red-600/30 border border-red-500 text-red-300 font-bold rounded-full text-xs animate-pulse"
        : "px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold";

      gameState.enemies = [];

      if (isBossWave) {
        const bossTemplate = BOSS_TYPES[Math.min(Math.floor((gameState.stage / 10) - 1), BOSS_TYPES.length - 1)];
        const scale = 1 + (gameState.stage - 10) * 0.15;

        gameState.enemies.push({
          id: 0,
          name: bossTemplate.name,
          maxHp: Math.round(bossTemplate.hp * scale),
          hp: Math.round(bossTemplate.hp * scale),
          atk: Math.round(bossTemplate.atk * scale),
          xp: Math.round(bossTemplate.xp * scale),
          icon: bossTemplate.icon,
          key: bossTemplate.name,
          fx: makeFx(bossTemplate.name),
          color: bossTemplate.color,
          isBoss: true
        });
      } else {
        const enemyCount = gameState.stage === 1 ? 1 : (gameState.stage % 2 === 0 ? 2 : 3);
        const regionEnemies = currentRegion.enemies;

        for (let i = 0; i < enemyCount; i++) {
          const template = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
          const scale = 1 + (gameState.stage - 1) * 0.18;

          gameState.enemies.push({
            id: i,
            name: `${template.name} ${i + 1}`,
            maxHp: Math.round(template.hp * scale),
            hp: Math.round(template.hp * scale),
            atk: Math.round(template.atk * scale),
            xp: Math.round(template.xp * scale),
            icon: template.icon,
            key: template.name,
            fx: makeFx(template.name),
            color: template.color,
            isBoss: false
          });
        }
      }

      gameState.selectedEnemyIndex = 0;
      renderEnemies();
    }

    function usePotion(type) {
      if (!gameState.isPlayerTurn) return;
      const p = gameState.player;

      if (type === 'hp') {
        if (gameState.inventory.hpPotions <= 0) {
          logMessage(`❌ No tienes Pociones de Vida disponibles.`, 'system');
          return;
        }
        gameState.inventory.hpPotions--;
        const heal = Math.round(p.maxHp * 0.40);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        logMessage(`🧪 Usaste una Poción de Vida recuperando <strong class="text-emerald-400">+${heal} HP</strong>.`, 'buff');
      } else if (type === 'mp') {
        if (gameState.inventory.mpPotions <= 0) {
          logMessage(`❌ No tienes Pociones de Maná disponibles.`, 'system');
          return;
        }
        gameState.inventory.mpPotions--;
        const mana = Math.round(p.maxMp * 0.50);
        p.mp = Math.min(p.maxMp, p.mp + mana);
        logMessage(`🧪 Usaste una Poción de Maná recuperando <strong class="text-cyan-400">+${mana} MP</strong>.`, 'buff');
      }

      renderPlayerInfo();
      renderSkills();
    }

    function renderPlayerInfo() {
      const p = gameState.player;
      if (!p) return;
      document.getElementById('player-name').innerText = p.name;
      document.getElementById('player-class-title').innerText = p.title;
      document.getElementById('player-level').innerText = `Nvl ${p.level}`;

      const avatar = document.getElementById('player-avatar');
      avatar.innerHTML = ART[p.key] || `<i class="fa-solid ${p.icon}"></i>`;
      avatar.className = `w-16 h-16 shrink-0 overflow-hidden rounded-full flex items-center justify-center text-2xl border-2 border-${p.color}-500/50 bg-${p.color}-950/40 text-${p.color}-400`;

      document.getElementById('player-hp-text').innerText = `${p.hp}/${p.maxHp} ${p.shield > 0 ? `(+${p.shield})` : ''}`;
      const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
      document.getElementById('player-hp-bar').style.width = `${hpPct}%`;

      document.getElementById('player-mp-text').innerText = `${p.mp}/${p.maxMp}`;
      const mpPct = Math.max(0, Math.min(100, (p.mp / p.maxMp) * 100));
      document.getElementById('player-mp-bar').style.width = `${mpPct}%`;

      document.getElementById('player-xp-text').innerText = `${p.xp}/${p.maxXp}`;
      const xpPct = Math.max(0, Math.min(100, (p.xp / p.maxXp) * 100));
      document.getElementById('player-xp-bar').style.width = `${xpPct}%`;

      // Inventario
      document.getElementById('potion-hp-count').innerText = gameState.inventory.hpPotions;
      document.getElementById('potion-mp-count').innerText = gameState.inventory.mpPotions;

      const buffsContainer = document.getElementById('player-buffs');
      buffsContainer.innerHTML = '';
      if (p.shield > 0) {
        buffsContainer.innerHTML += `<span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[10px] flex items-center gap-1"><i class="fa-solid fa-shield"></i> Escudo: ${p.shield}</span>`;
      }
      if (p.buffs.turns > 0) {
        buffsContainer.innerHTML += `<span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] flex items-center gap-1"><i class="fa-solid fa-bolt"></i> Bendición (${p.buffs.turns} turnos)</span>`;
      }
      renderPlayerStatus(buffsContainer);
    }

    function renderEnemies() {
      const container = document.getElementById('enemies-container');
      if (!container) return;
      container.innerHTML = '';

      gameState.enemies.forEach((enemy, idx) => {
        const isDead = enemy.hp <= 0;
        const isSelected = gameState.selectedEnemyIndex === idx && !isDead;
        const hpPct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

        const card = document.createElement('div');
        card.className = `enemy-item-card p-2.5 rounded-lg border transition-all cursor-pointer ${
          isDead ? 'opacity-40 bg-slate-950 border-slate-900' :
          enemy.isBoss ? (isSelected ? 'selected-enemy bg-red-950/60 border-red-500 ring-2 ring-red-500/50' : 'bg-red-950/30 border-red-800/80 hover:border-red-600') :
          isSelected ? 'selected-enemy bg-slate-800 border-amber-500 ring-2 ring-amber-500/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`;

        card.onclick = () => {
          if (!isDead) {
            gameState.selectedEnemyIndex = idx;
            renderEnemies();
          }
        };

        let statusBadges = '';
        if (enemy.statusEffects && enemy.statusEffects.length > 0) {
          enemy.statusEffects.forEach(st => {
            if (st.type === 'burn') statusBadges += `<span class="text-[10px] px-1 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded">🔥 ${st.turns}t</span> `;
            if (st.type === 'bleed') statusBadges += `<span class="text-[10px] px-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded">🩸 ${st.turns}t</span> `;
            if (st.type === 'poison') statusBadges += `<span class="text-[10px] px-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">🧪 ${st.turns}t</span> `;
            if (st.type === 'stun') statusBadges += `<span class="text-[10px] px-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded">⚡ ${st.turns}t</span> `;
            if (st.type === 'shock') statusBadges += `<span class="text-[10px] px-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">💢 ${st.turns}t</span> `;
          });
        }

        card.innerHTML = `
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <span class="${enemy.isBoss ? 'w-14 h-14' : 'w-11 h-11'} shrink-0 rounded-md overflow-hidden bg-slate-950/50 border border-slate-700 flex items-center justify-center text-xl ${isDead ? 'grayscale opacity-50' : ''}">${artHTML(enemy.key, enemy.icon, enemy.color)}</span>
              <span class="enemy-name-text text-xs font-black ${isDead ? 'line-through text-slate-400' : enemy.isBoss ? 'text-red-600 font-cinzel text-sm' : 'text-slate-100'}">${enemy.name}</span>
              ${enemy.fx ? `<span class="text-[11px]" title="Puede infligir ${FX_INFO[enemy.fx.type].label}">${FX_INFO[enemy.fx.type].icon}</span>` : ''}
            </div>
            <span class="enemy-hp-text text-[10px] font-bold text-slate-300">${enemy.hp}/${enemy.maxHp} HP</span>
          </div>
          <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mb-1">
            <div class="${enemy.isBoss ? 'bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400' : 'bg-rose-500'} h-full transition-all duration-300" style="width: ${hpPct}%"></div>
          </div>
          <div class="flex items-center gap-1 min-h-[18px]">${statusBadges}</div>
        `;

        container.appendChild(card);
      });
    }

    function renderSkills() {
      const grid = document.getElementById('skills-grid');
      grid.innerHTML = '';

      if (!gameState.player || !gameState.player.skills) return;

      gameState.player.skills.forEach((skill) => {
        const canAfford = gameState.player.mp >= skill.cost;
        const disabled = !gameState.isPlayerTurn || !canAfford;

        const btn = document.createElement('button');
        btn.disabled = disabled;
        btn.onclick = () => handlePlayerAttack(skill);

        btn.className = `skill-btn-card group relative p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
          disabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'shadow-sm'
        }`;

        btn.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="skill-title text-xs flex items-center gap-1.5">
                <i class="fa-solid ${skill.icon} text-amber-500"></i> ${skill.name}
              </span>
              <span class="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-500/20 text-amber-600 border border-amber-500/40 rounded">Nvl ${skill.lvl}</span>
            </div>
            <p class="skill-desc text-[11px] line-clamp-2 leading-tight">${skill.desc}</p>
          </div>
          <div class="flex justify-between items-center mt-2 pt-1 border-t border-slate-300/40 text-[10px] font-bold">
            <span class="${skill.cost > 0 ? 'text-cyan-600 font-extrabold' : 'text-emerald-600 font-extrabold'}">
              <i class="fa-solid fa-droplet"></i> ${skill.cost} MP
            </span>
            <span class="text-slate-500 capitalize">${skill.type === 'aoe' ? 'Área' : skill.type === 'single' ? 'Un Objetivo' : skill.type === 'basic' ? 'Básico' : 'Bendición'}</span>
          </div>
        `;

        grid.appendChild(btn);
      });
    }

    function confirmReset() {
      if (confirm('¿Deseas volver al menú principal? Se perderá el progreso actual de esta partida.')) {
        resetGameToSelection();
      }
    }

    function resetGameToSelection() {
      document.getElementById('upgrade-modal')?.classList.add('hidden');
      document.getElementById('game-modal')?.classList.add('hidden');
      document.getElementById('game-screen')?.classList.add('hidden');
      document.getElementById('top-controls')?.classList.add('hidden');
      document.getElementById('exit-screen')?.classList.add('hidden');
      document.getElementById('selection-screen')?.classList.remove('hidden');
      document.getElementById('selection-actions')?.classList.add('hidden');

      document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('border-amber-400', 'ring-4', 'ring-amber-500/30', 'bg-slate-800');
      });
      gameState.selectedClassKey = null;
      gameState.isPlayerTurn = true;
    }

    function handlePlayerAttack(skill) {
      if (!gameState.isPlayerTurn) return;

      const p = gameState.player;
      if (p.mp < skill.cost) return;

      p.mp -= skill.cost;

      let atkPower = p.atk + p.buffs.atkBonus + (skill.lvl - 1) * 6;
      if ((p.status || []).some(s => s.type === 'weak')) atkPower = Math.round(atkPower * 0.75);
      let targets = [];

      if (skill.type === 'aoe' || p.key === 'mage') {
        targets = gameState.enemies.filter(e => e.hp > 0);
      } else if (skill.type === 'single' || skill.type === 'basic') {
        let target = gameState.enemies[gameState.selectedEnemyIndex];
        if (!target || target.hp <= 0) {
          target = gameState.enemies.find(e => e.hp > 0);
        }
        if (target) targets = [target];
      }

      if (skill.type === 'buff') {
        if (p.key === 'warrior') {
          const heal = 20 + (skill.lvl * 6);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          p.buffs = { atkBonus: Math.round(p.atk * 0.25), defBonus: 8 + (skill.lvl * 2), turns: 3 + Math.floor(skill.lvl / 2) };
          logMessage(`✨ <strong>${p.name}</strong> usa ${skill.name}: Se cura <strong>+${heal} HP</strong>, aumenta +25% Ataque y +${p.buffs.defBonus} Defensa por ${p.buffs.turns} turnos.`, 'buff');
        } else if (p.key === 'archer') {
          const heal = 25 + (skill.lvl * 6);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          p.buffs = { atkBonus: Math.round(p.atk * 0.40), defBonus: 3, turns: 3 + Math.floor(skill.lvl / 2) };
          logMessage(`👁️ <strong>${p.name}</strong> usa ${skill.name}: Se cura <strong>+${heal} HP</strong>, aumenta +40% Daño, Evasión y Críticos por ${p.buffs.turns} turnos.`, 'buff');
        } else if (p.key === 'mage') {
          const heal = 25 + (skill.lvl * 8);
          const shieldVal = 20 + (skill.lvl * 5);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          p.shield += shieldVal;
          p.buffs = { atkBonus: Math.round(p.atk * 0.25), defBonus: 0, turns: 3 + Math.floor(skill.lvl / 2) };
          logMessage(`🔮 <strong>${p.name}</strong> usa ${skill.name}: Se cura <strong>+${heal} HP</strong>, gana <strong>+${shieldVal} Escudo</strong> y +25% Ataque por ${p.buffs.turns} turnos.`, 'buff');
        }
      } 
      else {
        let hitsCount = 1;
        if (skill.type === 'basic' && (p.key === 'archer' || p.key === 'warrior')) {
          hitsCount = Math.min(3, 1 + Math.floor(skill.lvl / 2));
        }

        targets.forEach(enemy => {
          let totalDamage = 0;

          for (let h = 1; h <= hitsCount; h++) {
            let multiplier = skill.type === 'single' ? 1.4 : 1.0;
            let isCrit = false;

            if (skill.effect && typeof skill.effect.critChance === 'number' && Math.random() < skill.effect.critChance) {
              multiplier *= 2.0;
              isCrit = true;
            }

            let damage = Math.max(5, Math.round(atkPower * multiplier));
            enemy.hp = Math.max(0, enemy.hp - damage);
            totalDamage += damage;

            logMessage(`⚔️ Golpe ${h}/${hitsCount}: <strong>${p.name}</strong> ataca infligiendo <strong class="text-amber-400">${damage} de daño${isCrit ? ' (¡CRÍTICO!)' : ''}</strong> a ${enemy.name}.`, 'player');
          }

          if (p.key === 'mage' && skill.type === 'basic') {
            const drainHp = Math.round(totalDamage * (0.15 + skill.lvl * 0.05));
            const drainMp = Math.round(totalDamage * (0.10 + skill.lvl * 0.05));
            p.hp = Math.min(p.maxHp, p.hp + drainHp);
            p.mp = Math.min(p.maxMp, p.mp + drainMp);
            logMessage(`🔮 Absorción Arcana: <strong>${p.name}</strong> drena <strong class="text-emerald-400">+${drainHp} HP</strong> y <strong class="text-cyan-400">+${drainMp} MP</strong>.`, 'buff');
          }

          if (skill.effect && enemy.hp > 0) {
            const eff = skill.effect;
            if (eff.type === 'burn_stun') {
              if (typeof eff.chance === 'number' && Math.random() < eff.chance) {
                applyStatus(enemy, 'burn', eff.turns);
                applyStatus(enemy, 'stun', eff.turns);
                logMessage(`🔥⚡ ¡${enemy.name} ha sido Quemado y Paralizado!`, 'buff');
              }
            } else if (eff.type === 'poison_stun') {
              if (typeof eff.chance === 'number' && Math.random() < eff.chance) {
                applyStatus(enemy, 'poison', eff.turns);
                applyStatus(enemy, 'stun', eff.turns);
                logMessage(`🧪⚡ ¡${enemy.name} ha sido Envenenado y Aturdido!`, 'buff');
              } else {
                // Siempre aplica veneno secundario
                applyStatus(enemy, 'poison', eff.turns);
                logMessage(`🧪 ¡${enemy.name} ha sido Envenenado!`, 'buff');
              }
            } else if (eff.type && typeof eff.chance === 'number' && Math.random() < eff.chance) {
              applyStatus(enemy, eff.type, eff.turns);
              let effDesc = eff.type === 'burn' ? '🔥 Quemadura' : eff.type === 'bleed' ? '🩸 Sangrado' : eff.type === 'poison' ? '🧪 Veneno' : eff.type === 'stun' ? '⚡ Parálisis' : '💢 Shock';
              logMessage(`✨ ¡${enemy.name} sufre de <strong>${effDesc}</strong>!`, 'buff');
            }
          }
        });
      }

      if (gameState.enemies[gameState.selectedEnemyIndex] && gameState.enemies[gameState.selectedEnemyIndex].hp <= 0) {
        const aliveIdx = gameState.enemies.findIndex(e => e.hp > 0);
        if (aliveIdx !== -1) gameState.selectedEnemyIndex = aliveIdx;
      }

      renderPlayerInfo();
      renderEnemies();

      const allEnemiesDead = gameState.enemies.every(e => e.hp <= 0);
      if (allEnemiesDead) {
        setTimeout(handleWaveVictory, 800);
      } else {
        gameState.isPlayerTurn = false;
        renderSkills();
        setTimeout(handleEnemyTurn, 1000);
      }
    }

    // ESTADOS ALTERADOS SOBRE EL JUGADOR
    function renderPlayerStatus(container) {
      (gameState.player.status || []).forEach(st => {
        const i = FX_INFO[st.type];
        container.innerHTML += `<span class="px-2 py-0.5 border rounded text-[10px] flex items-center gap-1 ${i.cls}">${i.icon} ${i.label} (${st.turns}t)</span>`;
      });
    }

    function tryInflictStatus(enemy) {
      const fx = enemy.fx, p = gameState.player;
      if (!fx || p.hp <= 0 || Math.random() >= fx.chance) return;
      if (fx.type === 'stun' && p.stunImmune) return;
      const turns = fx.type === 'stun' ? 1 : 2;
      p.status = p.status || [];
      const ex = p.status.find(s => s.type === fx.type);
      if (ex) ex.turns = Math.max(ex.turns, turns); else p.status.push({ type: fx.type, turns });
      const i = FX_INFO[fx.type];
      logMessage(`${i.icon} ¡<strong>${enemy.name}</strong> te ha infligido <strong>${i.label}</strong>!`, 'enemy');
    }

    // Aplica el daño por turno y reduce duraciones. Devuelve true si el jugador está aturdido.
    function tickPlayerStatus() {
      const p = gameState.player;
      let stunned = false;
      p.status = p.status || [];
      p.status.forEach(st => {
        const pct = { poison: 0.06, bleed: 0.05, burn: 0.07 }[st.type];
        if (pct) {
          const dmg = Math.max(4, Math.round(p.maxHp * pct));
          p.hp = Math.max(0, p.hp - dmg);
          const i = FX_INFO[st.type];
          logMessage(`${i.icon} Sufres <strong class="text-rose-400">${dmg} de daño por ${i.label}</strong>.`, 'enemy');
        }
        if (st.type === 'stun') {
          stunned = true;
          logMessage('⚡ ¡Estás aturdido y pierdes tu turno!', 'enemy');
        }
        st.turns--;
      });
      p.status = p.status.filter(s => s.turns > 0);
      p.stunImmune = stunned; // evita aturdimientos consecutivos
      return stunned;
    }

    function applyStatus(enemy, type, turns) {
      if (!enemy.statusEffects) enemy.statusEffects = [];
      const existing = enemy.statusEffects.find(s => s.type === type);
      if (existing) {
        existing.turns = Math.max(existing.turns, turns);
      } else {
        enemy.statusEffects.push({ type, turns });
      }
    }

    function handleEnemyTurn() {
      document.getElementById('turn-indicator').innerText = 'Turno Enemigo';
      document.getElementById('turn-indicator').className = 'text-xs font-semibold px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full';

      const aliveEnemies = gameState.enemies.filter(e => e.hp > 0);

      aliveEnemies.forEach((enemy, index) => {
        setTimeout(() => {
          if (gameState.player.hp <= 0 || enemy.hp <= 0) return;

          if (enemy.statusEffects && enemy.statusEffects.length > 0) {
            enemy.statusEffects.forEach(st => {
              if (st.type === 'burn') {
                const burnDmg = 12;
                enemy.hp = Math.max(0, enemy.hp - burnDmg);
                logMessage(`🔥 ${enemy.name} sufre <strong class="text-orange-400">${burnDmg} daño de Quemadura</strong>.`, 'buff');
              }
              if (st.type === 'bleed') {
                const bleedDmg = 10;
                enemy.hp = Math.max(0, enemy.hp - bleedDmg);
                logMessage(`🩸 ${enemy.name} pierde <strong class="text-rose-400">${bleedDmg} HP por Sangrado</strong>.`, 'buff');
              }
              if (st.type === 'poison') {
                const poisonDmg = 14;
                enemy.hp = Math.max(0, enemy.hp - poisonDmg);
                logMessage(`🧪 ${enemy.name} pierde <strong class="text-emerald-400">${poisonDmg} HP por Veneno</strong>.`, 'buff');
              }
            });
          }

          renderEnemies();

          if (enemy.hp <= 0) {
            logMessage(`☠️ ${enemy.name} sucumbió a sus estados alterados.`, 'system');
            return;
          }

          const stunEffect = enemy.statusEffects ? enemy.statusEffects.find(s => s.type === 'stun') : null;
          if (stunEffect && stunEffect.turns > 0) {
            logMessage(`⚡ <strong>${enemy.name}</strong> está Paralizado/Aturdido y pierde su turno.`, 'buff');
            return;
          }

          let enemyAtk = enemy.atk;
          const shockEffect = enemy.statusEffects ? enemy.statusEffects.find(s => s.type === 'shock') : null;
          if (shockEffect) enemyAtk = Math.round(enemyAtk * 0.70);

          let rawDmg = Math.max(3, enemyAtk - (gameState.player.def + gameState.player.buffs.defBonus));

          if (gameState.player.shield > 0) {
            if (gameState.player.shield >= rawDmg) {
              gameState.player.shield -= rawDmg;
              logMessage(`🛡️ El escudo absorbió los <strong>${rawDmg} de daño</strong> de ${enemy.name}.`, 'buff');
              rawDmg = 0;
            } else {
              rawDmg -= gameState.player.shield;
              logMessage(`🛡️ El escudo absorbió parte del impacto de ${enemy.name}.`, 'buff');
              gameState.player.shield = 0;
            }
          }

          if (rawDmg > 0) {
            gameState.player.hp = Math.max(0, gameState.player.hp - rawDmg);

            const card = document.getElementById('player-card');
            card.classList.add('animate-hit');
            setTimeout(() => card.classList.remove('animate-hit'), 400);

            logMessage(`💥 <strong>${enemy.name}</strong> te ataca por <strong class="text-rose-400">${rawDmg} de daño</strong>.`, 'enemy');
            tryInflictStatus(enemy);
          }

          renderPlayerInfo();

          if (gameState.player.hp <= 0) {
            handleGameOver(false);
          }
        }, index * 800);
      });

      setTimeout(() => {
        gameState.enemies.forEach(e => {
          if (e.statusEffects) {
            e.statusEffects.forEach(s => s.turns--);
            e.statusEffects = e.statusEffects.filter(s => s.turns > 0);
          }
        });

        if (gameState.player.hp > 0) {
          const stunned = tickPlayerStatus();
          if (gameState.player.hp <= 0) { renderPlayerInfo(); handleGameOver(false); return; }
          if (stunned) { renderPlayerInfo(); setTimeout(handleEnemyTurn, 900); return; }
          if (gameState.player.buffs.turns > 0) {
            gameState.player.buffs.turns--;
            if (gameState.player.buffs.turns === 0) {
              gameState.player.buffs.atkBonus = 0;
              gameState.player.buffs.defBonus = 0;
              logMessage(`⏳ La bendición de tu personaje se ha agotado.`, 'system');
            }
          }

          gameState.player.mp = Math.min(gameState.player.maxMp, gameState.player.mp + 8);

          gameState.isPlayerTurn = true;
          document.getElementById('turn-indicator').innerText = 'Tu Turno';
          document.getElementById('turn-indicator').className = 'text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full';

          renderPlayerInfo();
          renderEnemies();
          renderSkills();
        }
      }, aliveEnemies.length * 800 + 200);
    }

    function handleWaveVictory() {
      const xpGained = gameState.enemies.reduce((acc, e) => acc + e.xp, 0);
      logMessage(`🎉 ¡Oleada superada! Obtienes <strong class="text-amber-400">+${xpGained} XP</strong>.`, 'system');

      const dropChance = Math.random();
      if (dropChance < 0.50) {
        gameState.inventory.hpPotions++;
        logMessage(`🎒 ¡Obtuviste una <strong>Poción de Vida</strong>!`, 'buff');
      } else {
        gameState.inventory.mpPotions++;
        logMessage(`🎒 ¡Obtuviste una <strong>Poción de Maná</strong>!`, 'buff');
      }

      const p = gameState.player;
      p.xp += xpGained;

      if (p.xp >= p.maxXp) {
        p.xp -= p.maxXp;
        p.level++;
        p.maxXp = Math.round(p.maxXp * 1.4);

        p.maxHp += 20;
        p.maxMp += 15;
        p.hp = p.maxHp;
        p.mp = p.maxMp;
        p.atk += 4;
        p.def += 2;

        logMessage(`🌟 ¡SUBISTE AL NIVEL ${p.level}! HP y MP restaurados al máximo.`, 'system');

        const playerCard = document.getElementById('player-card');
        playerCard?.classList.add('animate-level-up');
        setTimeout(() => playerCard?.classList.remove('animate-level-up'), 1500);

        showUpgradeModal();
      } else {
        setTimeout(advanceStage, 1200);
      }
    }

    function advanceStage() {
      gameState.stage++;
      gameState.player.status = [];
      gameState.player.stunImmune = false;
      gameState.isPlayerTurn = true;
      document.getElementById('turn-indicator').innerText = 'Tu Turno';
      document.getElementById('turn-indicator').className = 'text-xs font-semibold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full';

      renderPlayerInfo();
      spawnEnemies();
      renderSkills();
    }

    function showUpgradeModal() {
      const modal = document.getElementById('upgrade-modal');
      const container = document.getElementById('upgrade-options');
      if (!modal || !container) {
        advanceStage();
        return;
      }
      container.innerHTML = '';

      if (gameState.player && gameState.player.skills) {
        gameState.player.skills.forEach((skill, index) => {
          const option = document.createElement('div');
          option.onclick = () => upgradeSkill(index);
          option.className = "bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400/80 rounded-xl p-3.5 cursor-pointer transition flex items-center justify-between group";

          option.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <i class="fa-solid ${skill.icon} text-lg"></i>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-100">${skill.name}</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">Nvl ${skill.lvl} → Nvl ${skill.lvl + 1}</span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">+Efectividad mejorada y potenciada en combate.</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-500 group-hover:text-amber-400 transition-colors"></i>
          `;

          container.appendChild(option);
        });
      }

      modal.classList.remove('hidden');
    }

    function upgradeSkill(index) {
      const skill = gameState.player.skills[index];
      skill.lvl++;

      // Aumentar la probabilidad y efectividad del efecto según el tipo
      if (skill.effect) {
        if (typeof skill.effect.chance === 'number') {
          skill.effect.chance = Math.min(1.0, skill.effect.chance + 0.10);
        }
        if (typeof skill.effect.turns === 'number' && skill.lvl % 2 === 0) {
          skill.effect.turns += 1;
        }
      }

      // Actualizar descripciones para reflejar el aumento de poder
      if (skill.id === 'basic') {
        skill.desc = `Ataque básico (Nvl ${skill.lvl}). Daño y probabilidad de efecto aumentados (${Math.round((skill.effect?.chance || 0.5) * 100)}%).`;
      } else if (skill.id === 'aoe') {
        skill.desc = `Ataque en área (Nvl ${skill.lvl}). Mayor área y probabilidad de estado (${Math.round((skill.effect?.chance || 0.6) * 100)}%).`;
      } else if (skill.id === 'single') {
        skill.desc = `Ataque pesado (Nvl ${skill.lvl}). Daño devastador y efecto potenciado (${Math.round((skill.effect?.chance || 0.8) * 100)}%).`;
      } else if (skill.id === 'buff') {
        skill.desc = `Bendición potenciada (Nvl ${skill.lvl}). Otorga bonificaciones superiores por más tiempo.`;
      }

      logMessage(`⚡ ¡Habilidad <strong>${skill.name}</strong> ha evolucionado a Nvl ${skill.lvl}! Su daño y probabilidades han aumentado.`, 'buff');

      document.getElementById('upgrade-modal').classList.add('hidden');
      advanceStage();
    }

    function handleGameOver(victory) {
      const modal = document.getElementById('game-modal');
      const icon = document.getElementById('modal-icon');
      const title = document.getElementById('modal-title');
      const msg = document.getElementById('modal-message');

      if (victory) {
        icon.className = 'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40';
        icon.innerHTML = '<i class="fa-solid fa-crown"></i>';
        title.innerText = '¡Victoria Legendaria!';
        title.className = 'font-cinzel text-2xl font-bold mb-2 text-amber-400';
        msg.innerText = `Has conquistado las tierras de Mythoria alcanzando la Oleada ${gameState.stage}.`;
      } else {
        icon.className = 'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl bg-rose-500/20 text-rose-400 border border-rose-500/40';
        icon.innerHTML = '<i class="fa-solid fa-skull"></i>';
        title.innerText = 'Has Caído en Combate';
        title.className = 'font-cinzel text-2xl font-bold mb-2 text-rose-400';
        msg.innerText = `Tu aventura ha llegado a su fin en la Oleada ${gameState.stage}. Tu legado será recordado.`;
      }

      modal.classList.remove('hidden');
    }
