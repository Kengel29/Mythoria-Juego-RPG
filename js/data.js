// DATOS DEL JUEGO: clases, regiones, enemigos y jefes
// DEFINICIÓN DE CLASES Y SUS HABILIDADES
    const CLASSES = {
      warrior: {
        name: 'Guerrero',
        title: 'Defensor de Hierro',
        icon: 'fa-shield-halved',
        color: 'red',
        maxHp: 120,
        maxMp: 40,
        atk: 18,
        def: 12,
        skills: [
          { id: 'basic', name: 'Golpe Firme', cost: 0, type: 'basic', icon: 'fa-hand-fist', desc: 'Ataque básico (0 MP). Evoluciona a combos de 2-3 golpes.', lvl: 1, effect: { type: 'stun', chance: 0.50, turns: 1 } },
          { id: 'aoe', name: 'Torbellino', cost: 15, type: 'aoe', icon: 'fa-arrows-spin', desc: 'Gira dañando en área. (60% Sangrado por 2t).', lvl: 1, effect: { type: 'bleed', chance: 0.60, turns: 2 } },
          { id: 'single', name: 'Estocada Mortal', cost: 20, type: 'single', icon: 'fa-sword', desc: 'Ataque pesado. (80% Fractura/Shock: -30% Atq por 2t).', lvl: 1, effect: { type: 'shock', chance: 0.80, turns: 2 } },
          { id: 'buff', name: 'Grito de Guerra', cost: 15, type: 'buff', icon: 'fa-shield-heart', desc: 'Bendición: Cura HP, +25% Ataque y +8 Defensa por 3t.', lvl: 1 }
        ]
      },
      archer: {
        name: 'Arquero',
        title: 'Cazador Silencioso',
        icon: 'fa-crosshair',
        color: 'emerald',
        maxHp: 95,
        maxMp: 60,
        atk: 22,
        def: 7,
        skills: [
          { id: 'basic', name: 'Disparo Rápido', cost: 0, type: 'basic', icon: 'fa-feather', desc: 'Flecha rápida (0 MP). Evoluciona a ráfagas de 2-3 flechas.', lvl: 1, effect: { type: 'bleed', chance: 0.50, turns: 2, critChance: 0.50 } },
          { id: 'aoe', name: 'Lluvia de Flechas', cost: 20, type: 'aoe', icon: 'fa-cloud-showers-heavy', desc: 'Ataque masivo en área. (50% Aturdir + Veneno 2t).', lvl: 1, effect: { type: 'poison_stun', chance: 0.50, turns: 2 } },
          { id: 'single', name: 'Tiro Certero', cost: 25, type: 'single', icon: 'fa-crosshair', desc: 'Ataque directo. (100% Impacto Crítico x2 Daño).', lvl: 1, effect: { critChance: 1.0 } },
          { id: 'buff', name: 'Ojo de Águila', cost: 15, type: 'buff', icon: 'fa-eye', desc: 'Bendición: Cura HP, +40% Daño, +Evasión y +Crítico por 3t.', lvl: 1 }
        ]
      },
      mage: {
        name: 'Mago',
        title: 'Maestro Arcano',
        icon: 'fa-wand-magic-sparkles',
        color: 'cyan',
        maxHp: 80,
        maxMp: 110,
        atk: 25,
        def: 5,
        skills: [
          { id: 'basic', name: 'Chispa Arcana', cost: 0, type: 'basic', icon: 'fa-bolt', desc: 'Mágico en área (0 MP). Evoluciona absorción de Vida y Maná.', lvl: 1, effect: { type: 'stun', chance: 0.50, turns: 1, drain: true } },
          { id: 'aoe', name: 'Tormenta de Fuego', cost: 30, type: 'aoe', icon: 'fa-fire-flame-curved', desc: 'Fuego masivo. (80% Quemadura por 3t).', lvl: 1, effect: { type: 'burn', chance: 0.80, turns: 3 } },
          { id: 'single', name: 'Explosión Nova', cost: 25, type: 'aoe', icon: 'fa-atom', desc: 'Nova mágica en área. (70% Parálisis + Quemadura 2t).', lvl: 1, effect: { type: 'burn_stun', chance: 0.70, turns: 2 } },
          { id: 'buff', name: 'Escudo & Sanación', cost: 25, type: 'buff', icon: 'fa-hand-holding-hand', desc: 'Bendición: Cura HP, concede Escudo y +25% Ataque por 3t.', lvl: 1 }
        ]
      }
    };

    // BASE DE DATOS DE REGIONES Y ENEMIGOS POR ZONA
    const REGIONS = [
      {
        name: 'Camino Real',
        icon: '🛣️',
        minStage: 1,
        enemies: [
          { name: 'Ladrón Novato', hp: 40, atk: 9, xp: 35, icon: 'fa-user-ninja', color: 'text-amber-400' },
          { name: 'Bandido del Camino', hp: 55, atk: 12, xp: 45, icon: 'fa-mask', color: 'text-orange-400' },
          { name: 'Goblinoide Explorador', hp: 45, atk: 10, xp: 40, icon: 'fa-biohazard', color: 'text-lime-400' }
        ]
      },
      {
        name: 'Bosque Sombrío',
        icon: '🌲',
        minStage: 5,
        enemies: [
          { name: 'Bandido Furtivo', hp: 70, atk: 15, xp: 60, icon: 'fa-user-secret', color: 'text-emerald-400' },
          { name: 'Esqueleto Guerrero', hp: 80, atk: 17, xp: 70, icon: 'fa-skull', color: 'text-slate-300' },
          { name: 'Hombre Lobo Hambriento', hp: 100, atk: 21, xp: 85, icon: 'fa-amber-600' }
        ]
      },
      {
        name: 'Cueva Profunda',
        icon: '🦇',
        minStage: 9,
        enemies: [
          { name: 'Esqueleto Guardián', hp: 110, atk: 22, xp: 95, icon: 'fa-bone', color: 'text-slate-200' },
          { name: 'Araña Venenosa', hp: 95, atk: 24, xp: 90, icon: 'fa-spider', color: 'text-purple-400' },
          { name: 'Troll de Cueva', hp: 150, atk: 28, xp: 120, icon: 'fa-hand-fist', color: 'text-stone-400' }
        ]
      },
      {
        name: 'Mazmorra Olvidada',
        icon: '🏰',
        minStage: 13,
        enemies: [
          { name: 'Esqueleto Místico', hp: 130, atk: 27, xp: 125, icon: 'fa-wand-magic', color: 'text-cyan-400' },
          { name: 'Nigromante Oscuro', hp: 140, atk: 32, xp: 140, icon: 'fa-hat-wizard', color: 'text-indigo-400' },
          { name: 'Espectro de la Mazmorra', hp: 120, atk: 35, xp: 135, icon: 'fa-ghost', color: 'text-teal-300' }
        ]
      },
      {
        name: 'Montaña del Dragón',
        icon: '⛰️',
        minStage: 17,
        enemies: [
          { name: 'Golem de Piedra', hp: 200, atk: 36, xp: 180, icon: 'fa-cubes', color: 'text-yellow-600' },
          { name: 'Quimera Furiosa', hp: 180, atk: 40, xp: 190, icon: 'fa-dragon', color: 'text-red-400' },
          { name: 'Wyvern de Montaña', hp: 220, atk: 45, xp: 220, icon: 'fa-locust', color: 'text-rose-500' }
        ]
      }
    ];

    const BOSS_TYPES = [
      { name: 'Señor del Infierno Ignis', hp: 350, atk: 35, xp: 350, icon: 'fa-dragon', color: 'text-red-500' },
      { name: 'Titan del Abismo Vulkan', hp: 450, atk: 42, xp: 500, icon: 'fa-hand-fist', color: 'text-amber-400' },
      { name: 'Reina de Sombras Malakor', hp: 600, atk: 55, xp: 750, icon: 'fa-crown', color: 'text-purple-500' }
    ];
