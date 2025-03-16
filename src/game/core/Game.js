import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { GameScene } from '../scenes/GameScene.js';

export class Game {
  constructor(options) {
    this.container = options.container;
    this.uiContainer = options.uiContainer;
    this.onProgress = options.onProgress || (() => {});
    this.onLoad = options.onLoad || (() => {});
    
    // Initialize renderer
    this.renderer = new Renderer(this.container);
    
    // Initialize input handler
    this.input = new Input();
    
    // Track scenes
    this.scenes = {};
    this.currentScene = null;
    
    // Game state
    this.selectedCharacter = null;
    this.selectedEnvironment = null;
    
    // Game clock
    this.clock = new THREE.Clock();
    
    // Flag for game loop
    this.isRunning = false;
    
    // Initialize asset loading
    this.assetsToLoad = 0;
    this.assetsLoaded = 0;
    
    // Setup scenes
    this._setupScenes();
    
    // Bind methods
    this._update = this._update.bind(this);
  }
  
  _setupScenes() {
    // Create scenes
    this.scenes.mainMenu = new MainMenuScene(this);
    this.scenes.game = new GameScene(this);
    
    // Register all assets to load
    for (const key in this.scenes) {
      const assets = this.scenes[key].getAssetsToLoad();
      this.assetsToLoad += assets.length;
    }
  }
  
  start() {
    // Start loading assets
    this._loadAssets();
    
    // Switch to main menu
    this.switchScene('mainMenu');
    
    // Start game loop
    this.isRunning = true;
    this._update();
  }
  
  _loadAssets() {
    // Iterate through all scenes and load their assets
    for (const key in this.scenes) {
      const scene = this.scenes[key];
      const assets = scene.getAssetsToLoad();
      
      assets.forEach(asset => {
        // Load asset based on type
        // When asset is loaded, call this._onAssetLoaded
        scene.loadAsset(asset, () => this._onAssetLoaded());
      });
    }
    
    // If no assets to load, trigger onLoad immediately
    if (this.assetsToLoad === 0) {
      this.onLoad();
    }
  }
  
  _onAssetLoaded() {
    this.assetsLoaded++;
    const percentage = Math.min(100, Math.round((this.assetsLoaded / this.assetsToLoad) * 100));
    this.onProgress(percentage);
    
    // Check if all assets are loaded
    if (this.assetsLoaded >= this.assetsToLoad) {
      this.onLoad();
    }
  }
  
  _update() {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const delta = this.clock.getDelta();
    
    // Update current scene
    if (this.currentScene) {
      this.currentScene.update(delta);
    }
    
    // Render
    this.renderer.render();
    
    // Request next frame
    requestAnimationFrame(this._update);
  }
  
  switchScene(sceneName) {
    // Exit current scene if it exists
    if (this.currentScene) {
      this.currentScene.exit();
    }
    
    // Set and enter new scene
    this.currentScene = this.scenes[sceneName];
    if (this.currentScene) {
      this.currentScene.enter();
      this.renderer.setScene(this.currentScene.getThreeScene());
    }
  }
  
  selectCharacter(character) {
    this.selectedCharacter = character;
  }
  
  selectEnvironment(environment) {
    this.selectedEnvironment = environment;
  }
  
  startFight() {
    if (!this.selectedCharacter || !this.selectedEnvironment) {
      console.error('Character or environment not selected');
      return;
    }
    
    // Set up game scene with selected character and environment
    this.scenes.game.setupFight(this.selectedCharacter, this.selectedEnvironment);
    
    // Switch to game scene
    this.switchScene('game');
  }
  
  resize() {
    // Handle window resize
    this.renderer.resize();
    
    // Notify current scene of resize
    if (this.currentScene && this.currentScene.onResize) {
      this.currentScene.onResize();
    }
  }
} 