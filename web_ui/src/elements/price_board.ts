/**
 * PriceBoard - Page displaying question prices as buttons
 * After selecting a category, shows prices. Clicking a price opens the question.
 */

import { GameEngine } from '../game_engine.js';

export class PriceBoard {
  el: HTMLElement;
  private pricesContainer: HTMLElement;
  private onPriceSelectCallback: ((question: string, price: number) => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'price-board';

    // Create title
    const title = document.createElement('h1');
    title.className = 'board-title';
    title.textContent = 'Выберите вопрос';
    this.el.appendChild(title);

    // Create prices grid container
    this.pricesContainer = document.createElement('div');
    this.pricesContainer.className = 'prices-grid';
    this.el.appendChild(this.pricesContainer);

    // Load prices
    this.loadPrices();
  }

  /**
   * Load prices from server and display them
   */
  private loadPrices(): void {
    this.pricesContainer.innerHTML = '<div class="loading-text">Загрузка...</div>';

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

        this.pricesContainer.innerHTML = '';

        const questions = questionsResult as string[];
        const prices = pricesResult as number[];

        // Check each question if it's used and create price cards
        questions.forEach((questionTitle, index) => {
          GameEngine.call('is_used', [questionTitle], (usedResult, usedError) => {
            const isUsed = usedResult as boolean;
            this.createPriceCard(questionTitle, prices[index], isUsed);
          });
        });
      });
    });
  }

  /**
   * Create a price card
   */
  private createPriceCard(questionTitle: string, price: number, isUsed: boolean): void {
    const card = document.createElement('div');
    card.className = 'price-card';
    
    if (isUsed) {
      card.classList.add('used');
      card.textContent = '';
    } else {
      card.textContent = `${price}`;
      card.onclick = () => {
        if (this.onPriceSelectCallback) {
          this.onPriceSelectCallback(questionTitle, price);
        }
      };
    }

    this.pricesContainer.appendChild(card);
  }

  /**
   * Set callback for when price is selected
   */
  onPriceSelect(callback: (question: string, price: number) => void): void {
    this.onPriceSelectCallback = callback;
  }

}
