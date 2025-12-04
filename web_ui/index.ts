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
import { CategorySelect } from './src/elements/category_select.js';

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
      
      // Helper function to show category selection
      const showCategorySelect = () => {
        appContainer.innerHTML = '';
        const categorySelect = new CategorySelect();
        appContainer.appendChild(categorySelect.el);

        categorySelect.onSelect((category) => {
          console.log('Category selected:', category);
          localStorage.setItem('selectedCategory', category);
          
          appContainer.innerHTML = '';
          const questionBoard = new QuestionBoard();
          appContainer.appendChild(questionBoard.el);
          
          console.log('Game started with category:', category);
        });
      };

      const gameStarted = localStorage.getItem('gameStarted') === 'true';
      const hasCategory = localStorage.getItem('selectedCategory');
      
      if (gameStarted && hasCategory) {
        // Game was already started, go directly to game board
        console.log('Resuming game from localStorage...');
        const questionBoard = new QuestionBoard();
        appContainer.appendChild(questionBoard.el);
        console.log('Game resumed successfully!');
      } else if (gameStarted && !hasCategory) {
        // Teams set but no category selected
        console.log('Teams set, showing category selection...');
        showCategorySelect();
      } else {
        // Show team setup
        const teamSetup = new TeamSetup();
        appContainer.appendChild(teamSetup.el);

        // When teams are set, show category selection
        teamSetup.onStart((teams) => {
          console.log('Teams created:', teams);
          
          // Save to localStorage
          localStorage.setItem('gameStarted', 'true');
          localStorage.setItem('teams', JSON.stringify(teams));
          
          showCategorySelect();
        });
        
        console.log('App initialized successfully!');
      }
    } catch (error) {
      console.error('Failed to create UI:', error);
      appContainer.innerHTML = '<div class="error">Failed to initialize UI</div>';
    }
  });
});



