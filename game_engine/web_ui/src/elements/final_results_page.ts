/**
 * FinalResultsPage - Page displaying final team rankings
 */

import { GameEngine } from '../game_engine.js';

export class FinalResultsPage {
  el: HTMLElement;
  private resultsContainer: HTMLElement;
  private onContinueCallback: (() => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'final-results-page';

    // Create title container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'final-title-container';

    const title = document.createElement('h1');
    title.className = 'final-title';
    title.textContent = 'TEAM RANKINGS';
    titleContainer.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'final-subtitle';
    subtitle.textContent = '// QUIZ RESULTS';
    titleContainer.appendChild(subtitle);

    this.el.appendChild(titleContainer);

    // Create results container
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'final-results-container';
    this.el.appendChild(this.resultsContainer);

    // Create continue button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'final-results-button-container';
    
    const continueButton = document.createElement('button');
    continueButton.className = 'continue-game-button';
    continueButton.textContent = 'CONTINUE GAME';
    continueButton.onclick = () => {
      if (this.onContinueCallback) {
        this.onContinueCallback();
      }
    };
    buttonContainer.appendChild(continueButton);

    this.el.appendChild(buttonContainer);

    // Load results
    this.loadResults();
  }

  /**
   * Load final results from server
   */
  private loadResults(): void {
    this.resultsContainer.innerHTML = '<div class="loading-text">Загрузка результатов...</div>';

    GameEngine.call('get_team_list', [], (result, error) => {
      if (error) {
        this.resultsContainer.innerHTML = `<div class="error-text">Ошибка: ${error}</div>`;
        return;
      }

      const teams = result as string[];
      
      // Load all scores first, then sort and display
      const teamScores: Array<{name: string, score: number}> = [];
      let loadedCount = 0;

      if (teams.length === 0) {
        this.resultsContainer.innerHTML = '<div class="loading-text">Нет команд</div>';
        return;
      }

      teams.forEach((teamName) => {
        GameEngine.call('get_team_score', [teamName], (scoreResult, scoreError) => {
          if (scoreError) {
            console.error(`Failed to get score for ${teamName}:`, scoreError);
            loadedCount++;
          } else {
            const score = scoreResult as number;
            teamScores.push({ name: teamName, score: score });
            loadedCount++;
          }

          // When all scores are loaded, sort and display
          if (loadedCount === teams.length) {
            // Sort by score descending (highest first)
            teamScores.sort((a, b) => b.score - a.score);
            
            this.displayResults(teamScores);
          }
        });
      });
    });
  }

  /**
   * Display final results
   */
  private displayResults(teamsArray: Array<{name: string, score: number}>): void {
    this.resultsContainer.innerHTML = '';

    teamsArray.forEach((team, index) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'final-result-item';
      
      // Add special classes for top 3
      if (index === 0) {
        resultItem.classList.add('winner');
      } else if (index === 1) {
        resultItem.classList.add('second-place');
      } else if (index === 2) {
        resultItem.classList.add('third-place');
      }

      const placeBadge = document.createElement('div');
      placeBadge.className = 'place-badge';
      placeBadge.textContent = `${index + 1}`;
      resultItem.appendChild(placeBadge);

      const teamName = document.createElement('div');
      teamName.className = 'team-name-final';
      teamName.textContent = team.name;
      resultItem.appendChild(teamName);

      const teamScore = document.createElement('div');
      teamScore.className = 'team-score-final';
      teamScore.textContent = `${team.score}`;
      resultItem.appendChild(teamScore);

      // Add animation delay for sequential appearance
      resultItem.style.animationDelay = `${index * 0.1}s`;

      this.resultsContainer.appendChild(resultItem);
    });
  }

  /**
   * Set callback for continue button
   */
  onContinue(callback: () => void): void {
    this.onContinueCallback = callback;
  }
}

