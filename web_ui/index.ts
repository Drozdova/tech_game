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

/**
 * Get WebSocket URL from various sources
 * Priority:
 * 1. URL parameter (?ws=ws://example.com:8000)
 * 2. Environment variable (if available)
 * 3. Auto-detect from current host
 * 4. Fallback to localhost:8000
 */
function getWebSocketUrl(): string {
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const wsParam = urlParams.get('ws');
  if (wsParam) {
    return wsParam;
  }

  // Auto-detect from current host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
  
  // Use port 8000 for WebSocket (different from HTTP port)
  const wsPort = '8000';
  
  return `${protocol}//${hostname}:${wsPort}`;
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

  console.log('Showing category selection');
};

const showWelcomePage = (showStartButton: boolean = false) => {
  appContainer.innerHTML = '';
  const welcomePage = new WelcomePage(showStartButton);
  appContainer.appendChild(welcomePage.el);

  welcomePage.onCreateTeams(() => {
    console.log('Create teams clicked');
    showTeamSetup();
  });

  if (showStartButton) {
    welcomePage.onStartGame(() => {
      console.log('Start game clicked');
      showCategorySelect();
    });
  }

  console.log('Showing welcome page');
};

const showTeamSetup = () => {
  appContainer.innerHTML = '';
  const teamSetup = new TeamSetup();
  appContainer.appendChild(teamSetup.el);

  teamSetup.onDone(() => {
    console.log('Teams created, returning to welcome page');
    showWelcomePage(true); // Show welcome page with start button
  });
  console.log('Showing team setup');
};

// Step 1: Connect to WebSocket
const wsUrl = getWebSocketUrl();
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

      if (!hasTeams) {
        // No teams - show welcome page
        showWelcomePage(false);
        return;
      }

      // Teams exist - first check if game is finished
      GameEngine.call('is_game_finished', [], (finishedResult, finishedError) => {
        if (finishedError) {
          console.error('Failed to check if game finished:', finishedError);
          // Continue with normal flow if check fails
        } else {
          const isFinished = finishedResult as boolean;
          if (isFinished) {
            // Game is finished - show game over page
            showGameOver();
            return;
          }
        }

        // Game is not finished - check if category is selected
      GameEngine.call('get_selected_category', [], (categoryResult, categoryError) => {
        if (categoryError) {
          console.error('Failed to get category:', categoryError);
          showCategorySelect();
          return;
        }

        const selectedCategory = categoryResult as string | null;

        if (selectedCategory) {
          // Category selected - check if there's a current question
          GameEngine.call('get_current_question', [], (currentQuestionResult, currentQuestionError) => {
            if (currentQuestionError) {
              console.error('Failed to get current question:', currentQuestionError);
              // If error getting current question, show price board
              showPriceBoard();
              return;
            }

            const currentQuestion = currentQuestionResult as string | null;
            
            if (currentQuestion) {
              // There's a current question - need to get its price
              // TODO: Need backend method get_question_price(question: string) -> int
              // For now, try to get price from prices list
              GameEngine.call('get_prices', [], (pricesResult, pricesError) => {
                if (pricesError) {
                  console.error('Failed to get prices:', pricesError);
                  showPriceBoard();
                  return;
                }

                GameEngine.call('get_current_questions', [], (questionsResult, questionsError) => {
                  if (questionsError) {
                    console.error('Failed to get questions:', questionsError);
                    showPriceBoard();
                    return;
                  }

                  const questions = questionsResult as string[];
                  const prices = pricesResult as number[];
                  
                  // Find price by matching question index
                  const questionIndex = questions.indexOf(currentQuestion);
                  if (questionIndex !== -1 && questionIndex < prices.length) {
                    const questionPrice = prices[questionIndex];
                    showQuestionPage(currentQuestion, questionPrice);
                  } else {
                    // Fallback: show price board if can't find price
                    console.warn('Could not find price for current question, showing price board');
                    showPriceBoard();
                  }
                });
              });
            } else {
              // No current question - show price board
          showPriceBoard();
            }
          });
        } else {
          // No category - show category selection
          showCategorySelect();
        }
      });
      }); // Close is_game_finished callback
    });
  });
});
