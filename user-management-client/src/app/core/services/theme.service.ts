import { Injectable, signal, effect } from '@angular/core';
import { Theme } from '@core/enums/theme.enum';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { LocalStorageService } from '@core/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = StorageKeys.THEME;
  private readonly defaultTheme = Theme.LIGHT;
  
  public readonly currentTheme = signal<Theme>(Theme.LIGHT);

  constructor(private localStorageService: LocalStorageService) {
    // Initialize theme after service is ready
    const initialTheme = this.getInitialTheme();
    this.currentTheme.set(initialTheme);
    
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.localStorageService.setItem(this.themeKey, theme);
    });
  }

  private getInitialTheme(): Theme {
    try {
      const savedTheme = this.localStorageService.getItem(this.themeKey) as Theme;
      if (savedTheme && Object.values(Theme).includes(savedTheme)) {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Error reading theme from localStorage:', error);
    }
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? Theme.DARK : Theme.LIGHT;
    }
    
    return this.defaultTheme;
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    this.currentTheme.set(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      htmlElement.classList.remove(Theme.LIGHT, Theme.DARK);
      htmlElement.classList.add(theme);
      htmlElement.setAttribute('data-theme', theme);
    }
  }
}
