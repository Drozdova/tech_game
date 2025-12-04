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
import { TeamSetup } from './src/elements/team_setup.js';

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

    // Step 3: Check if game is already started (from localStorage)
    try {
      appContainer.innerHTML = ''; // Clear loading message
      
      const gameStarted = localStorage.getItem('gameStarted') === 'true';
      
      if (gameStarted) {
        // Game was already started, go directly to game board
        console.log('Resuming game from localStorage...');
        const questionBoard = new QuestionBoard();
        appContainer.appendChild(questionBoard.el);
        console.log('Game resumed successfully!');
      } else {
        // Show team setup
        const teamSetup = new TeamSetup();
        appContainer.appendChild(teamSetup.el);

        // When teams are set, show the game board
        teamSetup.onStart((teams) => {
          console.log('Teams created:', teams);
          
          // Save to localStorage
          localStorage.setItem('gameStarted', 'true');
          localStorage.setItem('teams', JSON.stringify(teams));
          
          appContainer.innerHTML = ''; // Clear setup form
          
          const questionBoard = new QuestionBoard();
          appContainer.appendChild(questionBoard.el);
          
          console.log('Game started successfully!');
        });
        
        console.log('App initialized successfully!');
      }
    } catch (error) {
      console.error('Failed to create UI:', error);
      appContainer.innerHTML = '<div class="error">Failed to initialize UI</div>';
    }
  });
});



