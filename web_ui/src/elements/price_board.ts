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
  private totalQuestions: number = 0;
  private loadedQuestions: number = 0;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'price-board';

    // Create title
    const title = document.createElement('h1');
    title.className = 'board-title';
    title.textContent = 'SELECT QUESTION';
    this.el.appendChild(title);

    // Create table wrapper (centered)
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'prices-table-wrapper';

    // Create HTML table
    const table = document.createElement('table');
    table.className = 'prices-table';
    this.pricesContainer = table;
    
    // Table body will be created dynamically based on row count
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    this.el.appendChild(tableWrapper);

    // Load prices (will create table structure dynamically)
    this.loadPrices();
  }

  /**
   * Load prices from server and display them
   */
  private loadPrices(): void {
    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-text';
    loadingDiv.textContent = 'Загрузка вопросов...';
    this.el.appendChild(loadingDiv);

    // First, get row count from backend to create table structure
    GameEngine.call('get_row_count', [], (rowCountResult, rowCountError) => {
      // Remove loading message
      loadingDiv.remove();

      if (rowCountError) {
        console.error('Failed to get row count:', rowCountError);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-text';
        errorDiv.textContent = `Ошибка загрузки количества строк: ${rowCountError}`;
        this.el.appendChild(errorDiv);
        return;
      }

      const totalRows = rowCountResult as number;
      console.log('Row count received:', totalRows);
      
      if (totalRows <= 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-text';
        errorDiv.textContent = 'Нет строк для отображения';
        this.el.appendChild(errorDiv);
        return;
      }
      
      // Create table structure with correct number of rows
      this.createTableStructure(totalRows);
      
      // Load row names
      this.loadRowNames(totalRows);
      
      // Load questions and prices
      GameEngine.call('get_current_questions', [], (questionsResult, questionsError) => {
        if (questionsError) {
          console.error('Failed to get questions:', questionsError);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-text';
          errorDiv.textContent = `Ошибка загрузки вопросов: ${questionsError}`;
          this.el.appendChild(errorDiv);
          return;
        }

        GameEngine.call('get_prices', [], (pricesResult, pricesError) => {
          if (pricesError) {
            console.error('Failed to get prices:', pricesError);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-text';
            errorDiv.textContent = `Ошибка загрузки цен: ${pricesError}`;
            this.el.appendChild(errorDiv);
            return;
          }

          const questions = questionsResult as string[];
          const prices = pricesResult as number[];

          console.log('Questions loaded:', questions.length, 'Prices loaded:', prices.length);

          if (questions.length === 0) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-text';
            errorDiv.textContent = 'Нет вопросов в выбранной категории';
            this.el.appendChild(errorDiv);
            return;
          }

          // Track loading progress
          this.totalQuestions = questions.length;
          this.loadedQuestions = 0;

          // Process each question
          questions.forEach((questionTitle, index) => {
            const price = prices[index];
            
            // Get position from backend
            GameEngine.call('get_question_position', [questionTitle], (posResult, posError) => {
              if (posError) {
                console.error('Failed to get position for question:', questionTitle, posError);
                return;
              }
              
              const position = posResult as {row: number, column: number};
              // Backend returns 0-based indices, UI uses 1-based, so add 1
              const row = position.row + 1;
              const col = position.column + 1;
              
              console.log(`Question "${questionTitle}" at row ${row}, col ${col}, price ${price}`);
              
              // Check if used
              GameEngine.call('is_used', [questionTitle], (usedResult, usedError) => {
                if (usedError) {
                  console.error('Failed to check if used for question:', questionTitle, usedError);
                  return;
                }
                const isUsed = usedResult as boolean;
                this.fillCell(row, col, questionTitle, price, isUsed);
                
                // Track loading and adjust centering when all questions are loaded
                this.loadedQuestions++;
                if (this.loadedQuestions === this.totalQuestions) {
                  // Wait a bit for DOM to update, then adjust centering
                  setTimeout(() => {
                    this.adjustTableCentering();
                  }, 100);
                }
              });
            });
          });
        });
      });
    });
  }

  /**
   * Create table structure with specified number of rows
   */
  private createTableStructure(totalRows: number): void {
    const tbody = this.pricesContainer.querySelector('tbody');
    if (!tbody) return;

    // Clear any existing rows
    tbody.innerHTML = '';
    this.rowLabels.clear();
    this.gridCells.clear();

    // Create rows with row headers and cells
    for (let row = 1; row <= totalRows; row++) {
      const tr = document.createElement('tr');
      
      // Create row header (th)
      const rowHeader = document.createElement('th');
      rowHeader.className = 'row-label';
      rowHeader.dataset.row = String(row);
      rowHeader.scope = 'row';
      tr.appendChild(rowHeader);
      this.rowLabels.set(row, rowHeader);
      
      // Create cells for this row (td) - always 3 columns
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
  }

  /**
   * Load row names from backend and display them
   */
  private loadRowNames(totalRows: number): void {
    let loadedCount = 0;
    
    // Load names for all rows (backend uses 0-based, UI uses 1-based)
    for (let row = 0; row < totalRows; row++) {
      GameEngine.call('get_row_name', [row], (nameResult, nameError) => {
        if (nameError) {
          console.error(`Failed to get row name for row ${row}:`, nameError);
          loadedCount++;
          // Still check if all loaded even if some failed
          if (loadedCount === totalRows) {
            this.adjustTableCentering();
          }
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
   * Adjust table centering so that the price cards (not including row labels) are centered
   * relative to the page title. We shift the table left by the full width of row labels column
   * plus half of the spacing between labels and prices.
   */
  private adjustTableCentering(): void {
    // Wait for browser to render the table with text content
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Find the maximum width of all row labels (they might have different widths)
        let maxLabelWidth = 0;
        this.rowLabels.forEach((label) => {
          const width = label.offsetWidth;
          if (width > maxLabelWidth) {
            maxLabelWidth = width;
          }
        });

        if (maxLabelWidth === 0) {
          // If no labels found, try again later
          setTimeout(() => this.adjustTableCentering(), 100);
          return;
        }
        
        // Get the first td element to calculate its padding-left
      const firstRowLabel = this.rowLabels.get(1);
      if (!firstRowLabel) return;

        const firstRow = firstRowLabel.parentElement;
        if (!firstRow) return;
        const firstTd = firstRow.querySelector('td:first-of-type') as HTMLElement;
        if (!firstTd) return;
        
        const computedStyle = window.getComputedStyle(firstTd);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        
        // Shift table left by maximum width of labels column + half of spacing
        // This centers the price cards (not the labels) relative to the title
        const shiftAmount = maxLabelWidth + (paddingLeft / 2);
        
      const table = this.pricesContainer as HTMLTableElement;
      if (table) {
          table.style.transform = `translateX(-${shiftAmount}px)`;
      }
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
