// Variables globales del juego
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
        stats: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        },
        skills: {
            attack: 1,
            defense: 1,
            magic: 1
        },
        enemiesDefeated: 0
    },
    currentEnemy: null,
    defending: false,
    quests: [],
    locations: {}
};

// Razas disponibles
const races = {
    humano: {
        name: 'Humano',
        description: 'Versátil y adaptable',
        bonus: { strength: 2, dexterity: 2, constitution: 2, intelligence: 2, wisdom: 2, charisma: 2 }
    },
    elfo: {
        name: 'Elfo',
        description: 'Ágil y mágico',
        bonus: { strength: 0, dexterity: 3, constitution: 1, intelligence: 2, wisdom: 2, charisma: 1 }
    },
    enano: {
        name: 'Enano',
        description: 'Fuerte y resistente',
        bonus: { strength: 3, dexterity: 0, constitution: 2, intelligence: 1, wisdom: 2, charisma: 0 }
    },
    orco: {
        name: 'Orco',
        description: 'Guerrero feroz',
        bonus: { strength: 4, dexterity: 0, constitution: 2, intelligence: -1, wisdom: 0, charisma: 0 }
    }
};

// Escenas disponibles
const scenes = {
    start: {
        title: 'En el Camino',
        description: 'Un camino misterioso se abre ante ti...',
        text: 'Te despiertas en el borde de un antiguo camino. A tu alrededor, solo bosque oscuro. El viento trae consigo el sonido de algo lejano... ¿peligro o oportunidad?',
        options: [
            { text: 'Explorar el bosque', action: 'explore' },
            { text: 'Seguir el camino', action: 'followRoad' },
            { text: 'Descansar aquí', action: 'rest' }
        ]
    },
    
    explore: {
        title: 'En el Bosque Profundo',
        description: 'Rodeado de árboles y sombras',
        text: 'Te adentras en el bosque. Los árboles son antiguos y retorcidos. De repente, ves ojos brillantes en la penumbra... Un lobo furioso salta hacia ti!',
        combat: true,
        enemy: {
            name: 'Lobo Salvaje',
            health: 30,
            maxHealth: 30,
            attack: 5,
            defense: 2,
            xpReward: 25,
            goldReward: 15
        },
        onVictory: 'victory_wolf'
    },
    
    followRoad: {
        title: 'La Posada del Camino',
        description: 'Una vieja posada de madera',
        text: 'Caminas por el antiguo sendero hasta llegar a una posada desgastada. El humo sale de la chimenea y se oye música dentro.',
        options: [
            { text: 'Entrar a la posada', action: 'enterTavern' },
            { text: 'Acampar afuera', action: 'camp' },
            { text: 'Volver al camino', action: 'start' }
        ]
    },
    
    rest: {
        title: 'Campamento',
        description: 'Descansas bajo las estrellas',
        text: 'Enciendes un pequeño fuego y descanso bajo el cielo estrellado. Te sientes más fuerte. Tu salud se restaura completamente.',
        onEnter: () => {
            game.player.health = game.player.maxHealth;
            game.player.mana = game.player.maxMana;
            updateUI();
        },
        options: [
            { text: 'Explorar el bosque', action: 'explore' },
            { text: 'Seguir el camino', action: 'followRoad' }
        ]
    },
    
    enterTavern: {
        title: 'La Posada',
        description: 'Un lugar cálido y acogedor',
        text: 'Entras en la posada. El tabernero te saluda con una sonrisa. Hay viajeros bebiendo cerveza en las mesas. El tabernero dice: "Bienvenido, aventurero. ¿Qué deseas?"',
        options: [
            { text: 'Comprar bebida (10 de oro)', action: 'buyDrink' },
            { text: 'Pedir información', action: 'askInfo' },
            { text: 'Alquilar una habitación (25 de oro)', action: 'rentRoom' },
            { text: 'Partir', action: 'start' }
        ]
    },
    
    camp: {
        title: 'Campamento',
        description: 'Acampas fuera de la posada',
        text: 'Acampas en el exterior. Durante la noche, escuchas ruidos extraños... De repente, una banda de bandidos emerge de las sombras!',
        combat: true,
        enemy: {
            name: 'Bandido',
            health: 25,
            maxHealth: 25,
            attack: 6,
            defense: 1,
            xpReward: 30,
            goldReward: 40
        },
        onVictory: 'victory_bandit'
    },
    
    victory_wolf: {
        title: 'Victoria',
        description: 'Has derrotado al lobo',
        text: 'El lobo cae derrotado. Encuentras una poción de salud en su guarida.',
        onEnter: () => {
            game.player.inventory.push({ name: 'Poción de Salud', healing: 30 });
            addLog('Obtienes: Poción de Salud', 'xp');
        },
        options: [
            { text: 'Continuar', action: 'start' }
        ]
    },
    
    victory_bandit: {
        title: 'Victoria',
        description: 'Has derrotado a los bandidos',
        text: 'Los bandidos huyen despavoridos. Encuentras oro entre sus pertenencias.',
        onEnter: () => {
            game.player.gold += 100;
            addLog('Obtienes: 100 de oro', 'xp');
        },
        options: [
            { text: 'Continuar', action: 'start' }
        ]
    },
    
    buyDrink: {
        title: 'La Posada',
        description: 'Compras una bebida refrescante',
        text: 'Bebes una cerveza refrescante. Te sientes mejor.',
        onEnter: () => {
            if (game.player.gold >= 10) {
                game.player.gold -= 10;
                game.player.health = Math.min(game.player.health + 20, game.player.maxHealth);
                addLog('Compras una bebida por 10 de oro', 'heal');
            } else {
                addLog('No tienes suficiente oro!', 'damage');
            }
            updateUI();
        },
        options: [
            { text: 'Seguir en la posada', action: 'enterTavern' },
            { text: 'Partir', action: 'start' }
        ]
    },
    
    askInfo: {
        title: 'La Posada',
        description: 'El tabernero te cuenta historias',
        text: 'El tabernero se inclina y susurra: "He oído hablar de una mazmorra antigua al norte de aquí. Se dice que hay un dragón... y un tesoro invaluable."',
        options: [
            { text: 'Preguntar más', action: 'askInfo' },
            { text: 'Partir en una búsqueda', action: 'dungeon' },
            { text: 'Volver al descanso', action: 'enterTavern' }
        ]
    },
    
    rentRoom: {
        title: 'Habitación de la Posada',
        description: 'Una habitación acogedora',
        text: 'Alquilas una habitación confortable. Duermes profundamente y despiertas renovado.',
        onEnter: () => {
            if (game.player.gold >= 25) {
                game.player.gold -= 25;
                game.player.health = game.player.maxHealth;
                game.player.mana = game.player.maxMana;
                addLog('Alquilas una habitación por 25 de oro', 'heal');
            } else {
                addLog('No tienes suficiente oro!', 'damage');
            }
            updateUI();
        },
        options: [
            { text: 'Descansar más', action: 'rentRoom' },
            { text: 'Partir', action: 'start' }
        ]
    },
    
    dungeon: {
        title: 'La Mazmorra Antigua',
        description: 'Entrada oscura a una mazmorra',
        text: 'Te adentras en la mazmorra. Las paredes están cubiertas de musgo y escombros. De repente, un DRAGÓN JOVEN emerge de las sombras, rugiendo furiosamente!',
        combat: true,
        enemy: {
            name: 'Dragón Joven',
            health: 80,
            maxHealth: 80,
            attack: 12,
            defense: 5,
            xpReward: 150,
            goldReward: 300
        },
        onVictory: 'victory_dragon'
    },
    
    victory_dragon: {
        title: '¡VICTORIA ÉPICA!',
        description: 'Has derrotado al dragón',
        text: 'El dragón cae. Has encontrado un tesoro inmenso. ¡Eres una leyenda! La aventura continúa...',
        onEnter: () => {
            game.player.gold += 500;
            game.player.experience += 100;
            addLog('¡VICTORIA ÉPICA! Obtienes un tesoro invaluable', 'xp');
            checkLevelUp();
        },
        options: [
            { text: 'Continuar la aventura', action: 'start' }
        ]
    }
};

