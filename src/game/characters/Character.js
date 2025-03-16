import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Character {
  constructor(options = {}) {
    // Character properties
    this.name = options.name || 'Character';
    this.health = options.health || 100;
    this.maxHealth = options.maxHealth || 100;
    this.attackPower = options.attackPower || 10;
    this.defense = options.defense || 5;
    this.speed = options.speed || 5;
    
    // Movement and position
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isMoving = false;
    this.isAttacking = false;
    this.isBlocking = false;
    this.isJumping = false;
    
    // Model and animations
    this.model = null;
    this.animations = {};
    this.mixer = null;
    this.currentAction = null;
    
    // Collision
    this.hitbox = null;
    
    // Skills
    this.skills = [];
    
    // Model path
    this.modelPath = options.modelPath || null;
    this.texturePath = options.texturePath || null;
  }
  
  load(loadingManager, onLoaded) {
    if (!this.modelPath) {
      console.error(`No model path specified for character: ${this.name}`);
      if (onLoaded) onLoaded();
      return;
    }
    
    // Create a group to hold all character parts
    this.group = new THREE.Group();
    
    // Load character model using GLTFLoader
    const loader = new GLTFLoader(loadingManager);
    loader.load(
      this.modelPath,
      (gltf) => {
        this.model = gltf.scene;
        this.model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Apply texture if provided
            if (this.texturePath) {
              const textureLoader = new THREE.TextureLoader(loadingManager);
              textureLoader.load(this.texturePath, (texture) => {
                node.material.map = texture;
                node.material.needsUpdate = true;
              });
            }
          }
        });
        
        // Add model to group
        this.group.add(this.model);
        
        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          
          // Store all animations
          gltf.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.animations[clip.name] = action;
          });
          
          // Set default animation
          if (this.animations['idle']) {
            this.playAnimation('idle');
          }
        }
        
        // Create hitbox for collision detection
        this._createHitbox();
        
        if (onLoaded) onLoaded();
      },
      undefined,
      (error) => {
        console.error(`Error loading character model: ${error}`);
        if (onLoaded) onLoaded();
      }
    );
  }
  
  _createHitbox() {
    // Create a simple box hitbox
    // In a real game, you'd want to create a more accurate hitbox based on the model
    const box = new THREE.Box3().setFromObject(this.model);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Create visual hitbox (useful for debugging)
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    this.hitbox = new THREE.Mesh(geometry, material);
    this.hitbox.visible = false; // Hide by default
    
    // Position hitbox at center of model
    const center = new THREE.Vector3();
    box.getCenter(center);
    this.hitbox.position.copy(center.clone().sub(this.model.position));
    
    // Add hitbox to group
    this.group.add(this.hitbox);
  }
  
  playAnimation(name, options = {}) {
    const action = this.animations[name];
    if (!action) return;
    
    if (this.currentAction) {
      const fadeTime = options.fadeTime || 0.2;
      this.currentAction.fadeOut(fadeTime);
    }
    
    action.reset();
    action.fadeIn(options.fadeTime || 0.2);
    action.play();
    
    this.currentAction = action;
  }
  
  update(delta) {
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(delta);
    }
    
    // Apply velocity to position
    this.position.add(this.velocity.clone().multiplyScalar(delta));
    
    // Update group position and rotation
    if (this.group) {
      this.group.position.copy(this.position);
      this.group.rotation.copy(this.rotation);
    }
  }
  
  move(direction, speed) {
    // Set movement direction and speed
    this.velocity.copy(direction.normalize().multiplyScalar(speed || this.speed));
    
    // Play walking animation if not already playing
    if (!this.isMoving && !this.isAttacking && !this.isBlocking) {
      this.isMoving = true;
      this.playAnimation('walk');
    }
  }
  
  stopMoving() {
    // Stop movement
    this.velocity.set(0, 0, 0);
    
    // Play idle animation if not attacking or blocking
    if (this.isMoving && !this.isAttacking && !this.isBlocking) {
      this.isMoving = false;
      this.playAnimation('idle');
    }
  }
  
  attack(type = 'basic') {
    if (this.isAttacking) return;
    
    // Set attacking flag
    this.isAttacking = true;
    
    // Play attack animation
    const animationName = `attack_${type}`;
    if (this.animations[animationName]) {
      this.playAnimation(animationName, {
        fadeTime: 0.1
      });
      
      // Create attack effect or projectile if needed
      
      // Reset attacking flag when animation completes
      setTimeout(() => {
        this.isAttacking = false;
        if (!this.isMoving && !this.isBlocking) {
          this.playAnimation('idle');
        }
      }, 1000); // Adjust timing based on animation length
    }
    
    return this.attackPower;
  }
  
  block() {
    if (this.isAttacking) return;
    
    // Set blocking flag
    this.isBlocking = true;
    
    // Play block animation
    if (this.animations['block']) {
      this.playAnimation('block', {
        fadeTime: 0.1
      });
    }
  }
  
  stopBlocking() {
    if (!this.isBlocking) return;
    
    // Reset blocking flag
    this.isBlocking = false;
    
    // Play idle or walk animation
    if (this.isMoving) {
      this.playAnimation('walk');
    } else {
      this.playAnimation('idle');
    }
  }
  
  jump() {
    if (this.isJumping) return;
    
    // Set jumping flag
    this.isJumping = true;
    
    // Play jump animation
    if (this.animations['jump']) {
      this.playAnimation('jump', {
        fadeTime: 0.1
      });
    }
    
    // Simulate jump physics
    this.velocity.y = 10;
    
    // Reset jumping flag when landing
    setTimeout(() => {
      this.isJumping = false;
      if (!this.isAttacking && !this.isBlocking) {
        if (this.isMoving) {
          this.playAnimation('walk');
        } else {
          this.playAnimation('idle');
        }
      }
    }, 1000); // Adjust timing based on animation length
  }
  
  takeDamage(amount) {
    // Calculate actual damage based on defense
    const actualDamage = Math.max(1, amount - this.defense);
    
    // Reduce health
    this.health = Math.max(0, this.health - actualDamage);
    
    // Play hit animation
    if (this.animations['hit']) {
      this.playAnimation('hit', {
        fadeTime: 0.1
      });
    }
    
    // Check if dead
    if (this.health <= 0) {
      this.die();
    }
    
    return this.health;
  }
  
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health;
  }
  
  die() {
    // Play death animation
    if (this.animations['death']) {
      this.playAnimation('death', {
        fadeTime: 0.1
      });
    }
    
    // Disable character
    this.isMoving = false;
    this.isAttacking = false;
    this.isBlocking = false;
    this.isJumping = false;
    this.velocity.set(0, 0, 0);
  }
  
  getGroup() {
    return this.group;
  }
  
  checkCollision(otherCharacter) {
    if (!this.hitbox || !otherCharacter.hitbox) return false;
    
    // Convert hitboxes to world space Box3
    const box1 = new THREE.Box3().setFromObject(this.hitbox);
    const box2 = new THREE.Box3().setFromObject(otherCharacter.hitbox);
    
    // Check for intersection
    return box1.intersectsBox(box2);
  }
  
  dispose() {
    // Clean up resources
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    
    // Remove group from parent if needed
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
} 