/**
 * PriceBoard - Page displaying question prices as buttons
 * After selecting a category, shows prices. Clicking a price opens the question.
 * Uses grid positions from backend (row, col)
 */

import { GameEngine } from '../game_engine.js';

export class PriceBoard {
  el: HTMLElement;
  private pricesContainer: HTMLElement;
  private rowLabels: Map<number, HTMLElement> = new Map();
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

    // Create table wrapper (centered)
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'prices-table-wrapper';

    // Create HTML table
    const table = document.createElement('table');
    table.className = 'prices-table';
    this.pricesContainer = table;
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Pre-create rows with row headers and cells for 3x3 grid
    for (let row = 1; row <= 3; row++) {
      const tr = document.createElement('tr');
      
      // Create row header (th)
      const rowHeader = document.createElement('th');
      rowHeader.className = 'row-label';
      rowHeader.dataset.row = String(row);
      rowHeader.scope = 'row';
      tr.appendChild(rowHeader);
      this.rowLabels.set(row, rowHeader);
      
      // Create cells for this row (td)
      for (let col = 1; col <= 3; col++) {
        const cell = document.createElement('td');
        const cellDiv = document.createElement('div');
        cellDiv.className = 'price-card empty';
        cellDiv.dataset.row = String(row);
        cellDiv.dataset.col = String(col);
        cell.appendChild(cellDiv);
        tr.appendChild(cell);
        this.gridCells.set(`${row}-${col}`, cellDiv);
      }
      
      tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    this.el.appendChild(tableWrapper);

    // Load prices
    this.loadPrices();
  }

  /**
   * Load prices from server and display them
   */
  private loadPrices(): void {
    // Load row names first
    this.loadRowNames();
    
    // Load questions list and prices
      GameEngine.call('get_current_questions', [], (questionsResult, questionsError) => {
        if (questionsError) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-text';
          errorDiv.textContent = `Ошибка: ${questionsError}`;
          this.el.appendChild(errorDiv);
          return;
        }

        GameEngine.call('get_prices', [], (pricesResult, pricesError) => {
          if (pricesError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-text';
            errorDiv.textContent = `Ошибка: ${pricesError}`;
            this.el.appendChild(errorDiv);
            return;
          }

        const questions = questionsResult as string[];
        const prices = pricesResult as number[];

        // For each question, get position and fill the grid
        questions.forEach((questionTitle, index) => {
          const price = prices[index];
          
          // Get position from backend
          GameEngine.call('get_question_position', [questionTitle], (posResult, posError) => {
            if (posError) {
              console.error('Failed to get position:', posError);
              return;
            }
            
            const position = posResult as {row: number, column: number};
            // Backend returns 0-based indices, UI uses 1-based, so add 1
            const row = position.row + 1;
            const col = position.column + 1;
            
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
   * Load row names from backend and display them
   */
  private loadRowNames(): void {
    let loadedCount = 0;
    const totalRows = 3;
    
    // Load names for rows 0, 1, 2 (backend uses 0-based)
    for (let row = 0; row < totalRows; row++) {
      GameEngine.call('get_row_name', [row], (nameResult, nameError) => {
        if (nameError) {
          console.error(`Failed to get row name for row ${row}:`, nameError);
          return;
        }
        
        const rowName = nameResult as string;
        const rowLabel = this.rowLabels.get(row + 1); // UI uses 1-based
        if (rowLabel) {
          rowLabel.textContent = rowName;
        }
        
        loadedCount++;
        // After all row names are loaded, adjust table centering
        if (loadedCount === totalRows) {
          this.adjustTableCentering();
        }
      });
    }
  }

  /**
   * Adjust table centering by applying negative transform translateX
   * equal to half the width of the first column (row labels)
   * This shifts the table relative to its current centered position
   */
  private adjustTableCentering(): void {
    // Wait for browser to render the table with text content
    requestAnimationFrame(() => {
      const firstRowLabel = this.rowLabels.get(1);
      if (!firstRowLabel) return;

      // Get actual width of the first column (th element)
      const firstColumnWidth = firstRowLabel.offsetWidth;
      
      // Apply negative transform translateX equal to half the column width
      // This shifts the table relative to its current centered position
      const table = this.pricesContainer as HTMLTableElement;
      if (table) {
        table.style.transform = `translateX(-${firstColumnWidth / 2}px)`;
      }
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