// FUNCIONES PRINCIPALES

function selectRace(raceKey) {
    const race = races[raceKey];
    game.player.race = raceKey;
    game.player.name = race.name + ' Aventurero';
    
    // Aplicar bonificadores de raza
    for (let stat in race.bonus) {
        game.player.stats[stat] += race.bonus[stat];
    }
    
    // Recalcular salud basada en constitución
    game.player.maxHealth = 100 + (game.player.stats.constitution * 5);
    game.player.health = game.player.maxHealth;
    game.player.maxMana = 50 + (game.player.stats.intelligence * 3);
    game.player.mana = game.player.maxMana;
    
    // Cambiar pantalla
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // Iniciar el juego
    loadScene('start');
    updateUI();
    addLog(`Bienvenido, ${game.player.name}!`, 'welcome');
}

function loadScene(sceneKey) {
    const scene = scenes[sceneKey];
    if (!scene) return;
    
    game.currentScene = sceneKey;
    
    // Actualizar encabezado
    document.getElementById('locationName').textContent = scene.title;
    document.getElementById('locationDesc').textContent = scene.description;
    
    // Mostrar contenido de la historia
    const storyContent = document.getElementById('storyContent');
    storyContent.innerHTML = `<p>${scene.text}</p>`;
    
    // Ejecutar acción al entrar si existe
    if (scene.onEnter) {
        scene.onEnter();
    }
    
    // Mostrar combate si es necesario
    const combatArea = document.getElementById('combatArea');
    if (scene.combat && scene.enemy) {
        combatArea.style.display = 'block';
        game.currentEnemy = {
            ...scene.enemy,
            health: scene.enemy.maxHealth
        };
        updateEnemyUI();
    } else {
        combatArea.style.display = 'none';
        game.currentEnemy = null;
    }
    
    // Mostrar opciones
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    if (scene.options) {
        scene.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.text;
            btn.onclick = () => {
                if (typeof option.action === 'string') {
                    loadScene(option.action);
                }
            };
            optionsContainer.appendChild(btn);
        });
    }
}

