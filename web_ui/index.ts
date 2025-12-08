/**
 * Main application entry point
 * 
 * Navigation flow:
 * 1. TeamSetup - create teams
 * 2. CategorySelect - select a category
 * 3. PriceBoard - select a question by price
 * 4. QuestionPage - answer the question
 * 5. Back to PriceBoard
 */

import { GameEngine } from './src/game_engine.js';
import { TemplateManager } from './src/template_manager.js';
import { TeamSetup } from './src/elements/team_setup.js';
import { CategorySelect } from './src/elements/category_select.js';
import { PriceBoard } from './src/elements/price_board.js';
import { QuestionPage } from './src/elements/question_page.js';
import { ScorePage } from './src/elements/score_page.js';

// Get app container
const appContainer = document.getElementById('app');  
if (!appContainer) {
  throw new Error('App container not found');  
}

// Show loading message
appContainer.innerHTML = '<div class="loading">Connecting to game server...</div>';

// Helper functions to show different pages
const showQuestionPage = (questionTitle: string, questionPrice: number) => {
  appContainer.innerHTML = '';
  const questionPage = new QuestionPage(questionTitle, questionPrice);
  appContainer.appendChild(questionPage.el);

  questionPage.onAnswer((isCorrect) => {
    // Switch to next team and go back to category select
    GameEngine.call('next_team', [], () => {
      showCategorySelect();
    });
  });

  console.log('Showing question page:', questionTitle);
};

const showPriceBoard = () => {
  appContainer.innerHTML = '';
  const priceBoard = new PriceBoard();
  appContainer.appendChild(priceBoard.el);

  priceBoard.onPriceSelect((question, price) => {
    console.log('Price selected:', price, 'Question:', question);
    showQuestionPage(question, price);
  });

  console.log('Showing price board');
};

const showScorePage = () => {
  appContainer.innerHTML = '';
  const scorePage = new ScorePage();
  appContainer.appendChild(scorePage.el);

  scorePage.onBack(() => {
    showCategorySelect();
  });

  console.log('Showing score page');
};

const showCategorySelect = () => {
  appContainer.innerHTML = '';
  const categorySelect = new CategorySelect();
  appContainer.appendChild(categorySelect.el);

  categorySelect.onSelect((category) => {
    console.log('Category selected:', category);
    showPriceBoard();
  });

  categorySelect.onNewGame(() => {
    showTeamSetup();
  });

  categorySelect.onScore(() => {
    showScorePage();
  });

  console.log('Showing category selection');
};

const showTeamSetup = () => {
  appContainer.innerHTML = '';
  const teamSetup = new TeamSetup();
  appContainer.appendChild(teamSetup.el);

  teamSetup.onStart((teams) => {
    console.log('Teams created:', teams);
    showCategorySelect();
  });
  console.log('Showing team setup');
};

// Step 1: Connect to WebSocket
GameEngine.connect('ws://localhost:8000', () => { 
  console.log('Connected! Loading templates...');
  appContainer.innerHTML = '<div class="loading">Loading templates...</div>';

  // Step 2: Load templates
  TemplateManager.loadTemplates(() => {
    console.log('Templates loaded! Checking game state...');
    appContainer.innerHTML = '<div class="loading">Checking game state...</div>';

    // Step 3: Get game state from backend
    GameEngine.call('get_team_list', [], (teamsResult, teamsError) => {
      if (teamsError) {
        console.error('Failed to get teams:', teamsError);
        appContainer.innerHTML = '<div class="error">Failed to get game state</div>';
        return;
      }

      const teams = teamsResult as string[];
      const hasTeams = teams && teams.length > 0;

      if (!hasTeams) {
        // No teams - show team setup
        showTeamSetup();
        return;
      }

      // Teams exist - check if category is selected
      GameEngine.call('get_selected_category', [], (categoryResult, categoryError) => {
        if (categoryError) {
          console.error('Failed to get category:', categoryError);
          showCategorySelect();
          return;
        }

        const selectedCategory = categoryResult as string | null;

        if (selectedCategory) {
          // Category selected - show price board
          showPriceBoard();
        } else {
          // No category - show category selection
          showCategorySelect();
        }
      });
    });
  });
});
