// npx ng test --include='**/text-input.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from './text-input.component';
import { ICONS } from '@core/constants/icons.constants';
import { MESSAGES } from '@core/constants/messages.constants';

describe('TextInputComponent', () => {
  const createControl = (initialValue = '') =>
    new FormControl(initialValue, [Validators.required]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent, ReactiveFormsModule],
    }).compileComponents();
  });

  const createFixture = (control: FormControl = createControl()) => {
    const fixture = TestBed.createComponent(TextInputComponent);
    fixture.componentInstance.control = control;
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose icons and MESSAGES from constants', () => {
    const { component } = createFixture();
    expect(component.icons).toBeDefined();
    expect(component.MESSAGES).toBe(MESSAGES);
  });

  it('should have default inputs', () => {
    const { component } = createFixture();
    expect(component.type).toBe('text');
    expect(component.icon).toBe(ICONS.PERSON);
    expect(component.autocomplete).toBe('');
  });

  it('should render label', () => {
    const { fixture, component } = createFixture();
    component.label = 'First Name';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('First Name');
  });

  it('should bind formControl to input', () => {
    const control = createControl('John');
    const { fixture } = createFixture(control);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.value).toBe('John');
  });

  it('should use ariaLabel when provided', () => {
    const { fixture, component } = createFixture();
    component.ariaLabel = 'Enter your name';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Enter your name');
  });

  it('should fallback aria-label to label when ariaLabel is empty', () => {
    const { fixture, component } = createFixture();
    component.label = 'Name';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Name');
  });

  it('should render icon when provided', () => {
    const { fixture, component } = createFixture();
    component.icon = ICONS.PERSON;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icon = el.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe(ICONS.PERSON);
  });

  it('should bind type to input', () => {
    const { fixture, component } = createFixture();
    component.type = 'email';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('type')).toBe('email');
  });

  it('should return empty string from errorMessage when control has no errors', () => {
    const control = createControl('John');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe('');
  });

  it('should return REQUIRED_FIELD from errorMessage when required error', () => {
    const control = createControl('');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.REQUIRED_FIELD);
  });

  it('should return false from hasError when control is valid', () => {
    const control = createControl('John');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.hasError).toBe(false);
  });

  it('should return false from hasError when control invalid but not touched', () => {
    const control = createControl('');
    const { component } = createFixture(control);
    expect(component.hasError).toBe(false);
  });

  it('should return true from hasError when control invalid and touched', () => {
    const control = createControl('');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.hasError).toBe(true);
  });

  it('should render mat-error when hasError is true', () => {
    const control = createControl('');
    const { fixture } = createFixture(control);
    control.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const matError = el.querySelector('mat-error');
    expect(matError).toBeTruthy();
    expect(matError?.textContent?.trim()).toBe(MESSAGES.REQUIRED_FIELD);
  });
});
