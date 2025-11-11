/**
 * TemplateManager - Loads and manages HTML templates
 * 
 * Simple template loader that fetches HTML files and provides
 * cloned DOM nodes. Uses callbacks instead of promises.
 */

class TemplateManagerClass {
  private templates: Map<string, HTMLElement> = new Map();
  private basePath = 'src/templates/';

  /**
   * Load all templates automatically from templates.json manifest
   * @param onLoaded Callback when all templates are loaded
   */
  loadTemplates(onLoaded: () => void): void {
    // Load templates manifest
    fetch(`${this.basePath}templates.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load templates manifest');
        }
        return response.json();
      })
      .then((templateNames: string[]) => {
        console.log('Loading templates:', templateNames);

        if (templateNames.length === 0) {
          console.warn('No templates in manifest');
          onLoaded();
          return;
        }

        // Load all templates from manifest
        let loaded = 0;
        templateNames.forEach(name => {
          this.loadTemplate(name, () => {
            loaded++;
            if (loaded === templateNames.length) {
              onLoaded();
            }
          });
        });
      })
      .catch(error => {
        console.error('Failed to load templates:', error);
        onLoaded();
      });
  }

  /**
   * Load a single template
   * @param name Template name (without .html extension)
   * @param onLoaded Callback when template is loaded
   */
  private loadTemplate(name: string, onLoaded: () => void): void {
    const url = `${this.basePath}${name}.html`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${name}`);
        }
        return response.text();
      })
      .then(html => {
        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = html.trim();

        // Store the first element
        const element = container.firstElementChild as HTMLElement;
        if (element) {
          this.templates.set(name, element);
          console.log(`Template loaded: ${name}`);
        }

        onLoaded();
      })
      .catch(error => {
        console.error(`Error loading template ${name}:`, error);
        onLoaded(); // Still call callback to not block other templates
      });
  }

  /**
   * Get a cloned copy of a template
   * @param name Template name
   * @returns Cloned HTMLElement or null if not found
   */
  getTemplate(name: string): HTMLElement | null {
    const template = this.templates.get(name);
    if (!template) {
      console.error(`Template not found: ${name}`);
      return null;
    }
    return template.cloneNode(true) as HTMLElement;
  }
}

// Export singleton instance
export const TemplateManager = new TemplateManagerClass();



