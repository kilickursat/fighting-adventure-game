import { Character } from './Character.js';
import * as THREE from 'three';

export class Warrior extends Character {
  constructor(options = {}) {
    // Set warrior-specific default properties
    super({
      name: 'Warrior',
      health: 120,
      maxHealth: 120,
      attackPower: 15,
      defense: 8,
      speed: 4,
      modelPath: '/assets/models/warrior.glb',
      texturePath: '/assets/textures/warrior_texture.png',
      ...options
    });
    
    // Warrior-specific properties
    this.rage = 0;
    this.maxRage = 100;
    
    // Define skills
    this.skills = [
      {
        name: 'Heavy Strike',
        description: 'A powerful melee attack that deals 2x damage',
        cost: 30, // rage cost
        cooldown: 5, // seconds
        lastUsed: 0,
        execute: (target) => this._heavyStrike(target)
      },
      {
        name: 'Whirlwind',
        description: 'Spin and damage all nearby enemies',
        cost: 50,
        cooldown: 8,
        lastUsed: 0,
        execute: (targets) => this._whirlwind(targets)
      },
      {
        name: 'Battle Cry',
        description: 'Increase attack power temporarily',
        cost: 70,
        cooldown: 15,
        lastUsed: 0,
        execute: () => this._battleCry()
      }
    ];
  }
  
  update(delta) {
    super.update(delta);
    
    // Update skill cooldowns
    const now = Date.now() / 1000; // Current time in seconds
    this.skills.forEach(skill => {
      if (skill.lastUsed > 0 && now - skill.lastUsed >= skill.cooldown) {
        skill.lastUsed = 0; // Reset cooldown
      }
    });
  }
  
  attack(type = 'basic') {
    // Generate rage on attack
    this.rage = Math.min(this.maxRage, this.rage + 10);
    
    return super.attack(type);
  }
  
  takeDamage(amount) {
    // Generate rage when taking damage
    this.rage = Math.min(this.maxRage, this.rage + amount / 2);
    
    return super.takeDamage(amount);
  }
  
  useSkill(index, target) {
    if (index < 0 || index >= this.skills.length) {
      console.error(`Invalid skill index: ${index}`);
      return false;
    }
    
    const skill = this.skills[index];
    const now = Date.now() / 1000;
    
    // Check cooldown
    if (skill.lastUsed > 0 && now - skill.lastUsed < skill.cooldown) {
      console.log(`Skill ${skill.name} is on cooldown`);
      return false;
    }
    
    // Check rage cost
    if (this.rage < skill.cost) {
      console.log(`Not enough rage to use ${skill.name}`);
      return false;
    }
    
    // Use rage
    this.rage -= skill.cost;
    
    // Execute skill
    skill.lastUsed = now;
    return skill.execute(target);
  }
  
  _heavyStrike(target) {
    if (!target) return false;
    
    // Play heavy attack animation
    this.playAnimation('attack_heavy', {
      fadeTime: 0.1
    });
    
    this.isAttacking = true;
    
    // Deal double damage
    const damage = this.attackPower * 2;
    
    // Create visual effect
    this._createHeavyStrikeEffect();
    
    // Reset state after animation
    setTimeout(() => {
      this.isAttacking = false;
      if (!this.isMoving && !this.isBlocking) {
        this.playAnimation('idle');
      }
    }, 1200); // Adjust timing based on animation length
    
    // Apply damage to target after delay
    setTimeout(() => {
      if (target && typeof target.takeDamage === 'function') {
        target.takeDamage(damage);
      }
    }, 600); // Apply damage mid-animation
    
    return true;
  }
  
  _createHeavyStrikeEffect() {
    if (!this.group) return;
    
    // Create an effect for the heavy strike (e.g., a trail or impact)
    const geometry = new THREE.CylinderGeometry(0, 1, 3, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.7
    });
    
    const effect = new THREE.Mesh(geometry, material);
    
