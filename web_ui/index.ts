/**
 * Main application entry point
 * 
 * Uses nested callbacks to initialize:
 * 1. Connect to WebSocket
 * 2. Load templates
 * 3. Create and mount UI elements
 */

import { GameEngine } from './src/game_engine.js';
import { TemplateManager } from './src/template_manager.js';
import { QuestionBoard } from './src/elements/question_board.js';

// Get app container
const appContainer = document.getElementById('app');  
if (!appContainer) {
  throw new Error('App container not found');  
}

// Show loading message
appContainer.innerHTML = '<div class="loading">Connecting to game server...</div>';

// Step 1: Connect to WebSocket
GameEngine.connect('ws://localhost:8000', () => { 
  console.log('Connected! Loading templates...');
  appContainer.innerHTML = '<div class="loading">Loading templates...</div>';

  // Step 2: Load templates
  TemplateManager.loadTemplates(() => {
    console.log('Templates loaded! Creating UI...');

    // Step 3: Create and mount UI
    try {
      appContainer.innerHTML = ''; // Clear loading message
      
      const questionBoard = new QuestionBoard();
      appContainer.appendChild(questionBoard.el);
      
      console.log('App initialized successfully!');
    } catch (error) {
      console.error('Failed to create UI:', error);
      appContainer.innerHTML = '<div class="error">Failed to initialize UI</div>';
    }
  });
});



