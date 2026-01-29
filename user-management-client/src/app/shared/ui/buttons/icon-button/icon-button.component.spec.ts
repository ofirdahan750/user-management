// npx ng test --include='**/icon-button.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IconButtonComponent } from './icon-button.component';
import { MaterialColor } from '@core/enums/material-color.enum';

describe('IconButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(IconButtonComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should have default inputs', () => {
    const { component } = createFixture();
    expect(component.icon).toBe('');
    expect(component.tooltip).toBe('');
    expect(component.ariaLabel).toBe('');
    expect(component.disabled).toBe(false);
    expect(component.color).toBe(MaterialColor.PRIMARY);
    expect(component.type).toBe('button');
    expect(component.clickHandler).toBeUndefined();
  });

  it('should render icon in mat-icon', () => {
    const { fixture, component } = createFixture();
    component.icon = 'edit';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const matIcon = el.querySelector('mat-icon');
    expect(matIcon?.textContent?.trim()).toBe('edit');
  });

  it('should bind color and type to button', () => {
    const { fixture, component } = createFixture();
    component.icon = 'delete';
    component.color = MaterialColor.WARN;
    component.type = 'submit';
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.getAttribute('type')).toBe('submit');
    expect(component.color).toBe(MaterialColor.WARN);
  });

  it('should set aria-label from ariaLabel when provided', () => {
    const { fixture, component } = createFixture();
    component.icon = 'add';
    component.ariaLabel = 'Add item';
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Add item');
  });

  it('should fallback aria-label to tooltip when ariaLabel is empty', () => {
    const { fixture, component } = createFixture();
    component.icon = 'add';
    component.tooltip = 'Add new';
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Add new');
  });

  it('should disable button when disabled is true', () => {
    const { fixture, component } = createFixture();
    component.icon = 'save';
    component.disabled = true;
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(true);
  });

  it('should call clickHandler when button is clicked', () => {
    const { fixture, component } = createFixture();
    const handler = jasmine.createSpy('clickHandler');
    component.icon = 'done';
    component.clickHandler = handler;
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not throw when clicked without clickHandler', () => {
    const { fixture, component } = createFixture();
    component.icon = 'info';
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(() => button?.click()).not.toThrow();
  });
});
