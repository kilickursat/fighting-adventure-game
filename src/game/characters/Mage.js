import { Character } from './Character.js';
import * as THREE from 'three';

export class Mage extends Character {
  constructor(options = {}) {
    // Set mage-specific default properties
    super({
      name: 'Mage',
      health: 80,
      maxHealth: 80,
      attackPower: 20,
      defense: 3,
      speed: 6,
      modelPath: '/assets/models/mage.glb',
      texturePath: '/assets/textures/mage_texture.png',
      ...options
    });
    
    // Mage-specific properties
    this.mana = 100;
    this.maxMana = 100;
    this.manaRegen = 2; // Mana per second
    
    // Define skills
    this.skills = [
      {
        name: 'Fireball',
        description: 'Launch a fireball that deals high damage',
        cost: 25, // mana cost
        cooldown: 2, // seconds
        lastUsed: 0,
        execute: (target) => this._castFireball(target)
      },
      {
        name: 'Ice Barrier',
        description: 'Create a shield that reduces incoming damage',
        cost: 40,
        cooldown: 10,
        lastUsed: 0,
        execute: () => this._castIceBarrier()
      },
      {
        name: 'Lightning Storm',
        description: 'Call down lightning to damage all enemies in an area',
        cost: 75,
        cooldown: 15,
        lastUsed: 0,
        execute: (targets) => this._castLightningStorm(targets)
      }
    ];
  }
  
  update(delta) {
    super.update(delta);
    
    // Regenerate mana over time
    this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * delta);
    
