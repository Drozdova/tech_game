/**
 * QuestionBoard - Main game board displaying question cards and answer variants
 * 
 * Loads questions from server, displays them as cards.
 * On card click, loads and displays answer variants as buttons.
 * On button click, submits answer to server.
 */

import { GameEngine } from '../game_engine.js';
import { TemplateManager } from '../template_manager.js';

export class QuestionBoard {
  el: HTMLElement;
  private teamsContainer: HTMLElement;
  private questionsContainer: HTMLElement;
  private variantsContainer: HTMLElement;
  private selectedQuestionIndex: number | null = null;
  private selectedQuestionPrice: number | null = null;
  private selectedTeam: string | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'question-board';

    // Create title
    const title = document.createElement('h1');
    title.className = 'board-title';
    title.textContent = 'Игра-викторина';
    this.el.appendChild(title);

    // Create teams panel
    this.teamsContainer = document.createElement('div');
    this.teamsContainer.className = 'teams-panel';
    this.el.appendChild(this.teamsContainer);

    // Create questions grid container
    this.questionsContainer = document.createElement('div');
    this.questionsContainer.className = 'questions-grid';
    this.el.appendChild(this.questionsContainer);

    // Create variants container
    this.variantsContainer = document.createElement('div');
    this.variantsContainer.className = 'variants-container';
    this.el.appendChild(this.variantsContainer);

