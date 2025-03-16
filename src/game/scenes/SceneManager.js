import * as THREE from 'three';
import { LoadingScene } from './LoadingScene.js';
import { MainMenuScene } from './MainMenuScene.js';
import { GameScene } from './GameScene.js';

export class SceneManager {
  constructor(game, renderer) {
    this.game = game;
    this.renderer = renderer;
    
    // Initialize scenes
    this.scenes = {
      loading: new LoadingScene(game),
      mainMenu: new MainMenuScene(game),
      game: new GameScene(game)
    };
    
    // Current active scene
    this.activeScene = null;
    this.previousScene = null;
    
    // Transition effects
    this.isTransitioning = false;
    this.transitionTime = 0;
    this.transitionDuration = 0.5; // seconds
    this.transitionCallback = null;
    
    // Create transition overlay
    this._createTransitionOverlay();
  }
  
  init() {
    console.log("SceneManager init - starting with loading scene");
    
    // Set initial scene to loading
    this.changeScene('loading');
    
    // Get assets to load
    const assetsToLoad = [
      ...this.scenes.mainMenu.getAssetsToLoad() || [],
      ...this.scenes.game.getAssetsToLoad() || []
    ];
    
    console.log("Assets to load:", assetsToLoad.length);
    
    // Enter loading scene with assets
    const finalAssets = this.scenes.loading.enter(assetsToLoad);
    
    // Start loading assets
    this._loadAssets(finalAssets, () => {
      // When all assets are loaded, transition to main menu
      console.log("All assets loaded - transitioning to main menu");
      this.changeScene('mainMenu');
    });
  }
  
  update(delta) {
    // Update transition effect
    if (this.isTransitioning) {
      this.transitionTime += delta;
      
      // Calculate transition progress
      const progress = Math.min(this.transitionTime / this.transitionDuration, 1);
      
      if (this.transitionTime < this.transitionDuration) {
        // Fade out phase
        this.transitionOverlay.style.opacity = progress.toString();
      } else if (this.transitionTime < this.transitionDuration * 2) {
        // Execute callback at midpoint (scene change)
        if (this.transitionCallback && progress >= 1) {
          this.transitionCallback();
          this.transitionCallback = null;
        }
        
        // Fade in phase
        this.transitionOverlay.style.opacity = (2 - progress).toString();
      } else {
        // Transition complete
        this.isTransitioning = false;
        this.transitionOverlay.style.opacity = '0';
        this.transitionOverlay.style.pointerEvents = 'none';
      }
    }
    
    // Update active scene
    if (this.activeScene && !this.isTransitioning) {
      this.activeScene.update(delta);
    }
  }
  
  render() {
    if (!this.activeScene) return;
    
    // Get current scene and camera
    const scene = this.activeScene.getThreeScene();
    const camera = this.activeScene.getCamera();
    
    // Render scene
    if (scene && camera) {
      this.renderer.render(scene, camera);
    }
  }
  
  changeScene(sceneName, options = {}) {
    // Skip if already on this scene
    if (this.activeScene === this.scenes[sceneName]) return;
    
    // Store previous scene
    this.previousScene = this.activeScene;
    
    // Set transition parameters
    this.isTransitioning = true;
    this.transitionTime = 0;
    this.transitionDuration = options.duration || 0.5;
    
    // Show transition overlay
    this.transitionOverlay.style.pointerEvents = 'all';
    
    // Set callback to change scene at midpoint of transition
    this.transitionCallback = () => {
      // Exit previous scene
      if (this.previousScene) {
        this.previousScene.exit();
      }
      
      // Set new active scene
      this.activeScene = this.scenes[sceneName];
      
      // Enter new scene
      if (this.activeScene) {
        if (sceneName === 'game' && options.setupOptions) {
          // Setup game scene with character and environment
          this.activeScene.enter();
          this.activeScene.setupFight(
            options.setupOptions.characterId,
            options.setupOptions.environmentId
          );
        } else {
          // Regular scene entry
          this.activeScene.enter();
        }
      }
    };
  }
  
  onResize() {
    // Resize active scene
    if (this.activeScene && typeof this.activeScene.onResize === 'function') {
      this.activeScene.onResize();
    }
  }
  
  _createTransitionOverlay() {
    // Create transition overlay element
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'transition-overlay';
    this.transitionOverlay.style.position = 'absolute';
    this.transitionOverlay.style.top = '0';
    this.transitionOverlay.style.left = '0';
    this.transitionOverlay.style.width = '100%';
    this.transitionOverlay.style.height = '100%';
    this.transitionOverlay.style.backgroundColor = '#000';
    this.transitionOverlay.style.opacity = '0';
    this.transitionOverlay.style.transition = 'none';
    this.transitionOverlay.style.pointerEvents = 'none';
    this.transitionOverlay.style.zIndex = '10000';
    
    // Add to UI container
    this.game.uiContainer.appendChild(this.transitionOverlay);
  }
  
  _loadAssets(assets, onComplete) {
    let loadedCount = 0;
    
    // If no assets to load, complete immediately
    if (!assets || assets.length === 0) {
      console.log("No assets to load, completing immediately");
      if (onComplete) onComplete();
      return;
    }
    
    console.log(`Starting to load ${assets.length} assets`);
    
    // Load each asset
    assets.forEach(asset => {
      const onAssetLoaded = () => {
        loadedCount++;
        console.log(`Asset loaded: ${loadedCount}/${assets.length}`);
        
        // Update loading progress
        const isComplete = this.scenes.loading.onAssetLoaded();
        
        // Check if all assets are loaded
        if (isComplete && onComplete) {
          console.log("All assets completed loading");
          onComplete();
        }
      };
      
      // Load asset in appropriate scene
      if (asset.type === 'model' || asset.type === 'texture') {
        // Load models and textures when they are needed in respective scenes
        onAssetLoaded();
      } else {
        // Load other assets directly
        this.scenes.game.loadAsset(asset, onAssetLoaded);
      }
    });
  }
  
  dispose() {
    // Dispose all scenes
    Object.values(this.scenes).forEach(scene => {
      if (scene && typeof scene.dispose === 'function') {
        scene.dispose();
      }
    });
    
    // Remove transition overlay
    if (this.transitionOverlay && this.transitionOverlay.parentNode) {
      this.transitionOverlay.parentNode.removeChild(this.transitionOverlay);
    }
  }
} 