    // Update skill cooldowns
    const now = Date.now() / 1000; // Current time in seconds
    this.skills.forEach(skill => {
      if (skill.lastUsed > 0 && now - skill.lastUsed >= skill.cooldown) {
        skill.lastUsed = 0; // Reset cooldown
      }
    });
  }
  
  attack(type = 'basic') {
    // Basic attack for mage is a magical bolt
    if (type === 'basic') {
      // Custom magical attack implementation
      if (this.isAttacking) return 0;
      
      this.isAttacking = true;
      
      // Play casting animation
      if (this.animations['cast']) {
        this.playAnimation('cast', {
          fadeTime: 0.1
        });
      } else {
        super.attack(type);
      }
      
      // Create magic bolt effect
      const bolt = this._createMagicBolt();
      
      // Reset attacking flag when animation completes
      setTimeout(() => {
        this.isAttacking = false;
        if (!this.isMoving && !this.isBlocking) {
          this.playAnimation('idle');
        }
      }, 800); // Adjust timing based on animation length
      
      return this.attackPower;
    }
    
    // Fallback to standard attack for other types
    return super.attack(type);
  }
  
  _createMagicBolt() {
    if (!this.group) return null;
    
    // Create a magical projectile
    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const bolt = new THREE.Mesh(geometry, material);
    
    // Position at character's hands
    bolt.position.set(0, 1.5, 0.5);
    
    // Add to scene (would typically be added to the game scene, not the character)
    this.group.add(bolt);
    
    // Create a point light for the bolt
    const light = new THREE.PointLight(0x00ffff, 1, 3);
    light.position.copy(bolt.position);
    bolt.add(light);
    
    // Animate the bolt
    const direction = new THREE.Vector3(0, 0, 1); // Forward
    direction.applyEuler(this.rotation);
    
    const speed = 10;
    const maxDistance = 20;
    const startPosition = this.position.clone();
    
    const animateBolt = () => {
      // Move bolt forward
      bolt.position.add(direction.clone().multiplyScalar(0.1 * speed));
      
      // Check if bolt has traveled too far
      const distance = bolt.position.distanceTo(startPosition);
      if (distance > maxDistance) {
        // Remove bolt
        this.group.remove(bolt);
        bolt.geometry.dispose();
        bolt.material.dispose();
        return;
      }
      
      // Continue animation
      requestAnimationFrame(animateBolt);
    };
    
    animateBolt();
    
    return bolt;
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
    
    // Check mana cost
    if (this.mana < skill.cost) {
      console.log(`Not enough mana to use ${skill.name}`);
      return false;
    }
    
    // Use mana
    this.mana -= skill.cost;
    
    // Execute skill
    skill.lastUsed = now;
    return skill.execute(target);
  }
  
  _castFireball(target) {
    if (!target) return false;
    
    // Play fireball casting animation
    this.playAnimation('cast_fire', {
      fadeTime: 0.1
    });
    
    this.isAttacking = true;
    
    // Create fireball effect
    const fireball = this._createFireballEffect(target);
    
    // Reset state after animation
    setTimeout(() => {
      this.isAttacking = false;
      if (!this.isMoving && !this.isBlocking) {
        this.playAnimation('idle');
      }
    }, 1000); // Adjust timing based on animation length
    
    return true;
  }
  
  _createFireballEffect(target) {
    if (!this.group || !target) return null;
    
    // Create a fireball projectile
    const geometry = new THREE.SphereGeometry(0.5, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.9
    });
    
    const fireball = new THREE.Mesh(geometry, material);
    
    // Position at character's hands
    fireball.position.set(0, 1.5, 0.5);
    
    // Add to scene (would typically be added to the game scene, not the character)
    this.group.add(fireball);
    
    // Create a point light for the fireball
    const light = new THREE.PointLight(0xff4500, 2, 5);
    light.position.copy(fireball.position);
    fireball.add(light);
    
    // Calculate direction to target
    const targetPosition = target.position.clone();
    const startPosition = this.position.clone().add(new THREE.Vector3(0, 1.5, 0.5));
    const direction = targetPosition.sub(startPosition).normalize();
    
    // Animate the fireball
    const speed = 15;
    let hasHit = false;
    
    const animateFireball = () => {
      if (hasHit) return;
      
      // Move fireball toward target
      fireball.position.add(direction.clone().multiplyScalar(0.1 * speed));
      
      // Add flame trail effect
      this._createFireTrail(fireball.position.clone());
      
      // Check for collision with target
      if (target && target.getGroup) {
        const fireballWorldPos = new THREE.Vector3();
        fireball.getWorldPosition(fireballWorldPos);
        
        const targetWorldPos = new THREE.Vector3();
        target.getGroup().getWorldPosition(targetWorldPos);
        
        const distance = fireballWorldPos.distanceTo(targetWorldPos);
        if (distance < 2) { // Hit threshold
          hasHit = true;
          
          // Create explosion effect
          this._createExplosionEffect(fireball.position.clone());
          
          // Apply damage to target
          if (typeof target.takeDamage === 'function') {
            target.takeDamage(this.attackPower * 2.5);
          }
          
          // Remove fireball
          this.group.remove(fireball);
          fireball.geometry.dispose();
          fireball.material.dispose();
          return;
        }
      }
      
      // Check if fireball has traveled too far
      const distance = fireball.position.distanceTo(new THREE.Vector3(0, 1.5, 0.5));
      if (distance > 30) {
        // Remove fireball
        this.group.remove(fireball);
        fireball.geometry.dispose();
        fireball.material.dispose();
        return;
      }
      
      // Continue animation
      requestAnimationFrame(animateFireball);
    };
    
    animateFireball();
    
    return fireball;
  }
  
  _createFireTrail(position) {
    // Create small particle for fire trail
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.7
    });
    
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    
    // Add small random offset
    particle.position.x += (Math.random() - 0.5) * 0.2;
    particle.position.y += (Math.random() - 0.5) * 0.2;
    particle.position.z += (Math.random() - 0.5) * 0.2;
    
    this.group.add(particle);
    
    // Animate and remove particle
    const startTime = Date.now();
    const duration = 300; // milliseconds
    
    const animateParticle = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        particle.material.opacity = 0.7 * (1 - elapsed / duration);
        requestAnimationFrame(animateParticle);
      } else {
        this.group.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
      }
    };
    
    animateParticle();
  }
  
  _createExplosionEffect(position) {
    // Create explosion particles
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff4500 : 0xff7700,
        transparent: true,
        opacity: 0.8
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      
      // Random direction
      const direction = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();
      
      particle.userData.direction = direction;
      particle.userData.speed = 1 + Math.random() * 2;
      
      this.group.add(particle);
      particles.push(particle);
    }
    
    // Add explosion light
    const light = new THREE.PointLight(0xff4500, 3, 8);
    light.position.copy(position);
    this.group.add(light);
    
    // Animate explosion
    const startTime = Date.now();
    const duration = 500; // milliseconds
    
    const animateExplosion = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        // Update particles
        particles.forEach(particle => {
          particle.position.add(
            particle.userData.direction.clone().multiplyScalar(0.05 * particle.userData.speed)
          );
          particle.material.opacity = 0.8 * (1 - elapsed / duration);
        });
        
        // Update light
        light.intensity = 3 * (1 - elapsed / duration);
        
        requestAnimationFrame(animateExplosion);
      } else {
        // Remove particles
        particles.forEach(particle => {
          this.group.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
        });
        
        // Remove light
        this.group.remove(light);
      }
    };
    
    animateExplosion();
  }
  
  _castIceBarrier() {
    // Play ice barrier casting animation
    this.playAnimation('cast_ice', {
      fadeTime: 0.1
    });
    
    // Create ice barrier effect
    const barrier = this._createIceBarrierEffect();
    
    // Increase defense temporarily
    const originalDefense = this.defense;
    this.defense *= 3;
    
    // Reset defense after duration
    setTimeout(() => {
      this.defense = originalDefense;
      // Remove barrier effect
      if (barrier) {
        this.group.remove(barrier);
        barrier.geometry.dispose();
        barrier.material.dispose();
      }
    }, 8000); // 8 second shield
    
    // Reset animation after casting
    setTimeout(() => {
      if (!this.isMoving && !this.isAttacking && !this.isBlocking) {
        this.playAnimation('idle');
      }
    }, 1000);
    
    return true;
  }
  
  _createIceBarrierEffect() {
    if (!this.group) return null;
    
    // Create ice barrier mesh
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });
    
    const barrier = new THREE.Mesh(geometry, material);
    this.group.add(barrier);
    
    // Add subtle animation to the barrier
    const animateBarrier = () => {
      barrier.rotation.y += 0.01;
      barrier.rotation.z += 0.005;
    };
    
    // Setup animation loop
    barrier.userData.animationInterval = setInterval(animateBarrier, 16);
    
    return barrier;
  }
  
  _castLightningStorm(targets) {
    if (!targets || !Array.isArray(targets)) return false;
    
    // Play lightning casting animation
    this.playAnimation('cast_lightning', {
      fadeTime: 0.1
    });
    
    this.isAttacking = true;
    
    // Create storm cloud effect
    const stormCloud = this._createStormCloudEffect();
    
    // Apply damage to all targets within range after delay
    setTimeout(() => {
      const damage = this.attackPower * 2;
      const hitRange = 8; // Units
      
      targets.forEach(target => {
        if (!target || typeof target.takeDamage !== 'function') return;
        
        // Check if target is in range
        const distance = this.position.distanceTo(target.position);
        if (distance <= hitRange) {
          // Create lightning bolt to this target
          this._createLightningBoltEffect(target.position.clone().add(new THREE.Vector3(0, 5, 0)), target.position.clone());
          
          // Apply damage with slight delay for visual effect
          setTimeout(() => {
            target.takeDamage(damage);
          }, Math.random() * 500); // Random delay up to 0.5 seconds
        }
      });
    }, 1000); // Delay before lightning strikes
    
    // Remove storm cloud after effect completes
    setTimeout(() => {
      if (stormCloud) {
        this.group.remove(stormCloud);
        stormCloud.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
    }, 3000);
    
    // Reset state after animation
    setTimeout(() => {
      this.isAttacking = false;
      if (!this.isMoving && !this.isBlocking) {
        this.playAnimation('idle');
      }
    }, 2000);
    
    return true;
  }
  
  _createStormCloudEffect() {
    if (!this.group) return null;
    
    // Create a group for the storm effect
    const stormGroup = new THREE.Group();
    stormGroup.position.y = 10; // Position above the battlefield
    
    // Create several cloud parts
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(2 + Math.random(), 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.7
      });
      
      const cloud = new THREE.Mesh(geometry, material);
      cloud.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 8
      );
      
      stormGroup.add(cloud);
    }
    
    // Add subtle blue point lights to simulate lightning inside clouds
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(0x0088ff, 1, 5);
      light.position.set(
        (Math.random() - 0.5) * 6,
        -1,
        (Math.random() - 0.5) * 6
      );
      
      // Make lights flicker
      const flickerLight = () => {
        light.intensity = 0.5 + Math.random() * 2;
      };
      
      setInterval(flickerLight, 100);
      stormGroup.add(light);
    }
    
    this.group.add(stormGroup);
    return stormGroup;
  }
  
  _createLightningBoltEffect(startPosition, endPosition) {
    if (!this.group) return;
    
    // Create lightning bolt using line segments
    const points = [];
    points.push(startPosition);
    
    // Generate zigzag pattern
    const segments = 6;
    const direction = endPosition.clone().sub(startPosition);
    const segmentLength = direction.length() / segments;
    
    const mainDirection = direction.clone().normalize();
    const perpendicular = new THREE.Vector3(-mainDirection.z, 0, mainDirection.x);
    
    for (let i = 1; i < segments; i++) {
      const ratio = i / segments;
      const pos = startPosition.clone().add(direction.clone().multiplyScalar(ratio));
      
      // Add random deviation perpendicular to main direction
      const deviation = (Math.random() - 0.5) * segmentLength * 0.75;
      pos.add(perpendicular.clone().multiplyScalar(deviation));
      
      points.push(pos);
    }
    
    points.push(endPosition);
    
    // Create geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create material
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 3
    });
    
    // Create line
    const lightning = new THREE.Line(geometry, material);
    
    // Add to scene
    this.group.add(lightning);
    
    // Create impact flash
    const flashGeometry = new THREE.SphereGeometry(1, 16, 16);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(endPosition);
    this.group.add(flash);
    
    // Add light at impact point
    const light = new THREE.PointLight(0x00ffff, 5, 10);
    light.position.copy(endPosition);
    this.group.add(light);
    
    // Animate and remove after short duration
    setTimeout(() => {
      this.group.remove(lightning);
      this.group.remove(flash);
      this.group.remove(light);
      
      geometry.dispose();
      material.dispose();
      flashGeometry.dispose();
      flashMaterial.dispose();
    }, 200);
  }
} 