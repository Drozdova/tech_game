/**
 * GameOverPage - Page shown when game is finished, with button to view results
 */

export class GameOverPage {
  el: HTMLElement;
  private onViewResultsCallback?: () => void;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'game-over-page';

    // Create title container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'game-over-title-container';

    const title = document.createElement('h1');
    title.className = 'game-over-title';
    title.textContent = 'GAME OVER';
    titleContainer.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'game-over-subtitle';
    subtitle.textContent = '// All questions completed';
    titleContainer.appendChild(subtitle);

    this.el.appendChild(titleContainer);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'game-over-button-container';

    const viewResultsButton = document.createElement('button');
    viewResultsButton.className = 'view-results-button';
    viewResultsButton.textContent = 'Результаты игры';
    
    viewResultsButton.addEventListener('click', () => {
      if (this.onViewResultsCallback) {
        this.onViewResultsCallback();
      }
    });

    buttonContainer.appendChild(viewResultsButton);
    this.el.appendChild(buttonContainer);
  }

  /**
   * Set callback for when "View Results" button is clicked
   */
  onViewResults(callback: () => void): void {
    this.onViewResultsCallback = callback;
  }
}

