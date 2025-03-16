import * as THREE from 'three';
import { Renderer } from './renderer/Renderer.js';
import { Input } from './input/Input.js';
import { SceneManager } from './scenes/SceneManager.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.isRunning = false;
    this.lastTime = 0;
    
    // Create UI container
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'ui-container';
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '0';
    this.uiContainer.style.left = '0';
    this.uiContainer.style.width = '100%';
    this.uiContainer.style.height = '100%';
    this.uiContainer.style.pointerEvents = 'none';
    this.container.appendChild(this.uiContainer);
    
    // Initialize systems
    this.renderer = new Renderer(container);
    this.input = new Input(container);
    
    // Initialize scene manager
    this.sceneManager = new SceneManager(this, this.renderer.getThreeRenderer());
    
    // Bind methods
    this._gameLoop = this._gameLoop.bind(this);
    this._onResize = this._onResize.bind(this);
    
    // Add event listeners
    window.addEventListener('resize', this._onResize, false);
    
    // Debug flag
    this.debug = {
      showFPS: false,
      showStats: false
    };
    
    // FPS counter
    this._createFPSCounter();
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    
    // Initialize scene manager
    this.sceneManager.init();
    
    // Start game loop
    requestAnimationFrame(this._gameLoop);
  }
  
  stop() {
    this.isRunning = false;
  }
  
  _gameLoop(time) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const delta = (time - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = time;
    
    // Cap delta time to prevent large jumps
    const cappedDelta = Math.min(delta, 0.1);
    
    // Update systems
    this.input.update();
    
    // Update scene manager
    this.sceneManager.update(cappedDelta);
    
    // Render current scene
    this.sceneManager.render();
    
    // Update FPS counter
    if (this.debug.showFPS) {
      this._updateFPSCounter(1 / cappedDelta);
    }
    
    // Continue game loop
    requestAnimationFrame(this._gameLoop);
  }
  
  _onResize() {
    // Update renderer size
    this.renderer.resize();
    
    // Update active scene
    this.sceneManager.onResize();
  }
  
  _createFPSCounter() {
    this.fpsCounter = document.createElement('div');
    this.fpsCounter.className = 'fps-counter';
    this.fpsCounter.style.position = 'absolute';
    this.fpsCounter.style.top = '10px';
    this.fpsCounter.style.right = '10px';
    this.fpsCounter.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.fpsCounter.style.color = '#fff';
    this.fpsCounter.style.padding = '5px 10px';
    this.fpsCounter.style.borderRadius = '3px';
    this.fpsCounter.style.fontFamily = 'monospace';
    this.fpsCounter.style.fontSize = '12px';
    this.fpsCounter.style.zIndex = '1000';
    this.fpsCounter.style.display = this.debug.showFPS ? 'block' : 'none';
    this.uiContainer.appendChild(this.fpsCounter);
  }
  
  _updateFPSCounter(fps) {
    this.fpsCounter.textContent = `FPS: ${Math.round(fps)}`;
  }
  
  toggleDebug(option) {
    if (option === 'fps') {
      this.debug.showFPS = !this.debug.showFPS;
      this.fpsCounter.style.display = this.debug.showFPS ? 'block' : 'none';
    } else if (option === 'stats') {
      this.debug.showStats = !this.debug.showStats;
      // Additional stats display could be implemented here
    }
  }
  
  dispose() {
    // Stop game loop
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('resize', this._onResize);
    
    // Dispose systems
    this.renderer.dispose();
    this.input.dispose();
    this.sceneManager.dispose();
    
    // Clean up UI
    if (this.uiContainer && this.uiContainer.parentNode) {
      this.uiContainer.parentNode.removeChild(this.uiContainer);
    }
    if (this.fpsCounter && this.fpsCounter.parentNode) {
      this.fpsCounter.parentNode.removeChild(this.fpsCounter);
    }
    
    // Clear references
    this.container = null;
    this.uiContainer = null;
    this.renderer = null;
    this.input = null;
    this.sceneManager = null;
  }
} 