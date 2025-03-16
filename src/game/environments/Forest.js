import { Environment } from './Environment.js';
import * as THREE from 'three';

export class Forest extends Environment {
  constructor(options = {}) {
    // Set forest-specific default properties
    super({
      name: 'Forest',
      modelPath: '/assets/models/forest.glb',
      backgroundTexture: '/assets/textures/forest_texture.png',
      size: { width: 60, height: 30, depth: 60 },
      cameraSettings: {
        position: new THREE.Vector3(0, 15, 30),
        lookAt: new THREE.Vector3(0, 5, 0)
      },
      ...options
    });
    
    // Forest-specific properties
    this.trees = [];
    this.rocks = [];
    this.wind = { speed: 0.2, direction: new THREE.Vector2(1, 0.5).normalize() };
    this.ambientSound = null;
    this.particleSystems = [];
  }
  
  _setupBasicEnvironment() {
    // Create a basic forest if no model is provided
    super._setupBasicEnvironment();
    
    // Override ground with forest floor
    this._createForestFloor();
    
    // Add trees
    this._createTrees();
    
    // Add rocks
    this._createRocks();
    
    // Add fog
    this._createFog();
    
    // Add particle system (leaves, dust, etc)
    this._createParticleSystems();
  }
  
  _createForestFloor() {
    // Remove existing ground
    if (this.objects.length > 0) {
      const groundIndex = this.objects.findIndex(obj => obj.isGround);
      if (groundIndex !== -1) {
        const ground = this.objects[groundIndex];
        this.scene.remove(ground);
        if (ground.geometry) ground.geometry.dispose();
        if (ground.material) ground.material.dispose();
        this.objects.splice(groundIndex, 1);
      }
    }
    
    // Create a forest floor with texture
    const groundGeometry = new THREE.PlaneGeometry(this.size.width, this.size.depth, 50, 50);
    
    // Add some simple vertex displacement for natural terrain
    const positionAttribute = groundGeometry.getAttribute('position');
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const z = positionAttribute.getZ(i);
      
      // Skip vertices at the edges to keep a flat boundary
      if (Math.abs(x) > this.size.width / 2 - 5 || Math.abs(z) > this.size.depth / 2 - 5) continue;
      
      // Add some noise-based height
      const noiseScale = 0.1;
      const heightScale = 0.8;
      const height = Math.sin(x * noiseScale) * Math.cos(z * noiseScale) * heightScale;
      
      positionAttribute.setY(i, height);
    }
    
    groundGeometry.computeVertexNormals();
    
    // Create material with a forest floor texture
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a5f0b, // Dark green
      roughness: 0.9,
      metalness: 0.0,
      flatShading: false
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    ground.isGround = true;
    
