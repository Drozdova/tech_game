/**
 * Page shown after all questions have been answered.
 */
export class GameOverPage {
  el: HTMLElement;
  private onViewResultsCallback: (() => void) | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'game-over-page';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'game-over-title-container';

    const title = document.createElement('h1');
    title.className = 'game-over-title';
    title.textContent = 'GAME OVER';
    titleContainer.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'game-over-subtitle';
    subtitle.textContent = '// ALL QUESTIONS ANSWERED';
    titleContainer.appendChild(subtitle);
    this.el.appendChild(titleContainer);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'game-over-button-container';

    const viewResultsButton = document.createElement('button');
    viewResultsButton.className = 'view-results-button';
    viewResultsButton.textContent = 'ПОКАЗАТЬ РЕЗУЛЬТАТЫ';
    viewResultsButton.addEventListener('click', () => {
      this.onViewResultsCallback?.();
    });

    buttonContainer.appendChild(viewResultsButton);
    this.el.appendChild(buttonContainer);
  }

  onViewResults(callback: () => void): void {
    this.onViewResultsCallback = callback;
  }
}
