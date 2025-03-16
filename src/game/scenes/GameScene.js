import * as THREE from 'three';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';
import { Warrior } from '../characters/Warrior.js';
import { Mage } from '../characters/Mage.js';
import { Arena } from '../environments/Arena.js';
import { Forest } from '../environments/Forest.js';

export class GameScene {
  constructor(game) {
    this.game = game;
    
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    
    // UI
    this.hud = null;
    this.menu = null;
    
    // Environment
    this.environment = null;
    
    // Characters
    this.player = null;
    this.enemy = null;
    
    // Game state
    this.isGameActive = false;
    this.gameStats = {
      startTime: 0,
      endTime: 0,
      damageDealt: 0,
      damageTaken: 0,
      skillsUsed: 0
    };
    
    // Control state
    this.controls = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      jump: false,
      attack: false,
      block: false,
      skill1: false,
      skill2: false,
      skill3: false
    };
    
    // Enemy AI
    this.enemyAI = {
      nextActionTime: 0,
      actionCooldown: 1,
      targetPosition: new THREE.Vector3(),
      isMoving: false,
      actionProbabilities: {
        move: 0.6,
        attack: 0.3,
        skill: 0.1
      }
    };
    
    // Assets to preload
    this.assetsToLoad = [
      { type: 'model', path: '/assets/models/warrior.glb' },
      { type: 'model', path: '/assets/models/mage.glb' },
      { type: 'model', path: '/assets/models/arena.glb' },
      { type: 'model', path: '/assets/models/forest.glb' },
      { type: 'texture', path: '/assets/textures/warrior_texture.png' },
      { type: 'texture', path: '/assets/textures/mage_texture.png' },
      { type: 'texture', path: '/assets/textures/arena_texture.png' },
      { type: 'texture', path: '/assets/textures/forest_texture.png' }
    ];
    
    // Raycaster for picking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Loading manager
    this.loadingManager = new THREE.LoadingManager();
    
