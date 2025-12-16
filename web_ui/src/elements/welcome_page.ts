/**
 * WelcomePage - Landing page with game title and start button
 */

export class WelcomePage {
  el: HTMLElement;
  createTeamsButton: HTMLElement | null = null;
  startGameButton: HTMLElement | null = null;
  private onCreateTeamsCallback: (() => void) | null = null;
  private onStartGameCallback: (() => void) | null = null;

  constructor(showStartButton: boolean = false) {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'welcome-page';

    // Create title container with glow effect
    const titleContainer = document.createElement('div');
    titleContainer.className = 'welcome-title-container';

    // Main title
    const title = document.createElement('h1');
    title.className = 'welcome-title';
    title.textContent = 'GRAND TECH QUIZ';
    titleContainer.appendChild(title);

    // Subtitle with tech accent
    const subtitle = document.createElement('div');
    subtitle.className = 'welcome-subtitle';
    subtitle.textContent = '// Технологическая викторина';
    titleContainer.appendChild(subtitle);

    this.el.appendChild(titleContainer);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'welcome-buttons';

    // Create teams button (only if start button is not shown)
    if (!showStartButton) {
      this.createTeamsButton = document.createElement('button');
      this.createTeamsButton.className = 'create-teams-button';
      this.createTeamsButton.textContent = 'Создать команды';
      this.createTeamsButton.onclick = () => {
        if (this.onCreateTeamsCallback) {
          this.onCreateTeamsCallback();
        }
      };
      buttonsContainer.appendChild(this.createTeamsButton);
    }

    // Create start game button (only if showStartButton is true)
    if (showStartButton) {
      this.startGameButton = document.createElement('button');
      this.startGameButton.className = 'start-game-button-welcome';
      this.startGameButton.textContent = 'Начать игру';
      this.startGameButton.onclick = () => {
        if (this.onStartGameCallback) {
          this.onStartGameCallback();
        }
      };
      buttonsContainer.appendChild(this.startGameButton);
    }

    this.el.appendChild(buttonsContainer);
  }

  /**
   * Set callback for when create teams button is clicked
   */
  onCreateTeams(callback: () => void): void {
    this.onCreateTeamsCallback = callback;
  }

  /**
   * Set callback for when start game button is clicked
   */
  onStartGame(callback: () => void): void {
    this.onStartGameCallback = callback;
  }
}

