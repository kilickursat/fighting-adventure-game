import * as THREE from 'three';

export class LoadingScene {
  constructor(game) {
    this.game = game;
    
    // Create loading scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
    
    // Create camera
    this.camera = new THREE.OrthographicCamera(
      -1, // left
      1, // right
      1, // top
      -1, // bottom
      0.1, // near
      10 // far
    );
    this.camera.position.z = 1;
    
    // Loading UI
    this.loadingUI = null;
    
    // Progress
    this.loadingProgress = {
      total: 0,
      loaded: 0,
      percentage: 0
    };
    
    // Animation
    this.objects = [];
    this.animationTime = 0;
    
    // Debug flag to help with debugging
    this.debug = true;
  }
  
  enter(assetsToLoad = []) {
    if (this.debug) console.log("LoadingScene - enter() called with", assetsToLoad.length, "assets");
    
    // Create loading UI
    this._createLoadingUI();
    
    // Reset progress
    this.loadingProgress = {
      total: Math.max(1, assetsToLoad.length), // Ensure at least 1 to avoid division by zero
      loaded: 0,
      percentage: 0
    };
    
    // Update UI
    this._updateLoadingUI();
    
    // Setup loading animation
    this._setupLoadingAnimation();
    
    if (this.debug) console.log("LoadingScene - initialized with progress:", this.loadingProgress);
    
    // Return the list of assets to load
    return assetsToLoad;
  }
  
  exit() {
    if (this.debug) console.log("LoadingScene - exit() called");
    
    // Remove loading UI
    if (this.loadingUI) {
      if (this.game.uiContainer.contains(this.loadingUI)) {
        this.game.uiContainer.removeChild(this.loadingUI);
      }
      this.loadingUI = null;
    }
    
    // Clean up animation objects
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.objects = [];
    
    if (this.debug) console.log("LoadingScene - exit complete");
  }
  
  update(delta) {
    // Update animation
    this.animationTime += delta;
    
    // Rotate loading objects
    this.objects.forEach((obj, index) => {
      obj.rotation.x = this.animationTime * (0.5 + index * 0.1);
      obj.rotation.y = this.animationTime * (0.3 + index * 0.05);
      
      // Pulse effect
      const scale = 0.8 + Math.sin(this.animationTime * 2 + index) * 0.2;
      obj.scale.set(scale, scale, scale);
    });
  }
  
  onAssetLoaded() {
    // Update progress
    this.loadingProgress.loaded++;
    this.loadingProgress.percentage = Math.min(100, (this.loadingProgress.loaded / this.loadingProgress.total) * 100);
    
    // Update UI
    this._updateLoadingUI();
    
    if (this.debug) console.log(`LoadingScene - Asset loaded: ${this.loadingProgress.loaded}/${this.loadingProgress.total} (${Math.floor(this.loadingProgress.percentage)}%)`);
    
    // Return true if all assets are loaded
    const isComplete = this.loadingProgress.loaded >= this.loadingProgress.total;
    
    // If complete, show 100% for a moment before returning
    if (isComplete) {
      if (this.debug) console.log("LoadingScene - All assets loaded, preparing to transition");
      this.loadingProgress.percentage = 100;
      this._updateLoadingUI();
    }
    
    return isComplete;
  }
  
  getThreeScene() {
    return this.scene;
  }
  
  getCamera() {
    return this.camera;
  }
  
