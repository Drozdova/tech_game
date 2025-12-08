/**
 * ScorePage - Page displaying all team scores
 */

import { GameEngine } from '../game_engine.js';

export class ScorePage {
  el: HTMLElement;
  private scoresContainer: HTMLElement;
  private onBackCallback: (() => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'score-page';

    // Create header
    const header = document.createElement('div');
    header.className = 'score-header';

    const title = document.createElement('h1');
    title.className = 'score-title';
    title.textContent = 'Счёт';
    header.appendChild(title);

    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.textContent = 'Назад';
    backButton.onclick = () => {
      if (this.onBackCallback) {
        this.onBackCallback();
      }
    };
    header.appendChild(backButton);

    this.el.appendChild(header);

    // Create scores container
    this.scoresContainer = document.createElement('div');
    this.scoresContainer.className = 'scores-list';
    this.el.appendChild(this.scoresContainer);

    // Load scores
    this.loadScores();
  }

  /**
   * Load all team scores
   */
  private loadScores(): void {
    this.scoresContainer.innerHTML = '<div class="loading-text">Загрузка...</div>';

    GameEngine.call('get_team_list', [], (result, error) => {
      if (error) {
        this.scoresContainer.innerHTML = `<div class="error-text">Ошибка: ${error}</div>`;
        return;
      }

      this.scoresContainer.innerHTML = '';
      const teams = result as string[];

      teams.forEach((teamName) => {
        this.loadTeamScore(teamName);
      });
    });
  }

  /**
   * Load and display score for a single team
   */
  private loadTeamScore(teamName: string): void {
    GameEngine.call('get_team_score', [teamName], (result, error) => {
      if (error) {
        console.error(`Failed to get score for ${teamName}:`, error);
        return;
      }

      const score = result as number;

      const teamRow = document.createElement('div');
      teamRow.className = 'score-row';

      const nameEl = document.createElement('span');
      nameEl.className = 'score-team-name';
      nameEl.textContent = teamName;

      const scoreEl = document.createElement('span');
      scoreEl.className = 'score-team-value';
      scoreEl.textContent = `${score}`;

      teamRow.appendChild(nameEl);
      teamRow.appendChild(scoreEl);
      this.scoresContainer.appendChild(teamRow);
    });
  }

  /**
   * Set callback for back button
   */
  onBack(callback: () => void): void {
    this.onBackCallback = callback;
  }
}

