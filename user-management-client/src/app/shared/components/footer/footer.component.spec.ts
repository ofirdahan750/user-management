import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FooterComponent } from './footer.component';
import { URLS } from '@core/constants/urls.constants';

describe('FooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(FooterComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose URLS from constants', () => {
    const { component } = createFixture();
    expect(component.URLS).toBe(URLS);
    expect(component.URLS.LINKEDIN).toBe(URLS.LINKEDIN);
    expect(component.URLS.GITHUB).toBe(URLS.GITHUB);
  });

  it('should set currentYear to the current year', () => {
    const { component } = createFixture();
    const expectedYear = new Date().getFullYear();
    expect(component.currentYear).toBe(expectedYear);
  });

  it('should render copyright with current year', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const copyright = el.querySelector('.footer__copyright');
    expect(copyright?.textContent).toContain(component.currentYear.toString());
    expect(copyright?.textContent).toContain('Ofir Dahan');
    expect(copyright?.textContent).toContain('All rights reserved');
  });

  it('should render LinkedIn link with correct href and attributes and text content', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.footer__link');
    const linkedInLink = Array.from(links).find(
      (a) => a.getAttribute('href') === component.URLS.LINKEDIN
    ) as HTMLAnchorElement;
    expect(linkedInLink).toBeTruthy();
    expect(linkedInLink?.getAttribute('target')).toBe('_blank');
    expect(linkedInLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(linkedInLink?.getAttribute('aria-label')).toBe('LinkedIn Profile');
    expect(linkedInLink?.textContent?.trim()).toContain('LinkedIn');
  });

  it('should render GitHub link with correct href and attributes', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.footer__link');
    const githubLink = Array.from(links).find(
      (a) => a.getAttribute('href') === component.URLS.GITHUB
    ) as HTMLAnchorElement;
    expect(githubLink).toBeTruthy();
    expect(githubLink?.getAttribute('target')).toBe('_blank');
    expect(githubLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(githubLink?.getAttribute('aria-label')).toBe('GitHub Repository');
    expect(githubLink?.textContent?.trim()).toContain('GitHub');
  });
});
