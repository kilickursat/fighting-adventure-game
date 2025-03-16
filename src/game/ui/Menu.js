export class Menu {
  constructor(uiContainer, game) {
    this.container = uiContainer;
    this.game = game;
    
    // Elements
    this.menuElement = null;
    this.activeScreen = null;
    
    // State
    this.selectedCharacter = null;
    this.selectedEnvironment = null;
    
    // Character options
    this.characterOptions = [
      {
        id: 'warrior',
        name: 'Warrior',
        description: 'A powerful melee fighter with high health and strong physical attacks. Gains rage from combat to fuel devastating abilities.',
        abilities: ['Heavy Strike', 'Whirlwind', 'Battle Cry'],
        stats: {
          health: 120,
          attackPower: 15,
          defense: 8,
          speed: 4
        },
        thumbnail: '/assets/textures/warrior_texture.png'
      },
      {
        id: 'mage',
        name: 'Mage',
        description: 'A master of arcane magic with powerful ranged spells. Sacrifices physical defense for magical prowess and agility.',
        abilities: ['Fireball', 'Ice Barrier', 'Lightning Storm'],
        stats: {
          health: 80,
          attackPower: 20,
          defense: 3,
          speed: 6
        },
        thumbnail: '/assets/textures/mage_texture.png'
      }
    ];
    
    // Environment options
    this.environmentOptions = [
      {
        id: 'arena',
        name: 'Arena',
        description: 'A gladiatorial arena with spectators. The flat, open space allows for unobstructed combat.',
        thumbnail: '/assets/textures/arena_texture.png'
      },
      {
        id: 'forest',
        name: 'Forest',
        description: 'A dense forest with trees and rocks. The varied terrain provides obstacles and cover during fights.',
        thumbnail: '/assets/textures/forest_texture.png'
      }
    ];
    
    // Initialize
    this._createMenu();
    
    // Initially hide the menu
    this.hide();
  }
  
  _createMenu() {
    // Create main menu container
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'game-menu';
    
    // Add to UI container
    this.container.appendChild(this.menuElement);
    
    // Add CSS for menu
    this._addStyles();
  }
  
  _addStyles() {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      .game-menu {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 100;
      }
      
      .menu-screen {
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        border: 2px solid #666;
        color: white;
        width: 80%;
        max-width: 800px;
        padding: 30px;
        text-align: center;
      }
      
      .menu-title {
        font-size: 36px;
        margin-bottom: 20px;
        color: #ff3333;
        text-transform: uppercase;
        text-shadow: 0 0 10px rgba(255, 51, 51, 0.5);
      }
      
      .menu-subtitle {
        font-size: 24px;
        margin-bottom: 20px;
        color: #fff;
      }
      
      .menu-buttons {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin: 20px 0;
      }
      
      .menu-button {
        background-color: #ff3333;
        color: white;
        border: none;
        padding: 12px 24px;
        font-size: 18px;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;
      }
      
      .menu-button:hover {
        background-color: #ff5555;
      }
      
      .menu-button:disabled {
        background-color: #555;
        cursor: not-allowed;
      }
      
      .selection-grid {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin: 30px 0;
        flex-wrap: wrap;
      }
      
      .selection-option {
        width: 200px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 2px solid #666;
        border-radius: 5px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .selection-option:hover {
        border-color: #ff3333;
        background-color: rgba(50, 0, 0, 0.5);
      }
      
      .selection-option.selected {
        border-color: #ff3333;
        box-shadow: 0 0 15px rgba(255, 51, 51, 0.7);
      }
      
      .option-thumbnail {
        width: 100%;
        height: 120px;
        background-color: #333;
        margin-bottom: 10px;
        background-size: cover;
        background-position: center;
        border-radius: 3px;
      }
      
      .option-title {
        font-size: 18px;
        margin-bottom: 5px;
      }
      
      .option-description {
        font-size: 12px;
        color: #ccc;
        margin-bottom: 10px;
      }
      
      .option-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 10px;
      }
      
      .stat-item {
        font-size: 12px;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 3px 6px;
        border-radius: 3px;
      }
      
      .ability-list {
        margin-top: 10px;
        font-size: 12px;
        text-align: left;
      }
      
      .ability-item {
        padding: 2px 0;
      }
      
      .navigation {
        margin-top: 30px;
        display: flex;
        justify-content: space-between;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .game-title {
        font-size: 48px;
        margin-bottom: 30px;
        color: #ff3333;
        text-transform: uppercase;
        letter-spacing: 3px;
        animation: pulse 2s infinite;
        text-shadow: 0 0 20px rgba(255, 51, 51, 0.8);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  showMainMenu() {
    // Clear menu content
    this.menuElement.innerHTML = '';
    
    // Create main menu screen
    const mainMenuScreen = document.createElement('div');
    mainMenuScreen.className = 'menu-screen';
    
    // Game title
    const gameTitle = document.createElement('div');
    gameTitle.className = 'game-title';
    gameTitle.textContent = 'Fighting Adventure';
    
    // Menu buttons
    const menuButtons = document.createElement('div');
    menuButtons.className = 'menu-buttons';
    
    // Start game button
    const startButton = document.createElement('button');
    startButton.className = 'menu-button';
    startButton.textContent = 'Start Game';
    startButton.addEventListener('click', () => this.showCharacterSelection());
    
    // Options button
    const optionsButton = document.createElement('button');
    optionsButton.className = 'menu-button';
    optionsButton.textContent = 'Options';
    optionsButton.addEventListener('click', () => this.showOptions());
    
    // Credits button
    const creditsButton = document.createElement('button');
    creditsButton.className = 'menu-button';
    creditsButton.textContent = 'Credits';
    creditsButton.addEventListener('click', () => this.showCredits());
    
    // Add buttons to container
    menuButtons.appendChild(startButton);
    menuButtons.appendChild(optionsButton);
    menuButtons.appendChild(creditsButton);
    
    // Add elements to screen
    mainMenuScreen.appendChild(gameTitle);
    mainMenuScreen.appendChild(menuButtons);
    
    // Add screen to menu
    this.menuElement.appendChild(mainMenuScreen);
    
    // Set active screen
    this.activeScreen = 'main';
    
    // Show menu
    this.show();
  }
  
  showCharacterSelection() {
    // Clear menu content
    this.menuElement.innerHTML = '';
    
    // Create character selection screen
    const selectionScreen = document.createElement('div');
    selectionScreen.className = 'menu-screen';
    
    // Header
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'Choose Your Character';
    
    // Character selection grid
    const selectionGrid = document.createElement('div');
    selectionGrid.className = 'selection-grid';
    
    // Create character options
    this.characterOptions.forEach((character, index) => {
      const option = document.createElement('div');
      option.className = 'selection-option';
      option.dataset.id = character.id;
      
      // Select first character by default if none selected
      if (index === 0 && !this.selectedCharacter) {
        option.classList.add('selected');
        this.selectedCharacter = character.id;
      } else if (character.id === this.selectedCharacter) {
        option.classList.add('selected');
      }
      
      // Thumbnail
      const thumbnail = document.createElement('div');
      thumbnail.className = 'option-thumbnail';
      if (character.thumbnail) {
        thumbnail.style.backgroundColor = '#666';
        // In a real implementation, you'd load the actual image
        // thumbnail.style.backgroundImage = `url(${character.thumbnail})`;
      }
      
      // Character name
      const name = document.createElement('div');
      name.className = 'option-title';
      name.textContent = character.name;
      
      // Character description
      const description = document.createElement('div');
      description.className = 'option-description';
      description.textContent = character.description;
      
      // Character stats
      const stats = document.createElement('div');
      stats.className = 'option-stats';
      
      for (const [key, value] of Object.entries(character.stats)) {
        const stat = document.createElement('div');
        stat.className = 'stat-item';
        stat.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        stats.appendChild(stat);
      }
      
      // Character abilities
      const abilities = document.createElement('div');
      abilities.className = 'ability-list';
      
      if (character.abilities && character.abilities.length > 0) {
        const abilityTitle = document.createElement('div');
        abilityTitle.textContent = 'Abilities:';
        abilityTitle.style.fontWeight = 'bold';
        abilities.appendChild(abilityTitle);
        
        character.abilities.forEach(ability => {
          const abilityItem = document.createElement('div');
          abilityItem.className = 'ability-item';
          abilityItem.textContent = `• ${ability}`;
          abilities.appendChild(abilityItem);
        });
      }
      
      // Assemble option
      option.appendChild(thumbnail);
      option.appendChild(name);
      option.appendChild(description);
      option.appendChild(stats);
      option.appendChild(abilities);
      
      // Add selection logic
      option.addEventListener('click', () => {
        // Remove selected class from all options
        const allOptions = selectionGrid.querySelectorAll('.selection-option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store selected character
        this.selectedCharacter = character.id;
      });
      
      selectionGrid.appendChild(option);
    });
    
    // Navigation buttons
    const navigation = document.createElement('div');
    navigation.className = 'navigation';
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'menu-button';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => this.showMainMenu());
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'menu-button';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      if (this.selectedCharacter) {
        this.showEnvironmentSelection();
      }
    });
    
    // Add buttons to navigation
    navigation.appendChild(backButton);
    navigation.appendChild(nextButton);
    
    // Add elements to screen
    selectionScreen.appendChild(title);
    selectionScreen.appendChild(selectionGrid);
    selectionScreen.appendChild(navigation);
    
    // Add screen to menu
    this.menuElement.appendChild(selectionScreen);
    
    // Set active screen
    this.activeScreen = 'character-selection';
    
    // Show menu
    this.show();
  }
  
  showEnvironmentSelection() {
    // Clear menu content
    this.menuElement.innerHTML = '';
    
    // Create environment selection screen
    const selectionScreen = document.createElement('div');
    selectionScreen.className = 'menu-screen';
    
    // Header
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'Choose Your Environment';
    
    // Environment selection grid
    const selectionGrid = document.createElement('div');
    selectionGrid.className = 'selection-grid';
    
    // Create environment options
    this.environmentOptions.forEach((environment, index) => {
      const option = document.createElement('div');
      option.className = 'selection-option';
      option.dataset.id = environment.id;
      
      // Select first environment by default if none selected
      if (index === 0 && !this.selectedEnvironment) {
        option.classList.add('selected');
        this.selectedEnvironment = environment.id;
      } else if (environment.id === this.selectedEnvironment) {
        option.classList.add('selected');
      }
      
      // Thumbnail
      const thumbnail = document.createElement('div');
      thumbnail.className = 'option-thumbnail';
      if (environment.thumbnail) {
        thumbnail.style.backgroundColor = '#666';
        // In a real implementation, you'd load the actual image
        // thumbnail.style.backgroundImage = `url(${environment.thumbnail})`;
      }
      
      // Environment name
      const name = document.createElement('div');
      name.className = 'option-title';
      name.textContent = environment.name;
      
      // Environment description
      const description = document.createElement('div');
      description.className = 'option-description';
      description.textContent = environment.description;
      
      // Assemble option
      option.appendChild(thumbnail);
      option.appendChild(name);
      option.appendChild(description);
      
      // Add selection logic
      option.addEventListener('click', () => {
        // Remove selected class from all options
        const allOptions = selectionGrid.querySelectorAll('.selection-option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store selected environment
        this.selectedEnvironment = environment.id;
      });
      
      selectionGrid.appendChild(option);
    });
    
    // Navigation buttons
    const navigation = document.createElement('div');
    navigation.className = 'navigation';
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'menu-button';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => this.showCharacterSelection());
    
    // Start button
    const startButton = document.createElement('button');
    startButton.className = 'menu-button';
    startButton.textContent = 'Start Game';
    startButton.addEventListener('click', () => {
      if (this.selectedEnvironment) {
        this.startGame();
      }
    });
    
    // Add buttons to navigation
    navigation.appendChild(backButton);
    navigation.appendChild(startButton);
    
    // Add elements to screen
    selectionScreen.appendChild(title);
    selectionScreen.appendChild(selectionGrid);
    selectionScreen.appendChild(navigation);
    
    // Add screen to menu
    this.menuElement.appendChild(selectionScreen);
    
    // Set active screen
    this.activeScreen = 'environment-selection';
    
    // Show menu
    this.show();
  }
  
  showOptions() {
    // Simple options screen for demonstration
    // Clear menu content
    this.menuElement.innerHTML = '';
    
    // Create options screen
    const optionsScreen = document.createElement('div');
    optionsScreen.className = 'menu-screen';
    
    // Header
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'Options';
    
    // Options content (placeholder)
    const optionsContent = document.createElement('div');
    optionsContent.innerHTML = `
      <div style="margin-bottom: 20px;">Options would go here in a full implementation.</div>
    `;
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'menu-button';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => this.showMainMenu());
    
    // Add elements to screen
    optionsScreen.appendChild(title);
    optionsScreen.appendChild(optionsContent);
    optionsScreen.appendChild(backButton);
    
    // Add screen to menu
    this.menuElement.appendChild(optionsScreen);
    
    // Set active screen
    this.activeScreen = 'options';
    
    // Show menu
    this.show();
  }
  
  showCredits() {
    // Simple credits screen
    // Clear menu content
    this.menuElement.innerHTML = '';
    
    // Create credits screen
    const creditsScreen = document.createElement('div');
    creditsScreen.className = 'menu-screen';
    
    // Header
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'Credits';
    
    // Credits content
    const creditsContent = document.createElement('div');
    creditsContent.style.textAlign = 'center';
    creditsContent.style.marginBottom = '30px';
    creditsContent.innerHTML = `
      <h3>Fighting Adventure Game</h3>
      <p>A 3D fighting action-adventure game made with Three.js</p>
      <p>Created by: Game Developer</p>
      <p>© 2023 All Rights Reserved</p>
    `;
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'menu-button';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => this.showMainMenu());
    
    // Add elements to screen
    creditsScreen.appendChild(title);
    creditsScreen.appendChild(creditsContent);
    creditsScreen.appendChild(backButton);
    
    // Add screen to menu
    this.menuElement.appendChild(creditsScreen);
    
    // Set active screen
    this.activeScreen = 'credits';
    
    // Show menu
    this.show();
  }
  
  showGameOverScreen(isVictory, stats) {
    // Clear menu content
    this.menuElement.innerHTML = '';
    
    // Create game over screen
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'menu-screen';
    
    // Header
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = isVictory ? 'Victory!' : 'Defeat';
    title.style.color = isVictory ? '#4CAF50' : '#ff3333';
    
    // Message
    const message = document.createElement('div');
    message.className = 'menu-subtitle';
    message.textContent = isVictory 
      ? 'You have defeated your opponent!'
      : 'You have been defeated!';
    
    // Stats (if provided)
    let statsContent = '';
    if (stats) {
      statsContent = document.createElement('div');
      statsContent.style.marginBottom = '30px';
      statsContent.innerHTML = `
        <h3>Battle Statistics</h3>
        <p>Duration: ${stats.duration || '0'} seconds</p>
        <p>Damage Dealt: ${stats.damageDealt || '0'}</p>
        <p>Damage Taken: ${stats.damageTaken || '0'}</p>
        <p>Skills Used: ${stats.skillsUsed || '0'}</p>
      `;
    }
    
    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'menu-buttons';
    
    // Restart button
    const restartButton = document.createElement('button');
    restartButton.className = 'menu-button';
    restartButton.textContent = 'Play Again';
    restartButton.addEventListener('click', () => this.showCharacterSelection());
    
    // Main menu button
    const mainMenuButton = document.createElement('button');
    mainMenuButton.className = 'menu-button';
    mainMenuButton.textContent = 'Main Menu';
    mainMenuButton.addEventListener('click', () => this.showMainMenu());
    
    // Add buttons
    buttonContainer.appendChild(restartButton);
    buttonContainer.appendChild(mainMenuButton);
    
    // Add elements to screen
    gameOverScreen.appendChild(title);
    gameOverScreen.appendChild(message);
    if (statsContent) gameOverScreen.appendChild(statsContent);
    gameOverScreen.appendChild(buttonContainer);
    
    // Add screen to menu
    this.menuElement.appendChild(gameOverScreen);
    
    // Set active screen
    this.activeScreen = 'game-over';
    
    // Show menu
    this.show();
  }
  
  startGame() {
    // Hide menu
    this.hide();
    
    // Notify game to start with selected character and environment
    if (this.game && typeof this.game.startFight === 'function') {
      this.game.selectCharacter(this.selectedCharacter);
      this.game.selectEnvironment(this.selectedEnvironment);
      this.game.startFight();
    }
  }
  
  show() {
    this.menuElement.style.display = 'flex';
  }
  
  hide() {
    this.menuElement.style.display = 'none';
  }
  
  getSelectedCharacter() {
    return this.selectedCharacter;
  }
  
  getSelectedEnvironment() {
    return this.selectedEnvironment;
  }
} 