function playerAttack() {
    if (!game.currentEnemy) return;
    
    const damage = Math.floor(Math.random() * 10 + game.player.stats.strength);
    game.currentEnemy.health -= damage;
    
    addLog(`¡Atacas! Inflinges ${damage} de daño`, 'damage');
    
    if (game.currentEnemy.health <= 0) {
        defeatEnemy();
    } else {
        setTimeout(() => enemyAttack(), 800);
    }
    
    updateUI();
}

function castSpell() {
    if (!game.currentEnemy) return;
    
    if (game.player.mana < 15) {
        addLog('No tienes suficiente maná!', 'damage');
        return;
    }
    
    game.player.mana -= 15;
    const damage = Math.floor(Math.random() * 15 + game.player.stats.intelligence);
    game.currentEnemy.health -= damage;
    
    addLog(`¡Lanzas un hechizo! Inflinges ${damage} de daño mágico`, 'damage');
    
    if (game.currentEnemy.health <= 0) {
        defeatEnemy();
    } else {
        setTimeout(() => enemyAttack(), 800);
    }
    
    updateUI();
}

function defend() {
    game.defending = true;
    addLog('Te pones en posición defensiva', 'heal');
    
    setTimeout(() => {
        enemyAttack();
        game.defending = false;
    }, 800);
}

