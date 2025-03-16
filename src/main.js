import { Game } from './game/Game.js';

// Create game container
const container = document.createElement('div');
container.id = 'game-container';
container.style.width = '100%';
container.style.height = '100%';
container.style.position = 'absolute';
container.style.top = '0';
container.style.left = '0';
container.style.overflow = 'hidden';
document.body.appendChild(container);

// Create and start the game
const game = new Game(container);

// Make sure the HTML loading screen is hidden when the game starts loading
// This is separate from the in-game loading scene
const htmlLoadingScreen = document.getElementById('loading-screen');
if (htmlLoadingScreen) {
  console.log("Main.js - Found HTML loading screen, will hide after game starts");
  
  // Hide the HTML loading screen after a short delay
  setTimeout(() => {
    console.log("Main.js - Hiding HTML loading screen now");
    htmlLoadingScreen.style.display = 'none';
  }, 1000);
}

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