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
import { WelcomePage } from './src/elements/welcome_page.js';
import { TeamSetup } from './src/elements/team_setup.js';
import { CategorySelect } from './src/elements/category_select.js';
import { PriceBoard } from './src/elements/price_board.js';
import { QuestionPage } from './src/elements/question_page.js';
import { ScorePage } from './src/elements/score_page.js';
import { GameOverPage } from './src/elements/game_over_page.js';
import { FinalResultsPage } from './src/elements/final_results_page.js';
import { getWebSocketUrl } from './src/config.js';

/**
 * Get WebSocket URL from various sources
 * Priority:
 * 1. URL parameter (?ws=ws://example.com:8000) - overrides config
 * 2. Use config (auto-detect from current host)
 */
function getWebSocketUrlWithOverride(): string {
  // Check URL parameter (allows override from config)
  const urlParams = new URLSearchParams(window.location.search);
  const wsParam = urlParams.get('ws');
  if (wsParam) {
    return wsParam;
  }

  // Use config URL (uses current hostname and configured port)
  return getWebSocketUrl();
}

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
    // Switch to next team and check if game is finished
    GameEngine.call('next_team', [], () => {
      // Check if game is finished (all questions answered)
      GameEngine.call('is_game_finished', [], (finishedResult, finishedError) => {
        if (finishedError) {
          console.error('Failed to check if game finished:', finishedError);
          showCategorySelect();
          return;
        }

        const isFinished = finishedResult as boolean;
        if (isFinished) {
          showGameOver();
        } else {
      showCategorySelect();
        }
      });
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
    // Set current question in backend before showing question page
    GameEngine.call('set_current_question', [question], (result, error) => {
      if (error) {
        console.error('Failed to set current question:', error);
      }
    showQuestionPage(question, price);
    });
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

const showGameOver = () => {
  appContainer.innerHTML = '';
  const gameOverPage = new GameOverPage();
  appContainer.appendChild(gameOverPage.el);

  gameOverPage.onViewResults(() => {
    console.log('View results clicked');
    showFinalResults();
  });

  console.log('Showing game over page');
};

const showFinalResults = () => {
  appContainer.innerHTML = '';
  const finalResults = new FinalResultsPage();
  appContainer.appendChild(finalResults.el);

  finalResults.onEndGame(() => {
    console.log('End game clicked');
    // Check if there are teams to show appropriate welcome page
    GameEngine.call('get_team_list', [], (teamsResult, teamsError) => {
      const hasTeams = !teamsError && (teamsResult as string[]).length > 0;
      showWelcomePage(hasTeams);
    });
  });

  console.log('Showing final results');
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
    showWelcomePage(false);
  });

  categorySelect.onScore(() => {
    showScorePage();
  });

  categorySelect.onEndGame(() => {
    // Explicitly finish game and save state
    GameEngine.call('finish_game', [], (result, error) => {
      if (error) {
        console.error('Failed to finish game:', error);
      }
      // Show game over screen
      showGameOver();
    });
  });

  console.log('Showing category selection');
};

const showWelcomePage = (hasSavedGame: boolean = false, showStartButton: boolean = false) => {
  appContainer.innerHTML = '';
  const welcomePage = new WelcomePage(hasSavedGame, showStartButton);
  appContainer.appendChild(welcomePage.el);

  if (showStartButton) {
    // After teams created - show "START GAME" button
    welcomePage.onStartGame(() => {
      console.log('Start game clicked');
      showCategorySelect();
    });
  } else {
    // Initial welcome page - show "NEW GAME" and optionally "CONTINUE GAME"
    welcomePage.onCreateTeams(() => {
      console.log('New game clicked');
      // Clear saved game state before starting new game
      GameEngine.call('clear_saved_state', [], (result, error) => {
        if (error) {
          console.error('Failed to clear saved state:', error);
        }
        // Reset game state
        GameEngine.call('reset_game', [], (resetResult, resetError) => {
          if (resetError) {
            console.error('Failed to reset game:', resetError);
          }
          showTeamSetup();
        });
      });
    });

    if (hasSavedGame) {
      welcomePage.onContinueGame(() => {
        console.log('Continue game clicked');
        showCategorySelect();
      });
    }
  }

  console.log('Showing welcome page');
};

const showTeamSetup = () => {
  appContainer.innerHTML = '';
  const teamSetup = new TeamSetup();
  appContainer.appendChild(teamSetup.el);

  teamSetup.onDone(() => {
    console.log('Teams created, returning to welcome page');
    showWelcomePage(false, true); // Show welcome page with "START GAME" button
  });
  console.log('Showing team setup');
};

// Step 1: Connect to WebSocket
const wsUrl = getWebSocketUrlWithOverride();
console.log('Connecting to WebSocket:', wsUrl);
GameEngine.connect(wsUrl, () => { 
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

      // Always show welcome page first
      // If teams exist, show "Continue Game" button, otherwise only "New Game"
      showWelcomePage(hasTeams);
    });
  });
});