function enemyAttack() {
    if (!game.currentEnemy || game.currentEnemy.health <= 0) return;
    
    let damage = Math.floor(Math.random() * 8 + game.currentEnemy.attack);
    
    if (game.defending) {
        damage = Math.floor(damage / 2);
        addLog(`El enemigo ataca pero tu defensa reduce el daño a ${damage}`, 'heal');
    } else {
        addLog(`¡El ${game.currentEnemy.name} te ataca! Recibes ${damage} de daño`, 'damage');
    }
    
    game.player.health -= damage;
    
    if (game.player.health <= 0) {
        gameOver();
    }
    
    updateUI();
}

function flee() {
    const fleeChance = Math.random();
    if (fleeChance > 0.4) {
        addLog('¡Logras escapar!', 'heal');
        loadScene('start');
    } else {
        addLog('¡No logras escapar!', 'damage');
        enemyAttack();
    }
}

function defeatEnemy() {
    const xp = game.currentEnemy.xpReward;
    const gold = game.currentEnemy.goldReward;
    
    game.player.experience += xp;
    game.player.gold += gold;
    game.player.enemiesDefeated += 1;
    
    addLog(`¡Derrotas al ${game.currentEnemy.name}!`, 'xp');
    addLog(`Obtienes ${xp} de experiencia y ${gold} de oro`, 'xp');
    
    checkLevelUp();
    updateUI();
    
    const scene = scenes[game.currentScene];
    if (scene.onVictory) {
        setTimeout(() => {
            loadScene(scene.onVictory);
        }, 1500);
    }
    
    game.currentEnemy = null;
    document.getElementById('combatArea').style.display = 'none';
}

function checkLevelUp() {
    while (game.player.experience >= game.player.maxExperience) {
        game.player.experience -= game.player.maxExperience;
        game.player.level += 1;
        game.player.maxHealth += 20;
        game.player.health = game.player.maxHealth;
        game.player.maxMana += 10;
        game.player.mana = game.player.maxMana;
        
        addLog(`¡SUBISTE DE NIVEL! Ahora eres nivel ${game.player.level}!`, 'xp');
    }
}

function gameOver() {
    addLog('¡HAS SIDO DERROTADO! Reinicia el juego.', 'damage');
    document.getElementById('combatArea').style.display = 'none';
}

function addLog(message, type = 'normal') {
    const messageLog = document.getElementById('messageLog');
    const entry = document.createElement('p');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    
    messageLog.appendChild(entry);
    messageLog.scrollTop = messageLog.scrollHeight;
    
    // Mantener solo los últimos 10 mensajes
    const entries = messageLog.querySelectorAll('.log-entry');
    if (entries.length > 10) {
        entries[0].remove();
    }
}

function updateUI() {
    // Actualizar información del personaje
    document.getElementById('characterName').textContent = game.player.name;
    document.getElementById('characterRace').textContent = races[game.player.race].description;
    
    // Barras de salud, maná y experiencia
    const healthPercent = (game.player.health / game.player.maxHealth) * 100;
    const manaPercent = (game.player.mana / game.player.maxMana) * 100;
    const expPercent = (game.player.experience / game.player.maxExperience) * 100;
    
    document.getElementById('healthBar').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = `${game.player.health}/${game.player.maxHealth}`;
    
    document.getElementById('manaBar').style.width = manaPercent + '%';
    document.getElementById('manaText').textContent = `${game.player.mana}/${game.player.maxMana}`;
    
    document.getElementById('expBar').style.width = expPercent + '%';
    document.getElementById('expText').textContent = `${game.player.experience}/${game.player.maxExperience}`;
    
    // Actualizar atributos
    document.getElementById('attrStr').textContent = game.player.stats.strength;
    document.getElementById('attrDex').textContent = game.player.stats.dexterity;
    document.getElementById('attrCon').textContent = game.player.stats.constitution;
    document.getElementById('attrInt').textContent = game.player.stats.intelligence;
    document.getElementById('attrWis').textContent = game.player.stats.wisdom;
    document.getElementById('attrCha').textContent = game.player.stats.charisma;
    
    // Actualizar inventario
    const inventoryList = document.getElementById('inventoryList');
    if (game.player.inventory.length === 0) {
        inventoryList.innerHTML = '<p class="empty-inventory">Vacío</p>';
    } else {
        inventoryList.innerHTML = '';
        game.player.inventory.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `${item.name} <small>(click para usar)</small>`;
            itemDiv.onclick = () => useItem(index);
            inventoryList.appendChild(itemDiv);
        });
    }
    
    // Actualizar estadísticas
    document.getElementById('levelText').textContent = game.player.level;
    document.getElementById('goldText').textContent = game.player.gold;
    document.getElementById('enemiesDefeatedText').textContent = game.player.enemiesDefeated;
}

