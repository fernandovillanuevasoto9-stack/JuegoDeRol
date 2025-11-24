// --- CONFIGURACION INICIAL ---
const game = {
    currentScene: null,
    player: {
        name: 'Aventurero',
        race: null,
        level: 1,
        experience: 0,
        maxExperience: 100,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        gold: 0,
        inventory: [],
        stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        skills: { attack: 1, defense: 1, magic: 1 },
        enemiesDefeated: 0
    },
    currentEnemy: null,
    defending: false,
    quests: [],
    locations: {}
};

const races = {
    humano: { name: 'Humano', description: 'Versatil y adaptable', bonus: { strength: 2, dexterity: 2, constitution: 2, intelligence: 2, wisdom: 2, charisma: 2 } },
    elfo: { name: 'Elfo', description: 'Agil y magico', bonus: { strength: 0, dexterity: 3, constitution: 1, intelligence: 2, wisdom: 2, charisma: 1 } },
    enano: { name: 'Enano', description: 'Fuerte y resistente', bonus: { strength: 3, dexterity: 0, constitution: 2, intelligence: 1, wisdom: 2, charisma: 0 } },
    orco: { name: 'Orco', description: 'Guerrero feroz', bonus: { strength: 4, dexterity: 0, constitution: 2, intelligence: -1, wisdom: 0, charisma: 0 } }
};

const scenes = {
    start: {
        title: 'En el Camino',
        description: 'Un camino misterioso...',
        text: 'Te despiertas en el borde de un antiguo camino. El bosque esta oscuro y silencioso. Que haras?',
        options: [
            { text: 'Explorar el bosque', action: 'explore' },
            { text: 'Seguir el camino', action: 'followRoad' },
            { text: 'Descansar aqui', action: 'rest' }
        ]
    },
    explore: {
        title: 'Bosque Profundo',
        description: 'Peligro entre los arboles',
        text: 'Te adentras en la espesura. Unos ojos brillantes te observan... Un LOBO SALVAJE ataca!',
        combat: true,
        enemy: { name: 'Lobo Salvaje', health: 30, maxHealth: 30, attack: 5, defense: 2, xpReward: 25, goldReward: 15 },
        onVictory: 'victory_wolf'
    },
    followRoad: {
        title: 'La Posada',
        description: 'Un refugio calido',
        text: 'Llegas a una vieja posada. Se escucha musica y risas dentro.',
        options: [
            { text: 'Entrar a la posada', action: 'enterTavern' },
            { text: 'Acampar afuera', action: 'camp' },
            { text: 'Volver al inicio', action: 'start' }
        ]
    },
    rest: {
        title: 'Descanso',
        description: 'Recuperando fuerzas',
        text: 'Duermes bajo las estrellas. Recuperas toda tu salud y mana.',
        onEnter: () => { fullHeal(); },
        options: [
            { text: 'Continuar viaje', action: 'start' }
        ]
    },
    enterTavern: {
        title: 'Interior de la Posada',
        description: 'Olor a cerveza y madera',
        text: 'El tabernero te saluda. "Que te sirvo viajero?"',
        options: [
            { text: 'Comprar cerveza (-10 oro)', action: 'buyDrink' },
            { text: 'Alquilar cuarto (-25 oro)', action: 'rentRoom' },
            { text: 'Salir', action: 'start' }
        ]
    },
    camp: {
        title: 'Campamento Exterior',
        description: 'Noche peligrosa',
        text: 'Intentas dormir fuera para ahorrar dinero... Pero unos BANDIDOS te encuentran!',
        combat: true,
        enemy: { name: 'Bandido', health: 25, maxHealth: 25, attack: 6, defense: 1, xpReward: 30, goldReward: 40 },
        onVictory: 'victory_bandit'
    },
    victory_wolf: {
        title: 'Victoria',
        description: 'Lobo derrotado',
        text: 'El lobo huye. Encuentras una pocion entre los arbustos.',
        onEnter: () => { addItem('Pocion de Salud', 30); },
        options: [{ text: 'Continuar', action: 'start' }]
    },
    victory_bandit: {
        title: 'Victoria',
        description: 'Bandidos ahuyentados',
        text: 'Los bandidos escapan dejando caer su bolsa de oro.',
        onEnter: () => { addGold(100); },
        options: [{ text: 'Registrar y seguir', action: 'start' }]
    },
    buyDrink: {
        title: 'Bebiendo',
        description: 'Glup glup...',
        text: 'La cerveza esta fria. Recuperas 20 de salud.',
        onEnter: () => { 
            if(spendGold(10)) { heal(20); } 
            else { addLog('No tienes dinero!', 'damage'); }
        },
        options: [{ text: 'Otra ronda', action: 'enterTavern' }, { text: 'Salir', action: 'start' }]
    },
    rentRoom: {
        title: 'Habitacion',
        description: 'Cama suave',
        text: 'Duermes como un tronco. Salud y mana restaurados.',
        onEnter: () => {
            if(spendGold(25)) { fullHeal(); }
            else { addLog('No te alcanza!', 'damage'); }
        },
        options: [{ text: 'Despertar', action: 'enterTavern' }]
    }
};

