import * as THREE from 'three';

export class Environment {
  constructor(options = {}) {
    // Environment properties
    this.name = options.name || 'Environment';
    this.modelPath = options.modelPath || null;
    
    // THREE.js objects
    this.scene = new THREE.Scene();
    this.objects = [];
    
    // Lighting
    this.lights = [];
    
    // Physics objects (for collision)
    this.colliders = [];
    
    // Background
    this.backgroundTexture = options.backgroundTexture || null;
    
    // Environment size
    this.size = options.size || { width: 50, height: 20, depth: 50 };
    
    // Boundaries for characters
    this.boundaries = {
      minX: -this.size.width / 2,
      maxX: this.size.width / 2,
      minY: 0,
      maxY: this.size.height,
      minZ: -this.size.depth / 2,
      maxZ: this.size.depth / 2
    };
    
    // Camera settings
    this.cameraSettings = options.cameraSettings || {
      position: new THREE.Vector3(0, 10, 20),
      lookAt: new THREE.Vector3(0, 0, 0)
    };
  }
  
  load(loadingManager, onLoaded) {
    // Create scene basics
    this._setupLighting();
    this._setupGround();
    
    // Load environment model if provided
    if (this.modelPath) {
      const loader = new THREE.GLTFLoader(loadingManager);
      loader.load(
        this.modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          
          this.scene.add(model);
          this.objects.push(model);
          
          // Setup physics colliders
          this._setupColliders(model);
          
          if (onLoaded) onLoaded();
        },
        undefined,
        (error) => {
          console.error(`Error loading environment model: ${error}`);
          if (onLoaded) onLoaded();
        }
      );
    } else {
      // Create basic environment if no model is provided
      this._setupBasicEnvironment();
      if (onLoaded) onLoaded();
    }
    
    // Set background if provided
    if (this.backgroundTexture) {
      const textureLoader = new THREE.TextureLoader(loadingManager);
      textureLoader.load(
        this.backgroundTexture,
        (texture) => {
          this.scene.background = texture;
        }
      );
    } else {
      // Set default background color
      this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    }
  }
  
  _setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
  }
  
  _setupGround() {
    // Create a basic ground plane
    const groundGeometry = new THREE.PlaneGeometry(this.size.width, this.size.depth);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    
    this.scene.add(ground);
    this.objects.push(ground);
    
    // Add ground as a collider
    this.colliders.push({
      type: 'plane',
      normal: new THREE.Vector3(0, 1, 0),
      constant: 0
    });
  }
  
  _setupBasicEnvironment() {
    // Override in subclasses to create a custom environment
    // This is a fallback when no model is provided
  }
  
  _setupColliders(model) {
    // Create colliders based on the model
    // In a real game, you'd want to extract collision information from the model
    
    // For now, just create a simple boundary
    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);
    
    // Update boundaries based on actual model size
    this.boundaries = {
      minX: bounds.min.x,
      maxX: bounds.max.x,
      minY: bounds.min.y,
      maxY: bounds.max.y,
      minZ: bounds.min.z,
      maxZ: bounds.max.z
    };
    
    // Add box collider for the entire model
    this.colliders.push({
      type: 'box',
      min: bounds.min.clone(),
      max: bounds.max.clone()
    });
  }
  
  update(delta) {
    // Update any animated elements in the environment
    // Override in subclasses for specific update logic
  }
  
  getScene() {
    return this.scene;
  }
  
  getCameraSettings() {
    return this.cameraSettings;
  }
  
  getBoundaries() {
    return this.boundaries;
  }
  
  getColliders() {
    return this.colliders;
  }
  
  checkBoundaries(position) {
    // Check if position is within the environment boundaries
    // Return a corrected position if needed
    const correctedPosition = position.clone();
    
    if (position.x < this.boundaries.minX) correctedPosition.x = this.boundaries.minX;
    if (position.x > this.boundaries.maxX) correctedPosition.x = this.boundaries.maxX;
    if (position.y < this.boundaries.minY) correctedPosition.y = this.boundaries.minY;
    if (position.y > this.boundaries.maxY) correctedPosition.y = this.boundaries.maxY;
    if (position.z < this.boundaries.minZ) correctedPosition.z = this.boundaries.minZ;
    if (position.z > this.boundaries.maxZ) correctedPosition.z = this.boundaries.maxZ;
    
    return correctedPosition;
  }
  
  dispose() {
    // Clean up resources
    this.objects.forEach(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
      
      this.scene.remove(object);
    });
    
    this.lights.forEach(light => {
      this.scene.remove(light);
    });
    
    this.objects = [];
    this.lights = [];
    this.colliders = [];
  }
} 