  _createLoadingUI() {
    // Create loading UI container
    this.loadingUI = document.createElement('div');
    this.loadingUI.className = 'loading-ui';
    this.loadingUI.style.position = 'absolute';
    this.loadingUI.style.top = '0';
    this.loadingUI.style.left = '0';
    this.loadingUI.style.width = '100%';
    this.loadingUI.style.height = '100%';
    this.loadingUI.style.display = 'flex';
    this.loadingUI.style.flexDirection = 'column';
    this.loadingUI.style.justifyContent = 'center';
    this.loadingUI.style.alignItems = 'center';
    this.loadingUI.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.loadingUI.style.color = '#fff';
    this.loadingUI.style.fontFamily = 'Arial, sans-serif';
    this.loadingUI.style.zIndex = '1000';
    
    // Add game title
    const title = document.createElement('h1');
    title.textContent = 'Fighting Adventure';
    title.style.fontSize = '3rem';
    title.style.marginBottom = '2rem';
    title.style.textShadow = '0 0 10px #27c4ff';
    title.style.animation = 'pulse 2s infinite';
    this.loadingUI.appendChild(title);
    
    // Add loading bar container
    const barContainer = document.createElement('div');
    barContainer.style.width = '50%';
    barContainer.style.height = '20px';
    barContainer.style.backgroundColor = '#333';
    barContainer.style.borderRadius = '10px';
    barContainer.style.overflow = 'hidden';
    barContainer.style.margin = '1rem 0';
    this.loadingUI.appendChild(barContainer);
    
    // Add loading bar
    this.loadingBar = document.createElement('div');
    this.loadingBar.style.width = '0%';
    this.loadingBar.style.height = '100%';
    this.loadingBar.style.backgroundColor = '#27c4ff';
    this.loadingBar.style.transition = 'width 0.3s ease-out';
    barContainer.appendChild(this.loadingBar);
    
    // Add loading text
    this.loadingText = document.createElement('div');
    this.loadingText.textContent = 'Loading assets... 0%';
    this.loadingText.style.fontSize = '1.2rem';
    this.loadingText.style.margin = '1rem 0';
    this.loadingUI.appendChild(this.loadingText);
    
    // Add loading tip
    const tip = document.createElement('div');
    const tips = [
      'Press E to attack!',
      'Use Q to block incoming attacks!',
      'Press 1, 2, or 3 to use special skills!',
      'WASD keys control movement!',
      'Try both characters for different gameplay experiences!',
      'The Warrior excels at close combat!',
      'The Mage can cast powerful spells from a distance!'
    ];
    tip.textContent = 'TIP: ' + tips[Math.floor(Math.random() * tips.length)];
    tip.style.fontSize = '1rem';
    tip.style.marginTop = '2rem';
    tip.style.opacity = '0.7';
    tip.style.fontStyle = 'italic';
    this.loadingUI.appendChild(tip);
    
    // Add CSS animation for the title pulse
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    // Add to the UI container
    if (this.game.uiContainer) {
      this.game.uiContainer.appendChild(this.loadingUI);
      if (this.debug) console.log("LoadingScene - UI added to container");
    } else {
      console.error("LoadingScene - UI container not available");
    }
  }
  
  _updateLoadingUI() {
    if (!this.loadingUI) {
      if (this.debug) console.log("LoadingScene - No UI to update");
      return;
    }
    
    // Update loading bar
    this.loadingBar.style.width = `${this.loadingProgress.percentage}%`;
    
    // Update text
    this.loadingText.textContent = `Loading assets... ${Math.floor(this.loadingProgress.percentage)}%`;
    
    if (this.debug) console.log("LoadingScene - UI updated to", Math.floor(this.loadingProgress.percentage) + "%");
  }
  
  _setupLoadingAnimation() {
    // Clear previous objects
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    this.objects = [];
    
    // Create geometric shapes for the loading animation
    const geometries = [
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.TetrahedronGeometry(0.15),
      new THREE.OctahedronGeometry(0.15)
    ];
    
    // Create materials with different colors
    const colors = [0x27c4ff, 0xff5e3a, 0xffcc00, 0x7cff00];
    
    // Create and position the objects in a circle
    for (let i = 0; i < 4; i++) {
      const material = new THREE.MeshBasicMaterial({ color: colors[i], wireframe: true });
      const mesh = new THREE.Mesh(geometries[i], material);
      
      // Position in a circular pattern
      const angle = (i / 4) * Math.PI * 2;
      const radius = 0.4;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = Math.sin(angle) * radius;
      
      // Add to scene
      this.scene.add(mesh);
      this.objects.push(mesh);
    }
    
    if (this.debug) console.log("LoadingScene - Animation setup complete with", this.objects.length, "objects");
  }
  
  onResize() {
    // Resize orthographic camera to maintain aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    
    if (aspect > 1) {
      // Landscape
      this.camera.left = -aspect;
      this.camera.right = aspect;
      this.camera.top = 1;
      this.camera.bottom = -1;
    } else {
      // Portrait
      this.camera.left = -1;
      this.camera.right = 1;
      this.camera.top = 1 / aspect;
      this.camera.bottom = -1 / aspect;
    }
    
    this.camera.updateProjectionMatrix();
  }
  
  dispose() {
    // Clean up resources
    if (this.debug) console.log("LoadingScene - dispose() called");
    
    // Remove loading UI
    if (this.loadingUI && this.loadingUI.parentNode) {
      this.loadingUI.parentNode.removeChild(this.loadingUI);
    }
    
    // Clean up animation objects
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
  }
}
