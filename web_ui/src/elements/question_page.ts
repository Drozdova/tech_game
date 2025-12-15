/**
 * QuestionPage - Page displaying a single question with answer variants
 */

import { GameEngine } from '../game_engine.js';

export class QuestionPage {
  el: HTMLElement;
  private questionTitle: string;
  private questionPrice: number;
  private variantsContainer: HTMLElement;
  private resultContainer: HTMLElement;
  private onAnswerCallback: ((isCorrect: boolean) => void) | null = null;

  constructor(questionTitle: string, questionPrice: number) {
    this.questionTitle = questionTitle;
    this.questionPrice = questionPrice;

    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'question-page';

    // Create question title
    const titleEl = document.createElement('h1');
    titleEl.className = 'question-text';
    titleEl.textContent = questionTitle;
    this.el.appendChild(titleEl);

    // Create variants container
    this.variantsContainer = document.createElement('div');
    this.variantsContainer.className = 'variants-container';
    this.el.appendChild(this.variantsContainer);

    // Create result container
    this.resultContainer = document.createElement('div');
    this.resultContainer.className = 'result-container';
    this.el.appendChild(this.resultContainer);

    // Load variants
    this.loadVariants();
  }

  /**
   * Load answer variants from server
   */
  private loadVariants(): void {
    this.variantsContainer.innerHTML = '<div class="loading-text">Загрузка вариантов...</div>';

    GameEngine.call('get_variants_for_question', [this.questionTitle], (result, error) => {
      if (error) {
        this.variantsContainer.innerHTML = `<div class="error-text">Ошибка: ${error}</div>`;
        return;
      }

      this.displayVariants(result as string[]);
    });
  }

  /**
   * Display answer variants as buttons
   */
  private displayVariants(variants: string[]): void {
    this.variantsContainer.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'variants-title';
    title.textContent = 'Выберите ответ:';
    this.variantsContainer.appendChild(title);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'variants-buttons';

    variants.forEach((variant) => {
      const button = document.createElement('button');
      button.className = 'variant-button';
      button.textContent = variant;
      button.onclick = () => this.onVariantClick(variant, button);
      buttonsContainer.appendChild(button);
    });

    this.variantsContainer.appendChild(buttonsContainer);

    // Closing bracket
    const closingBracket = document.createElement('div');
    closingBracket.className = 'variants-closing';
    closingBracket.textContent = ']';
    this.variantsContainer.appendChild(closingBracket);
  }

  /**
   * Handle variant button click
   */
  private onVariantClick(answer: string, button: HTMLButtonElement): void {
    // Disable all buttons while waiting for response
    const allButtons = this.variantsContainer.querySelectorAll('.variant-button');
    allButtons.forEach(btn => {
      (btn as HTMLButtonElement).disabled = true;
    });

    // Submit answer to server
    GameEngine.call('submit_answer', [this.questionTitle, answer, this.questionPrice], (result, error) => {
      if (error) {
        this.showResult(`Ошибка: ${error}`, 'error');
        allButtons.forEach(btn => {
          (btn as HTMLButtonElement).disabled = false;
        });
        return;
      }

      const isCorrect = result as boolean;
      
      if (isCorrect) {
        button.classList.add('correct');
        this.showCorrectPopup();
        setTimeout(() => {
          if (this.onAnswerCallback) {
            this.onAnswerCallback(true);
          }
        }, 3000);
      } else {
        button.classList.add('incorrect');
        this.showIncorrectPopup();
        setTimeout(() => {
          if (this.onAnswerCallback) {
            this.onAnswerCallback(false);
          }
        }, 3000);
      }
    });
  }

  /**
   * Show result message
   */
  private showResult(message: string, type: 'correct' | 'incorrect' | 'error'): void {
    this.resultContainer.innerHTML = '';
    this.resultContainer.className = `result-container result-${type}`;
    
    const resultMessage = document.createElement('div');
    resultMessage.className = 'result-message';
    resultMessage.textContent = message;
    this.resultContainer.appendChild(resultMessage);
  }

  /**
   * Show beautiful popup for correct answer
   */
  private showCorrectPopup(): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'correct-popup';
    
    // Create icon
    const icon = document.createElement('div');
    icon.className = 'popup-icon popup-icon-correct';
    icon.textContent = '✓';
    
    // Create title
    const title = document.createElement('div');
    title.className = 'popup-title popup-title-correct';
    title.textContent = 'Правильно!';
    
    popup.appendChild(icon);
    popup.appendChild(title);
    overlay.appendChild(popup);
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('popup-visible');
    });
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.classList.add('popup-closing');
        setTimeout(() => {
          overlay.remove();
        }, 300);
      }
    }, 3000);
  }

  /**
   * Show beautiful popup for incorrect answer
   */
  private showIncorrectPopup(): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'incorrect-popup';
    
    // Create icon
    const icon = document.createElement('div');
    icon.className = 'popup-icon';
    icon.textContent = '✗';
    
    // Create title
    const title = document.createElement('div');
    title.className = 'popup-title';
    title.textContent = 'Неправильно';
    
    popup.appendChild(icon);
    popup.appendChild(title);
    overlay.appendChild(popup);
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('popup-visible');
    });
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.classList.add('popup-closing');
        setTimeout(() => {
          overlay.remove();
        }, 300);
      }
    }, 3000);
  }

  /**
   * Set callback for when answer is submitted
   */
  onAnswer(callback: (isCorrect: boolean) => void): void {
    this.onAnswerCallback = callback;
  }
}