    this.scene.add(ground);
    this.objects.push(ground);
  }
  
  _createTrees() {
    // Create a set of trees scattered around the environment
    const treeCount = 30;
    const minDistance = 5; // Minimum distance between trees
    const treePositions = [];
    
    // Create different tree types
    const treeTypes = [
      this._createPineTree,
      this._createOakTree
    ];
    
    // Place trees randomly, ensuring they don't overlap
    for (let i = 0; i < treeCount; i++) {
      let position;
      let attempts = 0;
      let isValid = false;
      
      // Try to find a valid position
      while (!isValid && attempts < 20) {
        attempts++;
        
        // Generate random position within the environment
        const x = (Math.random() * this.size.width - this.size.width / 2) * 0.8;
        const z = (Math.random() * this.size.depth - this.size.depth / 2) * 0.8;
        position = new THREE.Vector3(x, 0, z);
        
        // Avoid placing trees too close to the center (fighting area)
        if (position.length() < 10) continue;
        
        // Check distance to other trees
        isValid = true;
        for (const existingPos of treePositions) {
          if (position.distanceTo(existingPos) < minDistance) {
            isValid = false;
            break;
          }
        }
      }
      
      if (isValid) {
        treePositions.push(position);
        
        // Create a random tree type
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
        const tree = treeType.call(this);
        
        // Random rotation and scale
        const rotation = Math.random() * Math.PI * 2;
        const scale = 0.8 + Math.random() * 0.4;
        
        tree.position.copy(position);
        tree.rotation.y = rotation;
        tree.scale.set(scale, scale, scale);
        
        this.scene.add(tree);
        this.objects.push(tree);
        this.trees.push({
          tree,
          initialPosition: position.clone(),
          windFactor: Math.random() * 0.3 + 0.1,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }
  
  _createPineTree() {
    const treeGroup = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Brown
      roughness: 0.9
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2.5;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    treeGroup.add(trunk);
    
    // Tree foliage (cones)
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e5931, // Dark green
      roughness: 0.8
    });
    
    const createFoliageCone = (radius, height, y) => {
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const cone = new THREE.Mesh(geometry, foliageMaterial);
      cone.position.y = y;
      cone.castShadow = true;
      return cone;
    };
    
    // Add several cones for the foliage layers
    treeGroup.add(createFoliageCone(2, 4, 4.5));
    treeGroup.add(createFoliageCone(1.7, 3, 6.5));
    treeGroup.add(createFoliageCone(1.3, 2.5, 8));
    
    return treeGroup;
  }
  
  _createOakTree() {
    const treeGroup = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Brown
      roughness: 0.9
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    treeGroup.add(trunk);
    
    // Tree foliage (sphere-like)
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x4f7942, // Forest green
      roughness: 0.8
    });
    
    // Main foliage
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 6);
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 7;
    foliage.scale.y = 0.8;
    foliage.castShadow = true;
    
    treeGroup.add(foliage);
    
    // Add some smaller foliage clusters
    for (let i = 0; i < 3; i++) {
      const clusterGeometry = new THREE.SphereGeometry(1.5, 6, 4);
      const cluster = new THREE.Mesh(clusterGeometry, foliageMaterial);
      
      const angle = (i / 3) * Math.PI * 2;
      const radius = 1.8;
      
      cluster.position.x = Math.cos(angle) * radius;
      cluster.position.z = Math.sin(angle) * radius;
      cluster.position.y = 6 + (Math.random() - 0.5) * 2;
      
      cluster.scale.set(0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
      cluster.castShadow = true;
      
      treeGroup.add(cluster);
    }
    
    return treeGroup;
  }
  
  _createRocks() {
    // Add some rocks scattered around
    const rockCount = 20;
    
    for (let i = 0; i < rockCount; i++) {
      // Random position
      const x = (Math.random() * this.size.width - this.size.width / 2) * 0.9;
      const z = (Math.random() * this.size.depth - this.size.depth / 2) * 0.9;
      
      // Avoid placing rocks at the center
      if (Math.sqrt(x * x + z * z) < 8) continue;
      
      const rock = this._createRock();
      
      // Random rotation and scale
      const rotation = Math.random() * Math.PI * 2;
      const scale = 0.5 + Math.random() * 1.5;
      
      rock.position.set(x, 0, z);
      rock.rotation.y = rotation;
      rock.scale.set(scale, scale, scale);
      
      this.scene.add(rock);
      this.objects.push(rock);
      this.rocks.push(rock);
      
      // Add rock as a collider
      const rockBox = new THREE.Box3().setFromObject(rock);
      this.colliders.push({
        type: 'box',
        min: rockBox.min,
        max: rockBox.max
      });
    }
  }
  
  _createRock() {
    // Create a simple rock using an icosahedron with some randomization
    const rockGroup = new THREE.Group();
    
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    
    // Randomize vertices a bit for more natural look
    const positionAttribute = geometry.getAttribute('position');
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      
      const noise = (Math.random() - 0.5) * 0.2;
      
      positionAttribute.setX(i, x * (1 + noise));
      positionAttribute.setY(i, y * (1 + noise));
      positionAttribute.setZ(i, z * (1 + noise));
    }
    
    geometry.computeVertexNormals();
    
    // Random gray color
    const grayValue = 0.4 + Math.random() * 0.3;
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(grayValue, grayValue, grayValue),
      roughness: 0.9,
      metalness: 0.1
    });
    
    const rock = new THREE.Mesh(geometry, rockMaterial);
    rock.position.y = 0.5;
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    rockGroup.add(rock);
    
    return rockGroup;
  }
  
  _createFog() {
    // Add fog to the scene for atmosphere
    this.scene.fog = new THREE.FogExp2(0x9dc183, 0.015);
  }
  
  _createParticleSystems() {
    // In a real game, you'd create a more sophisticated particle system
    // For simplicity, we'll create a basic leaf system
    
    // Create leaf particles
    const leafCount = 100;
    const leaves = [];
    
    const leafGeometry = new THREE.PlaneGeometry(0.2, 0.2);
    const leafMaterial = new THREE.MeshBasicMaterial({
      color: 0x81c14b,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const leafSystem = new THREE.Group();
    
    for (let i = 0; i < leafCount; i++) {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      
      // Random position within area
      leaf.position.set(
        (Math.random() - 0.5) * this.size.width,
        5 + Math.random() * 15,
        (Math.random() - 0.5) * this.size.depth
      );
      
      // Random rotation
      leaf.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      // Random movement parameters
      leaf.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        -0.2 - Math.random() * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      
      leaf.userData.rotationSpeed = new THREE.Vector3(
        Math.random() * 0.02,
        Math.random() * 0.02,
        Math.random() * 0.02
      );
      
      leaf.userData.oscillation = {
        amplitude: Math.random() * 0.2,
        frequency: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      };
      
      leafSystem.add(leaf);
      leaves.push(leaf);
    }
    
    this.scene.add(leafSystem);
    this.particleSystems.push({
      type: 'leaves',
      system: leafSystem,
      particles: leaves
    });
  }
  
  update(delta) {
    super.update(delta);
    
    // Update tree animation (wind effect)
    this.trees.forEach(({ tree, initialPosition, windFactor, phase }) => {
      // Skip if the tree doesn't have foliage parts
      if (tree.children.length <= 1) return;
      
      // Animate only the foliage parts (not the trunk)
      for (let i = 1; i < tree.children.length; i++) {
        const foliage = tree.children[i];
        
        // Apply wind effect
        const time = Date.now() / 1000;
        const windX = Math.sin(time + phase) * this.wind.speed * windFactor * this.wind.direction.x;
        const windZ = Math.cos(time + phase * 0.7) * this.wind.speed * windFactor * this.wind.direction.y;
        
        foliage.position.x = windX;
        foliage.position.z = windZ;
        
        // Also apply slight rotation
        foliage.rotation.x = windZ * 0.1;
        foliage.rotation.z = -windX * 0.1;
      }
    });
    
    // Update particle systems
    this.particleSystems.forEach(particleSystem => {
      if (particleSystem.type === 'leaves') {
        particleSystem.particles.forEach(leaf => {
          // Apply velocity
          leaf.position.add(leaf.userData.velocity.clone().multiplyScalar(delta));
          
          // Apply rotation
          leaf.rotation.x += leaf.userData.rotationSpeed.x;
          leaf.rotation.y += leaf.userData.rotationSpeed.y;
          leaf.rotation.z += leaf.userData.rotationSpeed.z;
          
          // Apply oscillation
          const oscData = leaf.userData.oscillation;
          const time = Date.now() / 1000;
          const oscillation = Math.sin(time * oscData.frequency + oscData.phase) * oscData.amplitude;
          
          leaf.position.x += oscillation * this.wind.direction.x * delta;
          leaf.position.z += oscillation * this.wind.direction.y * delta;
          
          // Reset if below ground
          if (leaf.position.y < 0) {
            leaf.position.y = 15 + Math.random() * 5;
            leaf.position.x = (Math.random() - 0.5) * this.size.width;
            leaf.position.z = (Math.random() - 0.5) * this.size.depth;
          }
        });
      }
    });
  }
  
  // Change wind parameters
  setWind(speed, direction) {
    this.wind.speed = speed;
    if (direction) {
      this.wind.direction.copy(direction).normalize();
    }
  }
  
  playAmbientSound() {
    // In a real game, you'd play forest ambient sounds
    console.log('Playing forest ambient sounds');
  }
} 