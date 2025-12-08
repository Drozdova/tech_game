/**
 * QuestionPage - Page displaying a single question with answer variants
 */

import { GameEngine } from '../game_engine.js';

export class QuestionPage {
  el: HTMLElement;
  private questionTitle: string;
  private questionPrice: number;
  private variantsContainer: HTMLElement;
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
        alert(`Ошибка: ${error}`);
        allButtons.forEach(btn => {
          (btn as HTMLButtonElement).disabled = false;
        });
        return;
      }

      const isCorrect = result as boolean;
      
      if (isCorrect) {
        button.classList.add('correct');
        setTimeout(() => {
          alert('Правильно! 🎉');
          if (this.onAnswerCallback) {
            this.onAnswerCallback(true);
          }
        }, 500);
      } else {
        button.classList.add('incorrect');
        setTimeout(() => {
          alert('Неправильно 😢');
          if (this.onAnswerCallback) {
            this.onAnswerCallback(false);
          }
        }, 500);
      }
    });
  }

  /**
   * Set callback for when answer is submitted
   */
  onAnswer(callback: (isCorrect: boolean) => void): void {
    this.onAnswerCallback = callback;
  }
}

