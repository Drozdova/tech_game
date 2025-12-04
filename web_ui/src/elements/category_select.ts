/**
 * CategorySelect - Page for selecting a category before viewing questions
 */

import { GameEngine } from '../game_engine.js';

export class CategorySelect {
  el: HTMLElement;
  private onSelectCallback: ((category: string) => void) | null = null;

  constructor() {
    // Create main container
    this.el = document.createElement('div');
    this.el.className = 'category-select';

    // Create title
    const title = document.createElement('h1');
    title.className = 'category-title';
    title.textContent = 'Выберите категорию';
    this.el.appendChild(title);

    // Create categories container
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'categories-grid';
    categoriesContainer.id = 'categories-grid';
    this.el.appendChild(categoriesContainer);

    // Load categories from server
    this.loadCategories();
  }

  /**
   * Load categories from server
   */
  private loadCategories(): void {
    const container = this.el.querySelector('#categories-grid') as HTMLElement;
    if (!container) return;

    container.innerHTML = '<div class="loading-text">Загрузка категорий...</div>';

    GameEngine.call('get_category_list', [], (result, error) => {
      if (error) {
        container.innerHTML = `<div class="error-text">Ошибка загрузки: ${error}</div>`;
        return;
      }

      container.innerHTML = '';
      const categories = result as string[];

      categories.forEach(category => {
        const card = this.createCategoryCard(category);
        container.appendChild(card);
      });
    });
  }

  /**
   * Create a category card element
   */
  private createCategoryCard(categoryName: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.textContent = categoryName;
    card.onclick = () => this.onCategoryClick(categoryName);
    return card;
  }

  /**
   * Handle category click
   */
  private onCategoryClick(category: string): void {
    // Tell backend which category was selected
    GameEngine.call('set_category_questions', [category], (result, error) => {
      if (error) {
        console.error('Failed to set category:', error);
        alert(`Ошибка: ${error}`);
        return;
      }

      // Then notify the callback
      if (this.onSelectCallback) {
        this.onSelectCallback(category);
      }
    });
  }

  /**
   * Set callback for when category is selected
   */
  onSelect(callback: (category: string) => void): void {
    this.onSelectCallback = callback;
  }
}

