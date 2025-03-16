import { Environment } from './Environment.js';
import * as THREE from 'three';

export class Arena extends Environment {
  constructor(options = {}) {
    // Set arena-specific default properties
    super({
      name: 'Arena',
      modelPath: '/assets/models/arena.glb',
      backgroundTexture: '/assets/textures/arena_texture.png',
      size: { width: 40, height: 20, depth: 40 },
      cameraSettings: {
        position: new THREE.Vector3(0, 12, 25),
        lookAt: new THREE.Vector3(0, 5, 0)
      },
      ...options
    });
    
    // Arena-specific properties
    this.torches = [];
    this.crowdSound = null;
  }
  
  _setupBasicEnvironment() {
    // Create a basic arena if no model is provided
    super._setupBasicEnvironment();
    
    // Add walls
    this._createWalls();
    
    // Add torches
    this._createTorches();
    
    // Add stands
    this._createStands();
  }
  
  _createWalls() {
    const wallHeight = 6;
    const wallThickness = 1;
    const wallColor = 0xcccccc;
    
    // Create walls material
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.7,
      metalness: 0.2
    });
    
    // Create four walls
    const walls = [];
    
    // North wall
    const northWallGeometry = new THREE.BoxGeometry(this.size.width, wallHeight, wallThickness);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -this.size.depth / 2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    
    // South wall
    const southWallGeometry = new THREE.BoxGeometry(this.size.width, wallHeight, wallThickness);
    const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, this.size.depth / 2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    
    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, this.size.depth);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(this.size.width / 2, wallHeight / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    
    // West wall
    const westWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, this.size.depth);
    const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
    westWall.position.set(-this.size.width / 2, wallHeight / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    
    walls.push(northWall, southWall, eastWall, westWall);
    
    // Add walls to scene
    walls.forEach(wall => {
      this.scene.add(wall);
      this.objects.push(wall);
    });
    
    // Add wall colliders
    this.colliders.push(
      {
        type: 'box',
        min: new THREE.Vector3(-this.size.width / 2, 0, -this.size.depth / 2 - wallThickness),
        max: new THREE.Vector3(this.size.width / 2, wallHeight, -this.size.depth / 2)
      },
      {
        type: 'box',
        min: new THREE.Vector3(-this.size.width / 2, 0, this.size.depth / 2),
        max: new THREE.Vector3(this.size.width / 2, wallHeight, this.size.depth / 2 + wallThickness)
      },
      {
        type: 'box',
        min: new THREE.Vector3(this.size.width / 2, 0, -this.size.depth / 2),
        max: new THREE.Vector3(this.size.width / 2 + wallThickness, wallHeight, this.size.depth / 2)
      },
      {
        type: 'box',
        min: new THREE.Vector3(-this.size.width / 2 - wallThickness, 0, -this.size.depth / 2),
        max: new THREE.Vector3(-this.size.width / 2, wallHeight, this.size.depth / 2)
      }
    );
  }
  
  _createTorches() {
    // Create torches at the corners of the arena
    const torchPositions = [
      { x: -this.size.width / 2 + 2, y: 5, z: -this.size.depth / 2 + 2 },
      { x: this.size.width / 2 - 2, y: 5, z: -this.size.depth / 2 + 2 },
      { x: -this.size.width / 2 + 2, y: 5, z: this.size.depth / 2 - 2 },
      { x: this.size.width / 2 - 2, y: 5, z: this.size.depth / 2 - 2 }
    ];
    
    torchPositions.forEach(position => {
      const torch = this._createTorch();
      torch.position.set(position.x, position.y, position.z);
      this.scene.add(torch);
      this.objects.push(torch);
      
      // Add point light for torch
      const light = new THREE.PointLight(0xff6600, 1, 15);
      light.position.set(position.x, position.y + 0.5, position.z);
      light.castShadow = true;
      this.scene.add(light);
      this.lights.push(light);
      
      // Store torch and light together for animation
      this.torches.push({
        torch,
        light,
        originalIntensity: light.intensity,
        flickerSpeed: 0.1 + Math.random() * 0.2
      });
    });
  }
  
  _createTorch() {
    const torchGroup = new THREE.Group();
    
    // Torch pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Brown
      roughness: 0.8
    });
    
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = -0.5;
    pole.castShadow = true;
    
    // Torch bowl
    const bowlGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.2, 16);
    const bowlMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      roughness: 0.5
    });
    
    const bowl = new THREE.Mesh(bowlGeometry, bowlMaterial);
    bowl.position.y = 0;
    bowl.castShadow = true;
    
    // Fire (using particle system in a real game)
    const fireGeometry = new THREE.ConeGeometry(0.25, 0.5, 16);
    const fireMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      transparent: true,
      opacity: 0.9
    });
    
    const fire = new THREE.Mesh(fireGeometry, fireMaterial);
    fire.position.y = 0.25;
    
    // Add to group
    torchGroup.add(pole);
    torchGroup.add(bowl);
    torchGroup.add(fire);
    
    return torchGroup;
  }
  
  _createStands() {
    // Create stands for the audience
    const standHeight = 8;
    const standDepth = 5;
    const standColor = 0x555555;
    
    // Create stands material
    const standMaterial = new THREE.MeshStandardMaterial({
      color: standColor,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Create four stands (outside the arena)
    const northStandGeometry = new THREE.BoxGeometry(this.size.width + 10, standHeight, standDepth);
    const northStand = new THREE.Mesh(northStandGeometry, standMaterial);
    northStand.position.set(0, standHeight / 2, -this.size.depth / 2 - standDepth / 2 - 1);
    northStand.castShadow = true;
    northStand.receiveShadow = true;
    
    const southStandGeometry = new THREE.BoxGeometry(this.size.width + 10, standHeight, standDepth);
    const southStand = new THREE.Mesh(southStandGeometry, standMaterial);
    southStand.position.set(0, standHeight / 2, this.size.depth / 2 + standDepth / 2 + 1);
    southStand.castShadow = true;
    southStand.receiveShadow = true;
    
    const eastStandGeometry = new THREE.BoxGeometry(standDepth, standHeight, this.size.depth + 10);
    const eastStand = new THREE.Mesh(eastStandGeometry, standMaterial);
    eastStand.position.set(this.size.width / 2 + standDepth / 2 + 1, standHeight / 2, 0);
    eastStand.castShadow = true;
    eastStand.receiveShadow = true;
    
    const westStandGeometry = new THREE.BoxGeometry(standDepth, standHeight, this.size.depth + 10);
    const westStand = new THREE.Mesh(westStandGeometry, standMaterial);
    westStand.position.set(-this.size.width / 2 - standDepth / 2 - 1, standHeight / 2, 0);
    westStand.castShadow = true;
    westStand.receiveShadow = true;
    
    // Add stands to scene
    this.scene.add(northStand);
    this.scene.add(southStand);
    this.scene.add(eastStand);
    this.scene.add(westStand);
    
    this.objects.push(northStand, southStand, eastStand, westStand);
    
    // Add crowd (simplified)
    this._createCrowd(northStand, southStand, eastStand, westStand);
  }
  
  _createCrowd(northStand, southStand, eastStand, westStand) {
    // In a real game, you'd create detailed crowd models
    // For simplicity, we'll create colorful blocks to represent the crowd
    
    const crowdSize = { width: 0.5, height: 0.8, depth: 0.5 };
    const crowdSpacing = 1;
    const crowdColors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00,
      0xff00ff, 0x00ffff, 0xffa500, 0x800080
    ];
    
    const createCrowdForStand = (stand, isHorizontal) => {
      const standBox = new THREE.Box3().setFromObject(stand);
      const standSize = new THREE.Vector3();
      standBox.getSize(standSize);
      
      const rows = 3;
      const rowHeight = 1.2;
      
      let cols, startX, startZ, stepX, stepZ;
      
      if (isHorizontal) {
        cols = Math.floor(standSize.x / crowdSpacing);
        startX = -standSize.x / 2 + crowdSpacing / 2;
        startZ = stand.position.z > 0 ? -1 : 1;
        stepX = crowdSpacing;
        stepZ = 0;
      } else {
        cols = Math.floor(standSize.z / crowdSpacing);
        startX = stand.position.x > 0 ? -1 : 1;
        startZ = -standSize.z / 2 + crowdSpacing / 2;
        stepX = 0;
        stepZ = crowdSpacing;
      }
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Skip some positions randomly for variation
          if (Math.random() < 0.3) continue;
          
          const color = crowdColors[Math.floor(Math.random() * crowdColors.length)];
          const material = new THREE.MeshBasicMaterial({ color });
          
          const geometry = new THREE.BoxGeometry(crowdSize.width, crowdSize.height, crowdSize.depth);
          const person = new THREE.Mesh(geometry, material);
          
          const xPos = stand.position.x + startX + col * stepX;
          const yPos = stand.position.y + standSize.y / 2 + row * rowHeight;
          const zPos = stand.position.z + startZ + col * stepZ;
          
          person.position.set(xPos, yPos, zPos);
          
          this.scene.add(person);
          this.objects.push(person);
        }
      }
    };
    
    createCrowdForStand(northStand, true);
    createCrowdForStand(southStand, true);
    createCrowdForStand(eastStand, false);
    createCrowdForStand(westStand, false);
  }
  
  update(delta) {
    super.update(delta);
    
    // Animate torches (flame flickering)
    this.torches.forEach(torch => {
      // Randomize light intensity for flickering effect
      const flickerAmount = Math.random() * 0.3;
      torch.light.intensity = torch.originalIntensity * (0.8 + flickerAmount);
      
      // Animate flame size
      if (torch.torch.children[2]) { // The fire cone
        const scale = 0.9 + Math.random() * 0.2;
        torch.torch.children[2].scale.set(scale, scale, scale);
      }
    });
  }
  
  playCrowdSound(intensity) {
    // In a real game, you'd play crowd sounds
    console.log(`Playing crowd sound with intensity: ${intensity}`);
  }
} 