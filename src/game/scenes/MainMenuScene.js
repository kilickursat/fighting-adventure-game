import * as THREE from 'three';
import { Menu } from '../ui/Menu.js';

export class MainMenuScene {
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
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // UI
    this.menu = null;
    
    // Scene objects
    this.models = [];
    this.lights = [];
    
    // Animation 
    this.rotatingObjects = [];
    
    // Background rotation speed
    this.rotationSpeed = 0.005;
    
    // Assets to preload
    this.assetsToLoad = [];
  }
  
  enter() {
    // Create menu
    this.menu = new Menu(this.game.uiContainer, this.game);
    
    // Show main menu
    this.menu.showMainMenu();
    
    // Setup scene if not already done
    if (this.scene.children.length === 0) {
      this._setupScene();
    }
  }
  
  exit() {
    // Hide menu
    if (this.menu) {
      this.menu.hide();
    }
  }
  
  update(delta) {
    // Rotate background elements
    this.rotatingObjects.forEach(obj => {
      obj.rotation.y += this.rotationSpeed * delta;
    });
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
    // This scene doesn't have complex asset loading requirements
    // It mostly uses primitives for the background
    if (onLoaded) onLoaded();
  }
  
  _setupScene() {
    // Set background color
    this.scene.background = new THREE.Color(0x000011);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
    
    // Add point lights for effect
    const colors = [0xff0000, 0x0000ff, 0xffff00];
    const positions = [
      new THREE.Vector3(-8, 5, 5),
      new THREE.Vector3(8, 5, 5),
      new THREE.Vector3(0, 10, -10)
    ];
    
    for (let i = 0; i < colors.length; i++) {
      const pointLight = new THREE.PointLight(colors[i], 1, 20);
      pointLight.position.copy(positions[i]);
      this.scene.add(pointLight);
      this.lights.push(pointLight);
    }
    
    // Create rotating background objects
    this._createBackgroundObjects();
    
    // Create ground plane
    this._createGround();
  }
  
  _createGround() {
    // Create a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    
    this.scene.add(ground);
  }
  
  _createBackgroundObjects() {
    // Create a set of floating objects to create an interesting background
    
    // Parameters for object creation
    const count = 30;
    const minDistance = 10;
    const maxDistance = 30;
    const minSize = 1;
    const maxSize = 3;
    const minHeight = 0;
    const maxHeight = 15;
    
    // Shapes to use
    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.ConeGeometry(0.5, 1, 8),
      new THREE.TorusGeometry(0.5, 0.2, 16, 32),
      new THREE.TetrahedronGeometry(0.5)
    ];
    
    // Materials
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.7, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x3333ff, roughness: 0.7, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x33ff33, roughness: 0.7, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xffff33, roughness: 0.7, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xff33ff, roughness: 0.7, metalness: 0.3 })
    ];
    
    // Create floating objects
    for (let i = 0; i < count; i++) {
      // Get random shape and material
      const geometry = geometries[Math.floor(Math.random() * geometries.length)].clone();
      const material = materials[Math.floor(Math.random() * materials.length)].clone();
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position
      const angle = Math.random() * Math.PI * 2;
      const distance = minDistance + Math.random() * (maxDistance - minDistance);
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = minHeight + Math.random() * (maxHeight - minHeight);
      
      mesh.position.set(x, y, z);
      
      // Random rotation
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      // Random scale
      const scale = minSize + Math.random() * (maxSize - minSize);
      mesh.scale.set(scale, scale, scale);
      
      // Enable shadows
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add to scene and tracking arrays
      this.scene.add(mesh);
      this.models.push(mesh);
      this.rotatingObjects.push(mesh);
    }
    
    // Add a large background torus that rotates slowly
    const bgTorusGeometry = new THREE.TorusGeometry(25, 1, 16, 100);
    const bgTorusMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const bgTorus = new THREE.Mesh(bgTorusGeometry, bgTorusMaterial);
    bgTorus.position.set(0, 5, 0);
    bgTorus.rotation.x = Math.PI / 2;
    
    this.scene.add(bgTorus);
    this.models.push(bgTorus);
    this.rotatingObjects.push(bgTorus);
    
    // Add a second, smaller torus at a different angle
    const bgTorus2Geometry = new THREE.TorusGeometry(20, 0.5, 16, 100);
    const bgTorus2Material = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const bgTorus2 = new THREE.Mesh(bgTorus2Geometry, bgTorus2Material);
    bgTorus2.position.set(0, 5, 0);
    bgTorus2.rotation.x = Math.PI / 3;
    
    this.scene.add(bgTorus2);
    this.models.push(bgTorus2);
    this.rotatingObjects.push(bgTorus2);
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
    this.models.forEach(model => {
      if (model.geometry) model.geometry.dispose();
      if (model.material) {
        if (Array.isArray(model.material)) {
          model.material.forEach(material => material.dispose());
        } else {
          model.material.dispose();
        }
      }
      this.scene.remove(model);
    });
    
    this.lights.forEach(light => {
      this.scene.remove(light);
    });
    
    this.models = [];
    this.lights = [];
    this.rotatingObjects = [];
  }
} 