/**
 * PriceBoard - Page displaying question prices as buttons
 * After selecting a category, shows prices. Clicking a price opens the question.
 * Uses grid positions from backend (row, col)
 */

import { GameEngine } from '../game_engine.js';

export class PriceBoard {
  el: HTMLElement;
  private pricesContainer: HTMLElement;
  private onPriceSelectCallback: ((question: string, price: number) => void) | null = null;
  private gridCells: Map<string, HTMLElement> = new Map();

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'price-board';

    // Create title
    const title = document.createElement('h1');
    title.className = 'board-title';
    title.textContent = 'Выберите вопрос';
    this.el.appendChild(title);

    // Create prices grid container (3 rows x 3 cols)
    this.pricesContainer = document.createElement('div');
    this.pricesContainer.className = 'prices-grid';
    
    // Pre-create empty cells for 3x3 grid
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        const cell = document.createElement('div');
        cell.className = 'price-card empty';
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        this.pricesContainer.appendChild(cell);
        this.gridCells.set(`${row}-${col}`, cell);
      }
    }
    
    this.el.appendChild(this.pricesContainer);

    // Load prices
    this.loadPrices();
  }

  /**
   * Load prices from server and display them
   */
  private loadPrices(): void {
    // Load questions list and prices
    GameEngine.call('get_current_questions', [], (questionsResult, questionsError) => {
      if (questionsError) {
        this.pricesContainer.innerHTML = `<div class="error-text">Ошибка: ${questionsError}</div>`;
        return;
      }

      GameEngine.call('get_prices', [], (pricesResult, pricesError) => {
        if (pricesError) {
          this.pricesContainer.innerHTML = `<div class="error-text">Ошибка: ${pricesError}</div>`;
          return;
        }

        const questions = questionsResult as string[];
        const prices = pricesResult as number[];

        // For each question, get position and fill the grid
        questions.forEach((questionTitle, index) => {
          const price = prices[index];
          
          // Get position from backend
          GameEngine.call('get_question_position', [price], (posResult, posError) => {
            if (posError) {
              console.error('Failed to get position:', posError);
              return;
            }
            
            const position = posResult as number[];
            const row = position[0];
            const col = position[1];
            
            // Check if used
            GameEngine.call('is_used', [questionTitle], (usedResult, usedError) => {
              const isUsed = usedResult as boolean;
              this.fillCell(row, col, questionTitle, price, isUsed);
            });
          });
        });
      });
    });
  }

  /**
   * Fill a grid cell with question data
   */
  private fillCell(row: number, col: number, questionTitle: string, price: number, isUsed: boolean): void {
    const cell = this.gridCells.get(`${row}-${col}`);
    if (!cell) return;

    cell.classList.remove('empty');
    
    if (isUsed) {
      cell.classList.add('used');
      cell.textContent = '';
    } else {
      cell.textContent = `${price}`;
      cell.onclick = () => {
        if (this.onPriceSelectCallback) {
          this.onPriceSelectCallback(questionTitle, price);
        }
      };
    }
  }

  /**
   * Set callback for when price is selected
   */
  onPriceSelect(callback: (question: string, price: number) => void): void {
    this.onPriceSelectCallback = callback;
  }

}