// --- FUNCIONES PRINCIPALES ---

function selectRace(raceKey) {
    const race = races[raceKey];
    const nameInput = document.getElementById('playerNameInput');
    let playerName = nameInput.value.trim();
    
    if (playerName === "") playerName = race.name + ' Aventurero';
    
    game.player.race = raceKey;
    game.player.name = playerName;
    
    for (let stat in race.bonus) {
        game.player.stats[stat] += race.bonus[stat];
    }
    
    game.player.maxHealth = 100 + (game.player.stats.constitution * 5);
    game.player.health = game.player.maxHealth;
    game.player.maxMana = 50 + (game.player.stats.intelligence * 3);
    game.player.mana = game.player.maxMana;
    
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    loadScene('start');
    updateUI();
    addLog(`Bienvenido, ${game.player.name}!`, 'welcome');
}

function loadScene(sceneKey) {
    const scene = scenes[sceneKey];
    if (!scene) return;
    
    game.currentScene = sceneKey;
    
    document.getElementById('locationName').textContent = scene.title;
    document.getElementById('locationDesc').textContent = scene.description;
    document.getElementById('storyContent').innerHTML = `<p>${scene.text}</p>`;
    
    if (scene.onEnter) scene.onEnter();
    
    const combatArea = document.getElementById('combatArea');
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    if (scene.combat && scene.enemy) {
        combatArea.style.display = 'block';
        optionsContainer.style.display = 'none'; // Ocultar opciones en combate
        game.currentEnemy = { ...scene.enemy, health: scene.enemy.maxHealth };
        updateEnemyUI();
    } else {
        combatArea.style.display = 'none';
        optionsContainer.style.display = 'flex'; // Mostrar opciones
        game.currentEnemy = null;
        
        if (scene.options) {
            scene.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline-light m-1';
                btn.textContent = option.text;
                btn.onclick = () => loadScene(option.action);
                optionsContainer.appendChild(btn);
            });
        }
    }
    updateUI();
}

// --- SISTEMA DE COMBATE ---

function playerAttack() {
    if (!game.currentEnemy) return;
    const damage = Math.floor(Math.random() * 10 + game.player.stats.strength);
    game.currentEnemy.health -= damage;
    addLog(`Atacas e infliges ${damage} dano.`, 'damage');
    checkCombatStatus();
}

function castSpell() {
    if (!game.currentEnemy) return;
    if (game.player.mana < 15) {
        addLog('No tienes suficiente mana!', 'damage');
        return;
    }
    game.player.mana -= 15;
    const damage = Math.floor(Math.random() * 15 + game.player.stats.intelligence);
    game.currentEnemy.health -= damage;
    addLog(`Lanzas un hechizo: ${damage} dano magico.`, 'heal');
    checkCombatStatus();
    updateUI();
}

