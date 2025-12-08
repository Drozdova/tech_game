/**
 * CategorySelect - Page for selecting a category before viewing questions
 * Also displays teams panel with scores
 */

import { GameEngine } from '../game_engine.js';

export class CategorySelect {
  el: HTMLElement;
  private currentTeamContainer: HTMLElement;
  private onSelectCallback: ((category: string) => void) | null = null;
  private onNewGameCallback: (() => void) | null = null;
  private onScoreCallback: (() => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'category-select';

    // Create header with title and score button
    const header = document.createElement('div');
    header.className = 'board-header';
    
    const title = document.createElement('h1');
    title.className = 'category-title';
    title.textContent = 'Выберите категорию';
    header.appendChild(title);

    const scoreButton = document.createElement('button');
    scoreButton.className = 'score-button';
    scoreButton.textContent = 'Счёт';
    scoreButton.onclick = () => {
      if (this.onScoreCallback) {
        this.onScoreCallback();
      }
    };
    header.appendChild(scoreButton);

    this.el.appendChild(header);

    // Create current team indicator (prominent)
    this.currentTeamContainer = document.createElement('div');
    this.currentTeamContainer.className = 'current-team-block';
    this.currentTeamContainer.id = 'current-team-indicator';
    this.el.appendChild(this.currentTeamContainer);

    // Create categories container
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'categories-grid';
    categoriesContainer.id = 'categories-grid';
    this.el.appendChild(categoriesContainer);

    // Create footer with new game button (subtle)
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    
    const newGameButton = document.createElement('button');
    newGameButton.className = 'new-game-button';
    newGameButton.textContent = 'Новая игра';
    newGameButton.onclick = () => this.startNewGame();
    footer.appendChild(newGameButton);

    this.el.appendChild(footer);

    // Load teams first, then categories
    this.loadTeams();
  }

  /**
   * Load teams from server and display them
   */
  private loadTeams(): void {
    this.currentTeamContainer.innerHTML = '<span class="loading-text">Загрузка...</span>';

    GameEngine.call('get_team_list', [], (result, error) => {
      if (error) {
        this.currentTeamContainer.innerHTML = `<span class="error-text">Ошибка: ${error}</span>`;
        this.loadCategories();
        return;
      }

      // Get and display current team
      this.updateCurrentTeam();

      // Load categories after teams
      this.loadCategories();
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

      const indicator = document.getElementById('current-team-indicator');
      if (indicator) {
        indicator.textContent = `Сейчас ходит: ${currentTeam}`;
      }
    });
  }

  /**
   * Load categories from server
   */
  private loadCategories(): void {
    const container = this.el.querySelector('#categories-grid') as HTMLElement;
    if (!container) return;

    container.innerHTML = '<div class="loading-text">Загрузка категорий...</div>';

    GameEngine.call('get_category_list', [], (result, error) => {
      if (error) {
        container.innerHTML = `<div class="error-text">Ошибка загрузки: ${error}</div>`;
        return;
      }

      container.innerHTML = '';
      const categories = result as string[];

      categories.forEach(category => {
        const card = this.createCategoryCard(category);
        container.appendChild(card);
      });
    });
  }

  /**
   * Create a category card element
   */
  private createCategoryCard(categoryName: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.textContent = categoryName;
    card.onclick = () => this.onCategoryClick(categoryName);
    return card;
  }

  /**
   * Handle category click
   */
  private onCategoryClick(category: string): void {
    // Tell backend which category was selected
    GameEngine.call('set_current_category', [category], (result, error) => {
      if (error) {
        console.error('Failed to set category:', error);
        alert(`Ошибка: ${error}`);
        return;
      }

      // Then notify the callback
      if (this.onSelectCallback) {
        this.onSelectCallback(category);
      }
    });
  }

  /**
   * Start a new game
   */
  private startNewGame(): void {
    if (confirm('Вы уверены, что хотите начать новую игру? Текущий прогресс будет потерян.')) {
      GameEngine.call('reset_game', [], (result, error) => {
        if (error) {
          console.error('Failed to reset game:', error);
        }
        if (this.onNewGameCallback) {
          this.onNewGameCallback();
        } else {
          window.location.reload();
        }
      });
    }
  }

  /**
   * Set callback for when category is selected
   */
  onSelect(callback: (category: string) => void): void {
    this.onSelectCallback = callback;
  }

  /**
   * Set callback for new game
   */
  onNewGame(callback: () => void): void {
    this.onNewGameCallback = callback;
  }

  /**
   * Set callback for score page
   */
  onScore(callback: () => void): void {
    this.onScoreCallback = callback;
  }
}
