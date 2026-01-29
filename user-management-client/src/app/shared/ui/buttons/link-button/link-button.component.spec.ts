// npx ng test --include='**/link-button.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LinkButtonComponent } from './link-button.component';
import { MaterialColor } from '@core/enums/material-color.enum';

describe('LinkButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkButtonComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(LinkButtonComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should have default inputs', () => {
    const { component } = createFixture();
    expect(component.route).toBe('');
    expect(component.label).toBe('');
    expect(component.icon).toBe('');
    expect(component.tooltip).toBe('');
    expect(component.variant).toBe('flat');
    expect(component.color).toBe(MaterialColor.PRIMARY);
    expect(component.showIcon).toBe(true);
  });

  it('should render flat link by default', () => {
    const { fixture, component } = createFixture();
    component.route = '/home';
    component.label = 'Home';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a.link-button--flat');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toContain('Home');
  });

  it('should render raised link when variant is raised', () => {
    const { fixture, component } = createFixture();
    component.route = '/dashboard';
    component.label = 'Dashboard';
    component.variant = 'raised';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a.link-button--raised');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toContain('Dashboard');
  });

  it('should render stroked link when variant is stroked', () => {
    const { fixture, component } = createFixture();
    component.route = '/settings';
    component.label = 'Settings';
    component.variant = 'stroked';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a.link-button--stroked');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toContain('Settings');
  });

  it('should render label and icon when showIcon is true', () => {
    const { fixture, component } = createFixture();
    component.route = '/edit';
    component.label = 'Edit';
    component.icon = 'edit';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const matIcon = el.querySelector('mat-icon');
    expect(matIcon?.textContent?.trim()).toBe('edit');
    expect(el.textContent).toContain('Edit');
  });

  it('should not render icon when showIcon is false', () => {
    const { fixture, component } = createFixture();
    component.route = '/page';
    component.label = 'Page';
    component.icon = 'link';
    component.showIcon = false;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const matIcon = el.querySelector('mat-icon');
    expect(matIcon).toBeFalsy();
    expect(el.textContent).toContain('Page');
  });

  it('should bind routerLink to route', () => {
    const { fixture, component } = createFixture();
    component.route = '/users/1';
    component.label = 'User';
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(link?.getAttribute('href')).toContain('/users/1');
  });

  it('should accept color input', () => {
    const { component } = createFixture();
    component.color = MaterialColor.WARN;
    expect(component.color).toBe(MaterialColor.WARN);
  });
});