function defend() {
    game.defending = true;
    addLog('Te pones en guardia.', 'heal');
    setTimeout(() => { enemyTurn(); game.defending = false; }, 800);
}

function flee() {
    if (Math.random() > 0.5) {
        addLog('Escapaste!', 'heal');
        loadScene('start');
    } else {
        addLog('No lograste escapar!', 'damage');
        enemyTurn();
    }
}

function checkCombatStatus() {
    updateEnemyUI();
    if (game.currentEnemy.health <= 0) {
        const xp = game.currentEnemy.xpReward;
        const gold = game.currentEnemy.goldReward;
        game.player.experience += xp;
        game.player.gold += gold;
        game.player.enemiesDefeated++;
        addLog(`Enemigo derrotado! +${xp}XP +${gold} oro.`, 'xp');
        checkLevelUp();
        
        const scene = scenes[game.currentScene];
        if (scene.onVictory) {
            setTimeout(() => loadScene(scene.onVictory), 1000);
        } else {
            setTimeout(() => loadScene('start'), 1000);
        }
    } else {
        setTimeout(enemyTurn, 1000);
    }
}

function enemyTurn() {
    if (!game.currentEnemy || game.currentEnemy.health <= 0) return;
    
    let damage = Math.floor(Math.random() * 8 + game.currentEnemy.attack);
    if (game.defending) {
        damage = Math.floor(damage / 2);
        addLog(`Bloqueaste. Solo recibes ${damage} dano.`, 'heal');
    } else {
        addLog(`El enemigo te golpea: ${damage} dano.`, 'damage');
    }
    
    game.player.health -= damage;
    if (game.player.health <= 0) {
        addLog('HAS MUERTO!', 'damage');
        setTimeout(() => location.reload(), 3000);
    }
    updateUI();
}

// --- HELPERS ---

function fullHeal() {
    game.player.health = game.player.maxHealth;
    game.player.mana = game.player.maxMana;
    addLog('Salud y Mana restaurados.', 'heal');
    updateUI();
}

function heal(amount) {
    game.player.health = Math.min(game.player.health + amount, game.player.maxHealth);
    updateUI();
}

function addGold(amount) {
    game.player.gold += amount;
    addLog(`Obtienes ${amount} monedas de oro.`, 'xp');
    updateUI();
}

function spendGold(amount) {
    if(game.player.gold >= amount) {
        game.player.gold -= amount;
        updateUI();
        return true;
    }
    return false;
}

function addItem(itemName, healAmount) {
    game.player.inventory.push({ name: itemName, healing: healAmount });
    addLog(`Recibes: ${itemName}`, 'xp');
    updateUI();
}

function checkLevelUp() {
    if (game.player.experience >= game.player.maxExperience) {
        game.player.experience -= game.player.maxExperience;
        game.player.level++;
        game.player.maxHealth += 20;
        game.player.health = game.player.maxHealth;
        addLog(`NIVEL UP! Ahora eres nivel ${game.player.level}`, 'xp');
    }
}