    // Bind event handlers
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onClick = this._onClick.bind(this);
  }
  
  enter() {
    // Create HUD
    this.hud = new HUD(this.game.uiContainer, this.game);
    
    // Initialize controls
    this._setupControls();
    
    // Show HUD
    this.hud.show();
  }
  
  exit() {
    // Hide HUD
    if (this.hud) {
      this.hud.hide();
    }
    
    // Remove controls
    this._removeControls();
    
    // Stop game
    this.isGameActive = false;
  }
  
  update(delta) {
    if (!this.isGameActive) return;
    
    // Update player based on controls
    this._updatePlayerControls(delta);
    
    // Update enemy AI
    this._updateEnemyAI(delta);
    
    // Update characters
    if (this.player) {
      this.player.update(delta);
      
      // Ensure player stays within environment boundaries
      if (this.environment) {
        this.player.position.copy(
          this.environment.checkBoundaries(this.player.position)
        );
      }
    }
    
    if (this.enemy) {
      this.enemy.update(delta);
      
      // Ensure enemy stays within environment boundaries
      if (this.environment) {
        this.enemy.position.copy(
          this.environment.checkBoundaries(this.enemy.position)
        );
      }
    }
    
    // Update environment
    if (this.environment) {
      this.environment.update(delta);
    }
    
    // Check collisions
    this._checkCollisions();
    
    // Update HUD
    if (this.hud) {
      this.hud.update();
    }
    
    // Check win/lose conditions
    this._checkGameEndConditions();
  }
  
  setupFight(characterId, environmentId) {
    // Create environment
    this._createEnvironment(environmentId);
    
    // Create player character
    this._createPlayerCharacter(characterId);
    
    // Create enemy character (choosing the opposite of player)
    const enemyId = characterId === 'warrior' ? 'mage' : 'warrior';
    this._createEnemyCharacter(enemyId);
    
    // Position characters
    this._positionCharacters();
    
    // Setup camera
    this._setupCamera();
    
    // Set HUD references
    if (this.hud) {
      this.hud.setPlayer(this.player);
      this.hud.setEnemy(this.enemy);
    }
    
    // Start game
    this.isGameActive = true;
    this.gameStats.startTime = Date.now();
    
    // Display start message
    if (this.hud) {
      this.hud.displayMessage('Fight!', 2000);
    }
  }
  
  _createEnvironment(environmentId) {
    // Clean up existing environment
    if (this.environment) {
      this.environment.dispose();
    }
    
    // Create selected environment
    switch(environmentId) {
      case 'arena':
        this.environment = new Arena();
        break;
      case 'forest':
        this.environment = new Forest();
        break;
      default:
        // Default to arena
        this.environment = new Arena();
    }
    
    // Load environment
    this.environment.load(this.loadingManager, () => {
      // When environment is loaded, set it as the scene
      this.scene = this.environment.getScene();
      
      // Apply camera settings from environment
      const cameraSettings = this.environment.getCameraSettings();
      if (cameraSettings) {
        this.camera.position.copy(cameraSettings.position);
        this.camera.lookAt(cameraSettings.lookAt);
      }
    });
  }
  
  _createPlayerCharacter(characterId) {
    // Clean up existing player
    if (this.player) {
      this.player.dispose();
    }
    
    // Create selected character
    switch(characterId) {
      case 'warrior':
        this.player = new Warrior();
        break;
      case 'mage':
        this.player = new Mage();
        break;
      default:
        // Default to warrior
        this.player = new Warrior();
    }
    
    // Load character
    this.player.load(this.loadingManager, () => {
      // When character is loaded, add to scene
      if (this.scene && this.player.getGroup()) {
        this.scene.add(this.player.getGroup());
      }
    });
  }
  
  _createEnemyCharacter(characterId) {
    // Clean up existing enemy
    if (this.enemy) {
      this.enemy.dispose();
    }
    
    // Create selected character
    switch(characterId) {
      case 'warrior':
        this.enemy = new Warrior();
        break;
      case 'mage':
        this.enemy = new Mage();
        break;
      default:
        // Default to mage
        this.enemy = new Mage();
    }
    
    // Load character
    this.enemy.load(this.loadingManager, () => {
      // When character is loaded, add to scene
      if (this.scene && this.enemy.getGroup()) {
        this.scene.add(this.enemy.getGroup());
      }
    });
  }
  
  _positionCharacters() {
    // Position player and enemy across from each other
    if (this.player) {
      this.player.position.set(-5, 0, 0);
      this.player.rotation.y = Math.PI / 2; // Face right
    }
    
    if (this.enemy) {
      this.enemy.position.set(5, 0, 0);
      this.enemy.rotation.y = -Math.PI / 2; // Face left
    }
  }
  
  _setupCamera() {
    // If environment has camera settings, use those
    if (this.environment && this.environment.getCameraSettings()) {
      const settings = this.environment.getCameraSettings();
      this.camera.position.copy(settings.position);
      this.camera.lookAt(settings.lookAt);
    } else {
      // Default camera position for battle
      this.camera.position.set(0, 10, 20);
      this.camera.lookAt(0, 5, 0);
    }
  }
  
  _setupControls() {
    // Add keyboard and mouse event listeners
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('click', this._onClick);
    
    // Reset control state
    for (const key in this.controls) {
      this.controls[key] = false;
    }
  }
  
  _removeControls() {
    // Remove event listeners
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('click', this._onClick);
  }
  
  _onKeyDown(event) {
    if (!this.isGameActive) return;
    
    switch(event.code) {
      case 'KeyW':
        this.controls.moveForward = true;
        break;
      case 'KeyS':
        this.controls.moveBackward = true;
        break;
      case 'KeyA':
        this.controls.moveLeft = true;
        break;
      case 'KeyD':
        this.controls.moveRight = true;
        break;
      case 'Space':
        this.controls.jump = true;
        if (this.player && !this.player.isJumping) {
          this.player.jump();
        }
        break;
      case 'KeyE':
        this.controls.attack = true;
        this.executePlayerAction('basicAttack');
        break;
      case 'KeyQ':
        this.controls.block = true;
        if (this.player) {
          this.player.block();
        }
        break;
      case 'Digit1':
        this.controls.skill1 = true;
        this.executePlayerAction('skill', { skillIndex: 0 });
        break;
      case 'Digit2':
        this.controls.skill2 = true;
        this.executePlayerAction('skill', { skillIndex: 1 });
        break;
      case 'Digit3':
        this.controls.skill3 = true;
        this.executePlayerAction('skill', { skillIndex: 2 });
        break;
    }
  }
  
  _onKeyUp(event) {
    if (!this.isGameActive) return;
    
    switch(event.code) {
      case 'KeyW':
        this.controls.moveForward = false;
        break;
      case 'KeyS':
        this.controls.moveBackward = false;
        break;
      case 'KeyA':
        this.controls.moveLeft = false;
        break;
      case 'KeyD':
        this.controls.moveRight = false;
        break;
      case 'Space':
        this.controls.jump = false;
        break;
      case 'KeyE':
        this.controls.attack = false;
        break;
      case 'KeyQ':
        this.controls.block = false;
        if (this.player) {
          this.player.stopBlocking();
        }
        break;
      case 'Digit1':
        this.controls.skill1 = false;
        break;
      case 'Digit2':
        this.controls.skill2 = false;
        break;
      case 'Digit3':
        this.controls.skill3 = false;
        break;
    }
  }
  
  _onClick(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      // Handle click on object
      // This could be used for selecting targets in a more complex game
    }
  }
  
  _updatePlayerControls(delta) {
    if (!this.player) return;
    
    // Movement direction
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (this.controls.moveForward) moveDirection.z -= 1;
    if (this.controls.moveBackward) moveDirection.z += 1;
    if (this.controls.moveLeft) moveDirection.x -= 1;
    if (this.controls.moveRight) moveDirection.x += 1;
    
    // Apply movement if direction is not zero
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      this.player.move(moveDirection);
    } else {
      this.player.stopMoving();
    }
    
    // Make the player face the enemy
    if (this.enemy) {
      const direction = new THREE.Vector3().subVectors(this.enemy.position, this.player.position);
      if (direction.length() > 0.1) {
        const angle = Math.atan2(direction.x, direction.z);
        this.player.rotation.y = angle;
      }
    }
  }
  
  _updateEnemyAI(delta) {
    if (!this.enemy || !this.player) return;
    
    // Check if it's time for the next AI action
    const now = Date.now() / 1000;
    if (now < this.enemyAI.nextActionTime) return;
    
    // Set next action time
    this.enemyAI.nextActionTime = now + this.enemyAI.actionCooldown * (0.5 + Math.random());
    
    // Make the enemy face the player
    const direction = new THREE.Vector3().subVectors(this.player.position, this.enemy.position);
    if (direction.length() > 0.1) {
      const angle = Math.atan2(direction.x, direction.z);
      this.enemy.rotation.y = angle;
    }
    
    // Distance to player
    const distanceToPlayer = this.enemy.position.distanceTo(this.player.position);
    
    // Decide action based on distance and probabilities
    const rand = Math.random();
    
    if (distanceToPlayer > 7) {
      // Too far, move closer
      this._enemyMove(direction.normalize(), delta);
    } else if (distanceToPlayer < 3) {
      // Too close, move away
      this._enemyMove(direction.normalize().negate(), delta);
    } else {
      // Good fighting distance
      if (rand < this.enemyAI.actionProbabilities.move) {
        // Choose random movement
        const moveRand = Math.random();
        if (moveRand < 0.4) {
          // Move toward player
          this._enemyMove(direction.normalize(), delta);
        } else if (moveRand < 0.8) {
          // Move away from player
          this._enemyMove(direction.normalize().negate(), delta);
        } else {
          // Strafe
          const strafeDir = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
          this._enemyMove(Math.random() < 0.5 ? strafeDir : strafeDir.negate(), delta);
        }
      } else if (rand < this.enemyAI.actionProbabilities.move + this.enemyAI.actionProbabilities.attack) {
        // Attack
        this._enemyAttack();
      } else {
        // Use a skill
        this._enemyUseSkill();
      }
    }
  }
  
  _enemyMove(direction, delta) {
    if (!this.enemy) return;
    
    this.enemy.move(direction);
    
    // Stop movement after a random time
    setTimeout(() => {
      if (this.enemy) {
        this.enemy.stopMoving();
      }
    }, 500 + Math.random() * 1000);
  }
  
  _enemyAttack() {
    if (!this.enemy) return;
    
    const damage = this.enemy.attack();
    
    // Check if attack hits player (basic distance check)
    if (this.player) {
      const distance = this.enemy.position.distanceTo(this.player.position);
      if (distance < 4) {
        // Apply damage after animation delay
        setTimeout(() => {
          if (this.player && !this.player.isBlocking) {
            const healthBefore = this.player.health;
            this.player.takeDamage(damage);
            const damageTaken = healthBefore - this.player.health;
            
            // Update stats
            this.gameStats.damageTaken += damageTaken;
          }
        }, 300);
      }
    }
  }
  
  _enemyUseSkill() {
    if (!this.enemy || !this.enemy.skills || this.enemy.skills.length === 0) return;
    
    // Choose a random skill
    const skillIndex = Math.floor(Math.random() * this.enemy.skills.length);
    
    // Use skill
    this.enemy.useSkill(skillIndex, this.player);
  }
  
  _checkCollisions() {
    if (!this.player || !this.enemy) return;
    
    // Check collision between player and enemy
    const isColliding = this.player.checkCollision(this.enemy);
    
    if (isColliding) {
      // Push characters apart slightly to prevent overlapping
      const pushDirection = new THREE.Vector3().subVectors(this.player.position, this.enemy.position).normalize();
      this.player.position.add(pushDirection.clone().multiplyScalar(0.1));
      this.enemy.position.add(pushDirection.clone().multiplyScalar(-0.1));
    }
  }
  
  _checkGameEndConditions() {
    if (!this.player || !this.enemy) return;
    
    // Check if player or enemy health is zero
    if (this.player.health <= 0 || this.enemy.health <= 0) {
      // End game
      this.isGameActive = false;
      this.gameStats.endTime = Date.now();
      
      // Show game over menu
      this._showGameOverMenu(this.player.health > 0);
    }
  }
  
  _showGameOverMenu(isVictory) {
    // Calculate game statistics
    const stats = {
      duration: Math.floor((this.gameStats.endTime - this.gameStats.startTime) / 1000),
      damageDealt: Math.floor(this.gameStats.damageDealt),
      damageTaken: Math.floor(this.gameStats.damageTaken),
      skillsUsed: this.gameStats.skillsUsed
    };
    
    // Create menu if needed
    if (!this.menu) {
      this.menu = new Menu(this.game.uiContainer, this.game);
    }
    
    // Hide HUD
    if (this.hud) {
      this.hud.hide();
    }
    
    // Show game over screen
    this.menu.showGameOverScreen(isVictory, stats);
  }
  
  executePlayerAction(action, params = {}) {
    if (!this.player || !this.enemy || !this.isGameActive) return;
    
    switch(action) {
      case 'basicAttack':
        // Perform basic attack
        const damage = this.player.attack();
        
        // Check if attack hits enemy (basic distance check)
        const distance = this.player.position.distanceTo(this.enemy.position);
        if (distance < 4) {
          // Apply damage after animation delay
          setTimeout(() => {
            if (this.enemy && this.isGameActive) {
              const healthBefore = this.enemy.health;
              this.enemy.takeDamage(damage);
              const damageDealt = healthBefore - this.enemy.health;
              
              // Update stats
              this.gameStats.damageDealt += damageDealt;
            }
          }, 300);
        }
        break;
        
      case 'skill':
        // Use skill
        if (params.skillIndex !== undefined && this.player.skills && params.skillIndex < this.player.skills.length) {
          const success = this.player.useSkill(params.skillIndex, this.enemy);
          if (success) {
            this.gameStats.skillsUsed++;
          }
        }
        break;
    }
  }
  
  getThreeScene() {
    return this.scene;
  }
  
  getCamera() {
    return this.camera;
  }
  
  getAssetsToLoad() {
    return this.assetsToLoad;
  }
  
  loadAsset(asset, onLoaded) {
    switch(asset.type) {
      case 'model':
      case 'texture':
        // These will be loaded by the characters and environments
        if (onLoaded) onLoaded();
        break;
        
      default:
        console.warn(`Unknown asset type: ${asset.type}`);
        if (onLoaded) onLoaded();
    }
  }
  
  onResize() {
    // Update camera aspect ratio
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }
  
  dispose() {
    // Clean up resources
    
    // Remove player
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    
    // Remove enemy
    if (this.enemy) {
      this.enemy.dispose();
      this.enemy = null;
    }
    
    // Remove environment
    if (this.environment) {
      this.environment.dispose();
      this.environment = null;
    }
    
    // Remove event listeners
    this._removeControls();
  }
} 