/**
 * WelcomePage - Landing page with game title and action buttons
 */

export class WelcomePage {
  el: HTMLElement;
  private newGameButton: HTMLElement | null = null;
  private continueGameButton: HTMLElement | null = null;
  private startGameButton: HTMLElement | null = null;
  private onCreateTeamsCallback: (() => void) | null = null;
  private onContinueGameCallback: (() => void) | null = null;
  private onStartGameCallback: (() => void) | null = null;

  constructor(hasSavedGame: boolean = false, showStartButton: boolean = false) {
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
    subtitle.textContent = '// TECH QUIZ';
    titleContainer.appendChild(subtitle);

    this.el.appendChild(titleContainer);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'welcome-buttons';

    // If showStartButton is true, show "START GAME" button (after teams created)
    if (showStartButton) {
      this.startGameButton = document.createElement('button');
      this.startGameButton.className = 'start-game-button-welcome';
      this.startGameButton.textContent = 'НАЧАТЬ ИГРУ';
      this.startGameButton.onclick = () => {
        if (this.onStartGameCallback) {
          this.onStartGameCallback();
        }
      };
      buttonsContainer.appendChild(this.startGameButton);
    } else {
      // Otherwise show "NEW GAME" button
      this.newGameButton = document.createElement('button');
      this.newGameButton.className = 'create-teams-button';
      this.newGameButton.textContent = 'НОВАЯ ИГРА';
      this.newGameButton.onclick = () => {
        if (this.onCreateTeamsCallback) {
          this.onCreateTeamsCallback();
        }
      };
      buttonsContainer.appendChild(this.newGameButton);

      // Show "Continue Game" button only if there's a saved game
      if (hasSavedGame) {
        this.continueGameButton = document.createElement('button');
        this.continueGameButton.className = 'continue-game-button-welcome';
        this.continueGameButton.textContent = 'ПРОДОЛЖИТЬ ИГРУ';
        this.continueGameButton.onclick = () => {
          if (this.onContinueGameCallback) {
            this.onContinueGameCallback();
          }
        };
        buttonsContainer.appendChild(this.continueGameButton);
      }
    }

    this.el.appendChild(buttonsContainer);
  }

  /**
   * Set callback for when new game button is clicked
   */
  onCreateTeams(callback: () => void): void {
    this.onCreateTeamsCallback = callback;
  }

  /**
   * Set callback for when continue game button is clicked
   */
  onContinueGame(callback: () => void): void {
    this.onContinueGameCallback = callback;
  }

  /**
   * Set callback for when start game button is clicked
   */
  onStartGame(callback: () => void): void {
    this.onStartGameCallback = callback;
  }
}

