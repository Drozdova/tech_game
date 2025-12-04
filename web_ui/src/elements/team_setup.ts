/**
 * TeamSetup - Form for creating teams before starting the game
 */

import { GameEngine } from '../game_engine.js';

export class TeamSetup {
  el: HTMLElement;
  private teams: string[] = [];
  private onStartCallback: ((teams: string[]) => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'team-setup';

    // Create title
    const title = document.createElement('h1');
    title.className = 'setup-title';
    title.textContent = 'Создание команд';
    this.el.appendChild(title);

    // Create teams container
    const teamsContainer = document.createElement('div');
    teamsContainer.className = 'teams-list';
    teamsContainer.id = 'teams-list';
    this.el.appendChild(teamsContainer);

    // Add two team inputs by default
    this.addTeamInput();
    this.addTeamInput();

    // Create add button
    const addButton = document.createElement('button');
    addButton.className = 'add-team-button';
    addButton.textContent = '+ Добавить команду';
    addButton.onclick = () => this.addTeamInput();
    this.el.appendChild(addButton);

    // Create start button
    const startButton = document.createElement('button');
    startButton.className = 'start-game-button';
    startButton.textContent = 'Начать игру';
    startButton.onclick = () => this.startGame();
    this.el.appendChild(startButton);
  }

  /**
   * Add a new team input field
   */
  private addTeamInput(): void {
    const teamsContainer = this.el.querySelector('#teams-list') as HTMLElement;
    if (!teamsContainer) return;

    const teamItem = document.createElement('div');
    teamItem.className = 'team-input-item';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'team-input';
    input.placeholder = `Команда ${teamsContainer.children.length + 1}`;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-team-button';
    removeButton.textContent = '×';
    removeButton.onclick = () => {
      if (teamsContainer.children.length > 1) {
        teamsContainer.removeChild(teamItem);
      }
    };

    teamItem.appendChild(input);
    teamItem.appendChild(removeButton);
    teamsContainer.appendChild(teamItem);
  }

  /**
   * Collect team names and start the game
   */
  private startGame(): void {
    const teamsContainer = this.el.querySelector('#teams-list') as HTMLElement;
    if (!teamsContainer) return;

    // Collect team names from inputs
    const inputs = teamsContainer.querySelectorAll('.team-input') as NodeListOf<HTMLInputElement>;
    this.teams = [];
    
    inputs.forEach(input => {
      const teamName = input.value.trim();
      if (teamName) {
        this.teams.push(teamName);
      }
    });

    // Validate
    if (this.teams.length === 0) {
      alert('Добавьте хотя бы одну команду!');
      return;
    }

    // Send teams to server
    GameEngine.call('set_teams', [this.teams], (result, error) => {
      if (error) {
        console.error('Failed to set teams:', error);
        alert(`Ошибка: ${error}`);
        return;
      }

      // Call the callback to start the game
      if (this.onStartCallback) {
        this.onStartCallback(this.teams);
      }
    });
  }

  /**
   * Set callback for when game starts
   */
  onStart(callback: (teams: string[]) => void): void {
    this.onStartCallback = callback;
  }
}

