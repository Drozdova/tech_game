/**
 * TeamSetup - Form for creating teams before starting the game
 */

import { GameEngine } from '../game_engine.js';

export class TeamSetup {
  el: HTMLElement;
  doneButton: HTMLElement;
  private teams: string[] = [];
  private onDoneCallback: (() => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'team-setup';

    // Create title
    const title = document.createElement('h1');
    title.className = 'setup-title';
    title.textContent = 'CREATE TEAMS';
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

    // Create done button (inside container)
    this.doneButton = document.createElement('button');
    this.doneButton.className = 'done-teams-button';
    this.doneButton.textContent = 'Готово';
    this.doneButton.onclick = () => this.done();
    this.el.appendChild(this.doneButton);
  }

  /**
   * Add a new team input field
   */
  private addTeamInput(): void {
    const teamsContainer = this.el.querySelector('#teams-list') as HTMLElement;
    if (!teamsContainer) return;

    const teamItem = document.createElement('div');
    teamItem.className = 'team-input-item';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'team-input-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'team-input';
    input.placeholder = `Команда ${teamsContainer.children.length + 1}`;
    input.oninput = () => this.validateDuplicates();

    const errorMessage = document.createElement('span');
    errorMessage.className = 'team-input-error';
    errorMessage.textContent = 'Команда с таким названием уже существует';

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(errorMessage);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-team-button';
    removeButton.textContent = '×';
    removeButton.onclick = () => {
      if (teamsContainer.children.length > 1) {
        teamsContainer.removeChild(teamItem);
        this.validateDuplicates();
      }
    };

    teamItem.appendChild(inputWrapper);
    teamItem.appendChild(removeButton);
    teamsContainer.appendChild(teamItem);
  }

  /**
   * Collect team names and save them
   */
  private done(): void {
    const teamsContainer = this.el.querySelector('#teams-list') as HTMLElement;
    if (!teamsContainer) return;

    // Collect team names from inputs
    const inputs = teamsContainer.querySelectorAll('.team-input') as NodeListOf<HTMLInputElement>;
    this.teams = [];
    
    inputs.forEach(input => {
      const teamName = input.value.trim() || input.placeholder.trim();
      this.teams.push(teamName);
    });

    // Validate
    if (this.teams.length === 0) {
      alert('Добавьте хотя бы одну команду!');
      return;
    }

    // Check for duplicates
    const uniqueTeams = new Set(this.teams.map(t => t.toLowerCase()));
    if (uniqueTeams.size !== this.teams.length) {
      alert('Названия команд не должны повторяться!');
      return;
    }

    // Send teams to server
    GameEngine.call('set_teams', [this.teams], (result, error) => {
      if (error) {
        console.error('Failed to set teams:', error);
        alert(`Ошибка: ${error}`);
        return;
      }

      // Call the callback to return to welcome page
      if (this.onDoneCallback) {
        this.onDoneCallback();
      }
    });
  }

  /**
   * Check for duplicate team names and highlight them
   */
  private validateDuplicates(): void {
    const teamsContainer = this.el.querySelector('#teams-list') as HTMLElement;
    if (!teamsContainer) return;

    const inputs = teamsContainer.querySelectorAll('.team-input') as NodeListOf<HTMLInputElement>;
    const names: Map<string, HTMLInputElement[]> = new Map();

    // Group inputs by their trimmed lowercase value (preserve order)
    inputs.forEach(input => {
      const teamName = input.value.trim() || input.placeholder.trim();
      this.teams.push(teamName);      
    });

    // Reset all inputs first
    inputs.forEach(input => {
      input.classList.remove('error');
      const wrapper = input.closest('.team-input-wrapper');
      if (wrapper) {
        wrapper.classList.remove('has-error');
      }
    });

    // Mark only duplicates (not the first occurrence)
    names.forEach((inputList) => {
      if (inputList.length > 1) {
        // Skip the first one, mark only subsequent duplicates
        for (let i = 1; i < inputList.length; i++) {
          inputList[i].classList.add('error');
          const wrapper = inputList[i].closest('.team-input-wrapper');
          if (wrapper) {
            wrapper.classList.add('has-error');
          }
        }
      }
    });
  }

  /**
   * Set callback for when done button is clicked
   */
  onDone(callback: () => void): void {
    this.onDoneCallback = callback;
  }
}

