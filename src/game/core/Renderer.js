import * as THREE from 'three';

export class Renderer {
  constructor(container) {
    this.container = container;
    
    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Append renderer to container
    this.container.appendChild(this.renderer.domElement);
    
    // Create default camera
    this.camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Create default scene
    this.scene = new THREE.Scene();
    
    // Setup basic lighting
    this._setupLighting();
    
    // Add window resize event listener
    window.addEventListener('resize', this.resize.bind(this), false);
  }
  
  _setupLighting() {
    // Ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    this.scene.add(directionalLight);
  }
  
  setScene(scene) {
    if (scene) {
      this.scene = scene;
    }
  }
  
  setCamera(camera) {
    if (camera) {
      this.camera = camera;
    }
  }
  
  render() {
    // Render current scene with current camera
    this.renderer.render(this.scene, this.camera);
  }
  
  resize() {
    // Update camera aspect ratio
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
} 