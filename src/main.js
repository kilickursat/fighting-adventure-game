import { Game } from './game/Game.js';

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Create game container
  const container = document.getElementById('game-container');
  if (!container) {
    console.error("Game container not found");
    return;
  }

  // Set up loading progress display
  const loadingText = document.getElementById('loading-text');
  const htmlLoadingScreen = document.getElementById('loading-screen');

  // Create and start the game
  const game = new Game({
    container: container,
    uiContainer: document.getElementById('ui-container'),
    onProgress: (percentage) => {
      // Update loading progress
      if (loadingText) {
        loadingText.textContent = `${percentage}%`;
      }
      
      // Update progress bar
      const progressBar = document.querySelector('#loading-screen .progress');
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }
    },
    onLoad: () => {
      console.log("Game assets loaded, hiding loading screen");
      // Hide the HTML loading screen with a slight delay to ensure transitions are complete
      setTimeout(() => {
        if (htmlLoadingScreen) {
          htmlLoadingScreen.style.display = 'none';
        }
      }, 1500);
    }
  });

  game.start();

  // Expose game to console for debugging
  window.game = game;

  // Add keyboard shortcut for toggling FPS counter (Ctrl+F)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'f') {
      game.toggleDebug('fps');
      event.preventDefault();
    }
  });

  // Handle window focus/blur for better performance
  window.addEventListener('blur', () => {
    game.stop();
  });

  window.addEventListener('focus', () => {
    if (!game.isRunning) {
      game.start();
    }
  });

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.stop();
    } else {
      if (!game.isRunning) {
        game.start();
      }
    }
  });
});
