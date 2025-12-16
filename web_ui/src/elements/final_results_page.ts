/**
 * FinalResultsPage - Final page showing game results with winners and all places
 */

import { GameEngine } from '../game_engine.js';

export class FinalResultsPage {
  el: HTMLElement;

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
    subtitle.textContent = '// Quiz results';
    titleContainer.appendChild(subtitle);

    this.el.appendChild(titleContainer);

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'final-results-container';
    resultsContainer.id = 'final-results-list';
    this.el.appendChild(resultsContainer);

    // Load results
    this.loadResults();
  }

  /**
   * Load final results from server
   */
  private loadResults(): void {
    const resultsContainer = this.el.querySelector('#final-results-list') as HTMLElement;
    if (!resultsContainer) return;

    // Show loading
    resultsContainer.innerHTML = '<div class="loading-text">Загрузка результатов...</div>';

    // Get team list first, then load scores for each team (same approach as ScorePage)
    GameEngine.call('get_team_list', [], (result, error) => {
      if (error) {
        console.error('Failed to get team list:', error);
        resultsContainer.innerHTML = `<div class="error-text">Ошибка загрузки результатов: ${error}</div>`;
        return;
      }

      const teams = result as string[];
      
      if (teams.length === 0) {
        resultsContainer.innerHTML = '<div class="error-text">Нет команд</div>';
        return;
      }

      // Load all scores first, then sort and display
      const teamScores: Array<{name: string, score: number}> = [];
      let loadedCount = 0;

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
   * Display results sorted by score
   */
  private displayResults(teamsArray: Array<{name: string, score: number}>): void {
    const resultsContainer = this.el.querySelector('#final-results-list') as HTMLElement;
    if (!resultsContainer) return;

    if (teamsArray.length === 0) {
      resultsContainer.innerHTML = '<div class="error-text">Нет результатов</div>';
      return;
    }

    resultsContainer.innerHTML = '';

    teamsArray.forEach((item, index) => {
      const place = index + 1;
      const resultItem = document.createElement('div');
      resultItem.className = 'final-result-item';
      // Add delay for sequential animation
      resultItem.style.animationDelay = `${index * 0.1}s`;

      // Add special class for winner
      if (place === 1) {
        resultItem.classList.add('winner');
      } else if (place === 2) {
        resultItem.classList.add('second-place');
      } else if (place === 3) {
        resultItem.classList.add('third-place');
      }

      // Place badge
      const placeBadge = document.createElement('div');
      placeBadge.className = 'place-badge';
      placeBadge.textContent = `#${place}`;
      resultItem.appendChild(placeBadge);

      // Team name
      const teamName = document.createElement('div');
      teamName.className = 'team-name-final';
      teamName.textContent = item.name;
      resultItem.appendChild(teamName);

      // Score
      const score = document.createElement('div');
      score.className = 'team-score-final';
      score.textContent = `${item.score} очков`;
      resultItem.appendChild(score);

      resultsContainer.appendChild(resultItem);
    });
  }
}