    // Load teams first, then questions
    this.loadTeams();
  }

  /**
   * Load teams from server and display them
   */
  private loadTeams(): void {
    this.teamsContainer.innerHTML = '<div class="loading-text">Загрузка команд...</div>';

    GameEngine.call('list_teams', [], (result, error) => {
      if (error) {
        this.teamsContainer.innerHTML = `<div class="error-text">Ошибка загрузки команд: ${error}</div>`;
        return;
      }

      // Clear loading message
      this.teamsContainer.innerHTML = '';

      // Create title for teams panel
      const teamsTitle = document.createElement('h2');
      teamsTitle.className = 'teams-title';
      teamsTitle.textContent = 'Команды:';
      this.teamsContainer.appendChild(teamsTitle);

      // Create current team indicator
      const currentTeamIndicator = document.createElement('div');
      currentTeamIndicator.className = 'current-team-indicator';
      currentTeamIndicator.id = 'current-team-indicator';
      this.teamsContainer.appendChild(currentTeamIndicator);

      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'teams-buttons';

      // Create display for each team (not clickable)
      const teams = result as string[];
      teams.forEach((teamName) => {
        // Create team item container
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';

        // Create team display (not a button)
        const teamDisplay = document.createElement('div');
        teamDisplay.className = 'team-display';
        teamDisplay.textContent = teamName;
        teamDisplay.dataset.team = teamName;

        // Create score display
        const scoreDisplay = document.createElement('span');
        scoreDisplay.className = 'team-score';
        scoreDisplay.dataset.team = teamName;
        scoreDisplay.textContent = '0 очков';

        // Add display and score to team item
        teamItem.appendChild(teamDisplay);
        teamItem.appendChild(scoreDisplay);
        buttonsContainer.appendChild(teamItem);

        // Load initial score
        this.updateTeamScore(teamName);
      });

      this.teamsContainer.appendChild(buttonsContainer);

      // Load questions after teams are loaded
      this.loadQuestions();
      
      // Get and display current team
      this.updateCurrentTeam();
    });
  }

  /**
   * Update current team display from server
   */
  private updateCurrentTeam(): void {
    GameEngine.call('get_current_team', [], (result, error) => {
      if (error) {
        console.error('Failed to get current team:', error);
        return;
      }

      const currentTeam = result as string;
      this.selectedTeam = currentTeam;

      // Update indicator
      const indicator = document.getElementById('current-team-indicator');
      if (indicator) {
        indicator.textContent = `Сейчас ходит: ${currentTeam}`;
      }

      // Highlight current team
      const allTeams = this.teamsContainer.querySelectorAll('.team-display');
      allTeams.forEach(team => {
        if ((team as HTMLElement).dataset.team === currentTeam) {
          team.classList.add('current');
        } else {
          team.classList.remove('current');
        }
      });
    });
  }

  /**
   * Load questions from server and display them
   */
  private loadQuestions(): void {
        this.questionsContainer.innerHTML = '<div class="loading-text">Загрузка вопросов...</div>';

        GameEngine.call('list_questions_and_prices', [], (result, error) => {
            if (error) {
                this.questionsContainer.innerHTML = `<div class="error-text">Ошибка: ${error}</div>`;
                return;
            }

            // Clear loading message
            this.questionsContainer.innerHTML = '';

            // Create card for each question
            interface QuestionInfo {
                title: string;
                price: number;
            }
            const questions = result as QuestionInfo[];
            questions.forEach((question, index) => {
                this.createQuestionCard(question.title, question.price, index);
            });
        });
    }

    /**
     * Create a question card
     */
    private createQuestionCard(title: string, price: number, index: number): void {
        const template = TemplateManager.getTemplate('question_card');
        if (!template) {
            console.error('Failed to load question_card template');
            return;
        }

        // Fill in the template
        const titleEl = template.querySelector('.question-title') as HTMLElement;
        const pointsEl = template.querySelector('.question-points') as HTMLElement;

        if (titleEl && pointsEl) {
            titleEl.textContent = title;
            // Use actual price from server
            pointsEl.textContent = `${price} баллов`;
        }

        // Add click handler
        template.onclick = () => this.onQuestionClick(index, price);

        // Add to container
        this.questionsContainer.appendChild(template);
    }

    /**
     * Handle question card click
     */
    private onQuestionClick(questionIndex: number, price: number): void {
        this.selectedQuestionIndex = questionIndex;
        this.selectedQuestionPrice = price;

        // Show loading state
        this.variantsContainer.innerHTML = '<div class="loading-text">Загрузка вариантов...</div>';
        this.variantsContainer.style.display = 'block';

        // Load variants from server
        GameEngine.call('get_variants_for_question', [questionIndex], (result, error) => {
            if (error) {
                this.variantsContainer.innerHTML = `<div class="error-text">Ошибка: ${error}</div>`;
                return;
            }

            // Display variants
            this.displayVariants(result as string[]);
        });
    }

    /**
     * Display answer variants as buttons
     */
    private displayVariants(variants: string[]): void {
        this.variantsContainer.innerHTML = '';

        const title = document.createElement('h2');
        title.className = 'variants-title';
        title.textContent = 'Выбери ответ:';
        this.variantsContainer.appendChild(title);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'variants-buttons';

        variants.forEach((variant, index) => {
            const button = document.createElement('button');
            button.className = 'variant-button';
            button.textContent = variant;
            button.onclick = () => this.onVariantClick(variant, button);
            buttonsContainer.appendChild(button);
        });

        this.variantsContainer.appendChild(buttonsContainer);
    }

    /**
     * Handle variant button click
     */
    private onVariantClick(answer: string, button: HTMLButtonElement): void {
        if (this.selectedQuestionIndex === null || this.selectedQuestionPrice === null) {
            return;
        }

        // Disable all buttons while waiting for response
        const allButtons = this.variantsContainer.querySelectorAll('.variant-button');
        allButtons.forEach(btn => {
            (btn as HTMLButtonElement).disabled = true;
        });

        // Submit answer to server with question index, answer, and price
        GameEngine.call('submit_answer', [this.selectedQuestionIndex, answer, this.selectedQuestionPrice], (result, error) => {
            if (error) {
                alert(`Ошибка: ${error}`);
                // Re-enable buttons
                allButtons.forEach(btn => {
                    (btn as HTMLButtonElement).disabled = false;
                });
                return;
            }

            // Show result
            const isCorrect = result as boolean;
            if (isCorrect) {
                button.classList.add('correct');
                // Update score for selected team
                if (this.selectedTeam) {
                    this.updateTeamScore(this.selectedTeam);
                }
                setTimeout(() => {
                    alert('Правильно! 🎉');
                    this.variantsContainer.style.display = 'none';
                    this.variantsContainer.innerHTML = '';
                    // Switch to next team
                    this.nextTeam();
                }, 500);
            } else {
                button.classList.add('incorrect');
                // Update score for selected team (even if wrong)
                if (this.selectedTeam) {
                    this.updateTeamScore(this.selectedTeam);
                }
                setTimeout(() => {
                    alert('Неправильно 😢');
                    // Close variants container
                    this.variantsContainer.style.display = 'none';
                    this.variantsContainer.innerHTML = '';
                    // Switch to next team
                    this.nextTeam();
                }, 500);
            }
        });
    }

    /**
     * Switch to next team
     */
    private nextTeam(): void {
        GameEngine.call('next_team', [], (result, error) => {
            if (error) {
                console.error('Failed to switch team:', error);
                return;
            }
            // Update current team display
            this.updateCurrentTeam();
            // Update all team scores
            const allTeams = this.teamsContainer.querySelectorAll('.team-display');
            allTeams.forEach(team => {
                const teamName = (team as HTMLElement).dataset.team;
                if (teamName) {
                    this.updateTeamScore(teamName);
                }
            });
        });
    }

    /**
     * Update team score display
     */
    private updateTeamScore(teamName: string): void {
        GameEngine.call('get_team_score', [teamName], (result, error) => {
            if (error) {
                console.error(`Failed to get score for ${teamName}:`, error);
                return;
            }

            const score = result as number;
            const scoreDisplay = this.teamsContainer.querySelector(
                `.team-score[data-team="${teamName}"]`
            ) as HTMLElement;

            if (scoreDisplay) {
                scoreDisplay.textContent = `${score} очков`;
            }
        });
    }
}