function updateEnemyUI() {
    if (!game.currentEnemy) return;
    
    document.getElementById('enemyName').textContent = game.currentEnemy.name;
    const healthPercent = (game.currentEnemy.health / game.currentEnemy.maxHealth) * 100;
    document.getElementById('enemyHealthBar').style.width = healthPercent + '%';
    document.getElementById('enemyHealthText').textContent = `${Math.max(0, game.currentEnemy.health)}/${game.currentEnemy.maxHealth}`;
}

function useItem(index) {
    const item = game.player.inventory[index];
    if (item.healing) {
        game.player.health = Math.min(game.player.health + item.healing, game.player.maxHealth);
        addLog(`Usas ${item.name}. Recuperas ${item.healing} de salud`, 'heal');
        game.player.inventory.splice(index, 1);
        updateUI();
    }
}

// FUNCIONES DE MENÚ

function openMenu() {
    document.getElementById('menuModal').classList.add('active');
}

function closeMenu() {
    document.getElementById('menuModal').classList.remove('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function continueGame() {
    closeMenu();
}

function showCharacterStats() {
    const statsModal = document.getElementById('statsModal');
    const detailedStats = document.getElementById('detailedStats');
    
    detailedStats.innerHTML = `
        <h4>${game.player.name}</h4>
        <p><strong>Raza:</strong> ${races[game.player.race].name}</p>
        <p><strong>Nivel:</strong> ${game.player.level}</p>
        <p><strong>Experiencia:</strong> ${game.player.experience}/${game.player.maxExperience}</p>
        <p><strong>Vida:</strong> ${game.player.health}/${game.player.maxHealth}</p>
        <p><strong>Maná:</strong> ${game.player.mana}/${game.player.maxMana}</p>
        <p><strong>Oro:</strong> ${game.player.gold}</p>
        <p><strong>Enemigos derrotados:</strong> ${game.player.enemiesDefeated}</p>
        
        <h4 style="margin-top: 20px;">Atributos</h4>
        <p>Fuerza: ${game.player.stats.strength}</p>
        <p>Destreza: ${game.player.stats.dexterity}</p>
        <p>Constitución: ${game.player.stats.constitution}</p>
        <p>Inteligencia: ${game.player.stats.intelligence}</p>
        <p>Sabiduría: ${game.player.stats.wisdom}</p>
        <p>Carisma: ${game.player.stats.charisma}</p>
    `;
    
    statsModal.classList.add('active');
}

function resetGame() {
    if (confirm('¿Estás seguro de que quieres comenzar un nuevo juego?')) {
        location.reload();
    }
}

function showCredits() {
    closeMenu();
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const menuModal = document.getElementById('menuModal');
    const statsModal = document.getElementById('statsModal');
    const creditsModal = document.getElementById('creditsModal');
    
    if (event.target == menuModal) {
        menuModal.classList.remove('active');
    }
    if (event.target == statsModal) {
        statsModal.classList.remove('active');
    }
    if (event.target == creditsModal) {
        creditsModal.classList.remove('active');
    }
}
