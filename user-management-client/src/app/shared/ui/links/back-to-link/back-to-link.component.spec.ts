// npx ng test --include='**/back-to-link.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BackToLinkComponent } from './back-to-link.component';
import { LABELS } from '@core/constants/labels.constants';

describe('BackToLinkComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackToLinkComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(BackToLinkComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose icons and labels from constants', () => {
    const { component } = createFixture();
    expect(component.icons).toBeDefined();
    expect(component.labels).toBe(LABELS);
  });

  it('should have default inputs', () => {
    const { component } = createFixture();
    expect(component.route).toBe('');
    expect(component.label).toBe('');
    expect(component.tooltip).toBe('');
  });

  it('should render link with back-to-link class', () => {
    const { fixture, component } = createFixture();
    component.route = '/login';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a.back-to-link');
    expect(link).toBeTruthy();
  });

  it('should render label fallback to BACK_TO_LOGIN when label is empty', () => {
    const { fixture, component } = createFixture();
    component.route = '/login';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(LABELS.BACK_TO_LOGIN);
  });

  it('should render custom label when provided', () => {
    const { fixture, component } = createFixture();
    component.route = '/profile';
    component.label = 'Back to Profile';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Back to Profile');
  });

  it('should render arrow back icon', () => {
    const { fixture, component } = createFixture();
    component.route = '/login';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icon = el.querySelector('.back-to-link__icon');
    expect(icon?.textContent?.trim()).toBe(component.icons.ARROW_BACK);
  });

  it('should bind routerLink to route', () => {
    const { fixture, component } = createFixture();
    component.route = '/dashboard';
    component.label = 'Dashboard';
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(link?.getAttribute('href')).toContain('/dashboard');
  });
});