    // Position relative to warrior
    effect.position.set(0, 1, 2);
    effect.rotation.x = Math.PI / 2;
    
    this.group.add(effect);
    
    // Animate and remove effect
    const startTime = Date.now();
    const duration = 500; // milliseconds
    
    const animateEffect = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const scale = 1 + elapsed / duration;
        effect.scale.set(scale, scale, scale);
        effect.material.opacity = 0.7 * (1 - elapsed / duration);
        requestAnimationFrame(animateEffect);
      } else {
        this.group.remove(effect);
        effect.geometry.dispose();
        effect.material.dispose();
      }
    };
    
    animateEffect();
  }
  
  _whirlwind(targets) {
    if (!targets || !Array.isArray(targets)) return false;
    
    // Play whirlwind animation
    this.playAnimation('attack_spin', {
      fadeTime: 0.1
    });
    
    this.isAttacking = true;
    
    // Create visual effect
    this._createWhirlwindEffect();
    
    // Apply damage to all targets within range
    setTimeout(() => {
      const damage = this.attackPower * 1.5;
      const hitRange = 5; // Units
      
      targets.forEach(target => {
        if (!target || typeof target.takeDamage !== 'function') return;
        
        // Check if target is in range
        const distance = this.position.distanceTo(target.position);
        if (distance <= hitRange) {
          target.takeDamage(damage);
        }
      });
    }, 500); // Apply damage during animation
    
    // Reset state after animation
    setTimeout(() => {
      this.isAttacking = false;
      if (!this.isMoving && !this.isBlocking) {
        this.playAnimation('idle');
      }
    }, 1500); // Adjust timing based on animation length
    
    return true;
  }
  
  _createWhirlwindEffect() {
    if (!this.group) return;
    
    // Create a circular effect for whirlwind
    const geometry = new THREE.RingGeometry(0, 5, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    
    const effect = new THREE.Mesh(geometry, material);
    effect.rotation.x = Math.PI / 2;
    effect.position.y = 0.1; // Slightly above ground
    
    this.group.add(effect);
    
    // Animate and remove effect
    const startTime = Date.now();
    const duration = 1000; // milliseconds
    
    const animateEffect = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const scale = elapsed / duration * 1.5;
        effect.scale.set(scale, scale, scale);
        effect.rotation.z += 0.1; // Spin effect
        effect.material.opacity = 0.5 * (1 - elapsed / duration);
        requestAnimationFrame(animateEffect);
      } else {
        this.group.remove(effect);
        effect.geometry.dispose();
        effect.material.dispose();
      }
    };
    
    animateEffect();
  }
  
  _battleCry() {
    // Play battle cry animation
    this.playAnimation('special', {
      fadeTime: 0.1
    });
    
    // Create visual effect
    this._createBattleCryEffect();
    
    // Temporarily boost attack power
    const originalAttackPower = this.attackPower;
    this.attackPower *= 1.5;
    
    // Reset attack power after duration
    setTimeout(() => {
      this.attackPower = originalAttackPower;
    }, 10000); // 10 second boost
    
    // Reset state after animation
    setTimeout(() => {
      if (!this.isMoving && !this.isAttacking && !this.isBlocking) {
        this.playAnimation('idle');
      }
    }, 1200); // Adjust timing based on animation length
    
    return true;
  }
  
  _createBattleCryEffect() {
    if (!this.group) return;
    
    // Create an aura effect
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const effect = new THREE.Mesh(geometry, material);
    this.group.add(effect);
    
    // Animate the aura
    const pulseEffect = () => {
      const scale = 1 + 0.2 * Math.sin(Date.now() / 200);
      effect.scale.set(scale, scale, scale);
    };
    
    // Setup animation loop
    const intervalId = setInterval(pulseEffect, 16);
    
    // Remove effect after duration
    setTimeout(() => {
      clearInterval(intervalId);
      this.group.remove(effect);
      effect.geometry.dispose();
      effect.material.dispose();
    }, 10000); // Same duration as the buff
  }
} 