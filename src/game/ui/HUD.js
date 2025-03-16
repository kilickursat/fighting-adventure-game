export class HUD {
  constructor(uiContainer, game) {
    this.container = uiContainer;
    this.game = game;
    
    // Elements
    this.hudElement = null;
    this.playerHealthBar = null;
    this.playerHealthText = null;
    this.playerResourceBar = null;
    this.playerResourceText = null;
    this.enemyHealthBar = null;
    this.enemyHealthText = null;
    this.skillsContainer = null;
    
    // Characters references
    this.player = null;
    this.enemy = null;
    
    // Initialize
    this._createHUD();
    
    // Initially hide the HUD
    this.hide();
  }
  
  _createHUD() {
    // Create main HUD container
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'hud';
    
    // Create player status area (left side)
    const playerStatus = document.createElement('div');
    playerStatus.className = 'player-status';
    
    const playerHealth = this._createHealthBar('player-health');
    this.playerHealthBar = playerHealth.bar;
    this.playerHealthText = playerHealth.text;
    
    const playerResource = this._createResourceBar('player-resource');
    this.playerResourceBar = playerResource.bar;
    this.playerResourceText = playerResource.text;
    
    playerStatus.appendChild(playerHealth.container);
    playerStatus.appendChild(playerResource.container);
    
    // Create enemy status area (right side)
    const enemyStatus = document.createElement('div');
    enemyStatus.className = 'enemy-status';
    
    const enemyHealth = this._createHealthBar('enemy-health');
    this.enemyHealthBar = enemyHealth.bar;
    this.enemyHealthText = enemyHealth.text;
    
    enemyStatus.appendChild(enemyHealth.container);
    
    // Create skills area (bottom center)
    this.skillsContainer = document.createElement('div');
    this.skillsContainer.className = 'skills-container';
    
    // Add all elements to HUD
    this.hudElement.appendChild(playerStatus);
    this.hudElement.appendChild(enemyStatus);
    this.hudElement.appendChild(this.skillsContainer);
    
    // Add HUD to UI container
    this.container.appendChild(this.hudElement);
    
    // Add CSS for HUD
    this._addStyles();
  }
  
  _createHealthBar(id) {
    const container = document.createElement('div');
    container.className = 'status-item';
    
    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = 'Health';
    
    const barContainer = document.createElement('div');
    barContainer.className = 'health-bar';
    
    const bar = document.createElement('div');
    bar.className = 'health-fill';
    bar.style.width = '100%';
    
    const text = document.createElement('div');
    text.className = 'status-text';
    text.textContent = '100/100';
    
    barContainer.appendChild(bar);
    container.appendChild(label);
    container.appendChild(barContainer);
    container.appendChild(text);
    
    return { container, bar, text };
  }
  
  _createResourceBar(id) {
    const container = document.createElement('div');
    container.className = 'status-item';
    
    const label = document.createElement('div');
    label.className = 'status-label';
    label.textContent = 'Resource'; // Will be updated based on character type
    
    const barContainer = document.createElement('div');
    barContainer.className = 'resource-bar';
    
    const bar = document.createElement('div');
    bar.className = 'resource-fill';
    bar.style.width = '100%';
    
    const text = document.createElement('div');
    text.className = 'status-text';
    text.textContent = '100/100';
    
    barContainer.appendChild(bar);
    container.appendChild(label);
    container.appendChild(barContainer);
    container.appendChild(text);
    
    return { container, bar, text, label };
  }
  
  _addStyles() {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      .hud {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        color: white;
        font-family: Arial, sans-serif;
      }
      
      .player-status, .enemy-status {
        width: 250px;
      }
      
      .enemy-status {
        text-align: right;
      }
      
      .status-item {
        margin-bottom: 10px;
      }
      
      .status-label {
        font-size: 14px;
        margin-bottom: 5px;
        text-shadow: 1px 1px 2px #000;
      }
      
      .status-text {
        font-size: 12px;
        margin-top: 3px;
        text-shadow: 1px 1px 2px #000;
      }
      
      .health-bar, .resource-bar {
        height: 20px;
        background-color: rgba(0, 0, 0, 0.5);
        border: 2px solid #fff;
        border-radius: 10px;
        overflow: hidden;
      }
      
      .health-fill {
        height: 100%;
        background-color: #ff3333;
        width: 100%;
        transition: width 0.3s;
      }
      
      .resource-fill {
        height: 100%;
        background-color: #3399ff;
        width: 100%;
        transition: width 0.3s;
      }
      
      .skills-container {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
      }
      
      .skill-button {
        width: 60px;
        height: 60px;
        border-radius: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        border: 2px solid #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        pointer-events: auto;
      }
      
      .skill-button:hover {
        background-color: rgba(50, 50, 50, 0.7);
      }
      
      .skill-icon {
        width: 36px;
        height: 36px;
        background-color: #666;
        border-radius: 5px;
        margin-bottom: 3px;
      }
      
      .skill-key {
        font-size: 10px;
      }
      
      .cooldown-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background-color: rgba(0, 0, 0, 0.7);
        transition: height 0.1s linear;
      }
      
      .skill-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.3s;
        margin-bottom: 5px;
        pointer-events: none;
      }
      
      .skill-button:hover .skill-tooltip {
        visibility: visible;
        opacity: 1;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  setPlayer(character) {
    this.player = character;
    
    // Update resource type based on character class
    const playerResourceLabel = this.playerResourceBar.parentNode.querySelector('.status-label');
    
    if (character.constructor.name === 'Warrior') {
      playerResourceLabel.textContent = 'Rage';
      this.playerResourceBar.style.backgroundColor = '#ff9900';
    } else if (character.constructor.name === 'Mage') {
      playerResourceLabel.textContent = 'Mana';
      this.playerResourceBar.style.backgroundColor = '#3399ff';
    }
    
    // Set up skill buttons
    this._setupSkillButtons();
    
    // Initial update
    this.update();
  }
  
  setEnemy(character) {
    this.enemy = character;
    
    // Initial update
    this.update();
  }
  
  _setupSkillButtons() {
    // Clear previous buttons
    this.skillsContainer.innerHTML = '';
    
    if (!this.player || !this.player.skills) return;
    
    // Add basic attack button
    const basicAttackButton = this._createSkillButton({
      key: 'A',
      name: 'Basic Attack',
      description: 'Perform a basic attack',
      onClick: () => this.game.executePlayerAction('basicAttack')
    });
    
    this.skillsContainer.appendChild(basicAttackButton);
    
    // Add skill buttons based on character skills
    this.player.skills.forEach((skill, index) => {
      const skillButton = this._createSkillButton({
        key: (index + 1).toString(),
        name: skill.name,
        description: skill.description,
        cooldown: skill.cooldown,
        cost: skill.cost,
        index: index,
        onClick: () => this.game.executePlayerAction('skill', { skillIndex: index })
      });
      
      this.skillsContainer.appendChild(skillButton);
    });
  }
  
  _createSkillButton(options) {
    const button = document.createElement('div');
    button.className = 'skill-button';
    
    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    
    const keyText = document.createElement('div');
    keyText.className = 'skill-key';
    keyText.textContent = options.key;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    
    let tooltipContent = `<strong>${options.name}</strong><br>${options.description}`;
    
    if (options.cost) {
      tooltipContent += `<br>Cost: ${options.cost}`;
    }
    
    if (options.cooldown) {
      tooltipContent += `<br>Cooldown: ${options.cooldown}s`;
    }
    
    tooltip.innerHTML = tooltipContent;
    
    const cooldownOverlay = document.createElement('div');
    cooldownOverlay.className = 'cooldown-overlay';
    
    button.appendChild(icon);
    button.appendChild(keyText);
    button.appendChild(tooltip);
    button.appendChild(cooldownOverlay);
    
    button.addEventListener('click', options.onClick);
    
    // Store reference to cooldown overlay
    button.cooldownOverlay = cooldownOverlay;
    
    // Store skill index if provided
    if (options.index !== undefined) {
      button.dataset.skillIndex = options.index;
    }
    
    return button;
  }
  
  update() {
    // Update player health
    if (this.player) {
      const healthPercent = (this.player.health / this.player.maxHealth) * 100;
      this.playerHealthBar.style.width = `${healthPercent}%`;
      this.playerHealthText.textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
      
      // Update resource bar based on character type
      let resourcePercent, resourceText;
      
      if (this.player.constructor.name === 'Warrior' && this.player.rage !== undefined) {
        resourcePercent = (this.player.rage / this.player.maxRage) * 100;
        resourceText = `${Math.floor(this.player.rage)}/${this.player.maxRage}`;
      } else if (this.player.constructor.name === 'Mage' && this.player.mana !== undefined) {
        resourcePercent = (this.player.mana / this.player.maxMana) * 100;
        resourceText = `${Math.floor(this.player.mana)}/${this.player.maxMana}`;
      } else {
        resourcePercent = 0;
        resourceText = '0/0';
      }
      
      this.playerResourceBar.style.width = `${resourcePercent}%`;
      this.playerResourceText.textContent = resourceText;
      
      // Update skill cooldowns
      this._updateSkillCooldowns();
    }
    
    // Update enemy health
    if (this.enemy) {
      const healthPercent = (this.enemy.health / this.enemy.maxHealth) * 100;
      this.enemyHealthBar.style.width = `${healthPercent}%`;
      this.enemyHealthText.textContent = `${Math.ceil(this.enemy.health)}/${this.enemy.maxHealth}`;
    }
  }
  
  _updateSkillCooldowns() {
    // Skip if player doesn't have skills
    if (!this.player || !this.player.skills) return;
    
    // Get all skill buttons with data-skill-index
    const skillButtons = Array.from(this.skillsContainer.querySelectorAll('[data-skill-index]'));
    
    const now = Date.now() / 1000;
    
    // Update each skill button
    skillButtons.forEach(button => {
      const skillIndex = parseInt(button.dataset.skillIndex);
      const skill = this.player.skills[skillIndex];
      
      if (skill && skill.lastUsed > 0) {
        const elapsedTime = now - skill.lastUsed;
        
        if (elapsedTime < skill.cooldown) {
          // Skill is on cooldown
          const cooldownPercent = (1 - (elapsedTime / skill.cooldown)) * 100;
          button.cooldownOverlay.style.height = `${cooldownPercent}%`;
          
          // Add remaining time text
          const remainingTime = Math.ceil(skill.cooldown - elapsedTime);
          button.cooldownOverlay.textContent = remainingTime;
        } else {
          // Skill is ready
          button.cooldownOverlay.style.height = '0%';
          button.cooldownOverlay.textContent = '';
        }
      } else {
        // Skill is ready
        button.cooldownOverlay.style.height = '0%';
        button.cooldownOverlay.textContent = '';
      }
      
      // Check if player has enough resources for the skill
      let hasEnoughResources = false;
      
      if (this.player.constructor.name === 'Warrior' && this.player.rage !== undefined) {
        hasEnoughResources = this.player.rage >= skill.cost;
      } else if (this.player.constructor.name === 'Mage' && this.player.mana !== undefined) {
        hasEnoughResources = this.player.mana >= skill.cost;
      }
      
      // Apply visual feedback for resource availability
      if (!hasEnoughResources) {
        button.style.opacity = '0.5';
      } else {
        button.style.opacity = '1';
      }
    });
  }
  
  show() {
    this.hudElement.style.display = 'flex';
  }
  
  hide() {
    this.hudElement.style.display = 'none';
  }
  
  displayMessage(message, duration = 3000) {
    // Create a floating message
    const messageElement = document.createElement('div');
    messageElement.className = 'floating-message';
    messageElement.textContent = message;
    
    // Add styles for the message
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.fontSize = '20px';
    messageElement.style.textAlign = 'center';
    messageElement.style.zIndex = '1000';
    messageElement.style.pointerEvents = 'none';
    
    // Add message to container
    this.container.appendChild(messageElement);
    
    // Remove after duration
    setTimeout(() => {
      this.container.removeChild(messageElement);
    }, duration);
  }
} 