function addLog(msg, type) {
    const log = document.getElementById('messageLog');
    const p = document.createElement('p');
    p.className = `log-entry ${type} m-1 border-start border-3 ps-2`;
    
    if(type === 'damage') p.classList.add('border-danger', 'text-danger-emphasis');
    else if(type === 'heal') p.classList.add('border-info', 'text-info-emphasis');
    else if(type === 'xp') p.classList.add('border-warning', 'text-warning-emphasis');
    else p.classList.add('border-secondary', 'text-light');

    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function updateUI() {
    document.getElementById('characterName').textContent = game.player.name;
    document.getElementById('characterRace').textContent = races[game.player.race].name;
    
    // Barras
    document.getElementById('healthBar').style.width = `${(game.player.health/game.player.maxHealth)*100}%`;
    document.getElementById('healthText').textContent = `${game.player.health}/${game.player.maxHealth}`;
    document.getElementById('manaBar').style.width = `${(game.player.mana/game.player.maxMana)*100}%`;
    document.getElementById('manaText').textContent = `${game.player.mana}/${game.player.maxMana}`;
    document.getElementById('expBar').style.width = `${(game.player.experience/game.player.maxExperience)*100}%`;

    // Textos
    document.getElementById('levelText').textContent = game.player.level;
    document.getElementById('goldText').textContent = game.player.gold;
    document.getElementById('enemiesDefeatedText').textContent = game.player.enemiesDefeated;

    // Atributos
    document.getElementById('attrStr').textContent = game.player.stats.strength;
    document.getElementById('attrDex').textContent = game.player.stats.dexterity;
    document.getElementById('attrCon').textContent = game.player.stats.constitution;
    document.getElementById('attrInt').textContent = game.player.stats.intelligence;
    document.getElementById('attrWis').textContent = game.player.stats.wisdom;
    document.getElementById('attrCha').textContent = game.player.stats.charisma;

    // Inventario
    const invList = document.getElementById('inventoryList');
    invList.innerHTML = '';
    if (game.player.inventory.length === 0) {
        invList.innerHTML = '<p class="empty-inventory text-muted text-center small">Vacio</p>';
    } else {
        game.player.inventory.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'badge bg-warning text-dark m-1';
            div.style.cursor = 'pointer';
            div.textContent = item.name;
            div.onclick = () => {
                game.player.health = Math.min(game.player.health + item.healing, game.player.maxHealth);
                addLog(`Usaste ${item.name}.`, 'heal');
                game.player.inventory.splice(i, 1);
                updateUI();
            };
            invList.appendChild(div);
        });
    }
}

function updateEnemyUI() {
    if(!game.currentEnemy) return;
    document.getElementById('enemyName').textContent = game.currentEnemy.name;
    document.getElementById('enemyHealthText').textContent = `${Math.max(0, game.currentEnemy.health)}/${game.currentEnemy.maxHealth}`;
    document.getElementById('enemyHealthBar').style.width = `${(Math.max(0, game.currentEnemy.health)/game.currentEnemy.maxHealth)*100}%`;
}

// --- MENUS MODALES (BOOTSTRAP) ---
let menuModalBS, statsModalBS, creditsModalBS;

function openMenu() {
    menuModalBS = new bootstrap.Modal(document.getElementById('menuModal'));
    menuModalBS.show();
}

function closeMenu() {
    if(menuModalBS) menuModalBS.hide();
}

function closeModal(id) {
    const el = document.getElementById(id);
    const modal = bootstrap.Modal.getInstance(el);
    if(modal) modal.hide();
}

function continueGame() { closeMenu(); }

function showCharacterStats() {
    closeMenu();
    const statsContent = document.getElementById('detailedStats');
    statsContent.innerHTML = `
        <h4 class="text-center text-warning">${game.player.name}</h4>
        <p class="text-center text-muted">Nivel ${game.player.level} - ${races[game.player.race].name}</p>
        <hr class="border-secondary">
        <div class="row text-center">
            <div class="col-6 mb-2">Vida: <span class="text-danger">${game.player.health}/${game.player.maxHealth}</span></div>
            <div class="col-6 mb-2">Mana: <span class="text-primary">${game.player.mana}/${game.player.maxMana}</span></div>
            <div class="col-6 mb-2">Oro: <span class="text-warning">${game.player.gold}</span></div>
            <div class="col-6 mb-2">Kills: <span class="text-light">${game.player.enemiesDefeated}</span></div>
        </div>
    `;
    statsModalBS = new bootstrap.Modal(document.getElementById('statsModal'));
    statsModalBS.show();
}

function resetGame() {
    if(confirm('Borrar progreso?')) location.reload();
}

function showCredits() {
    closeMenu();
    creditsModalBS = new bootstrap.Modal(document.getElementById('creditsModal'));
    creditsModalBS.show();
}