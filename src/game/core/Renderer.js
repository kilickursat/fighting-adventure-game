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
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }
  
  getThreeRenderer() {
    return this.renderer;
  }
  
  setCamera(camera) {
    if (camera) {
      this.camera = camera;
    }
  }
  
  setScene(scene) {
    if (scene) {
      this.scene = scene;
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
  
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.resize);
    
    // Dispose renderer
    this.renderer.dispose();
    
    // Remove canvas from container
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
} 