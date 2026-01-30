// npx ng test --include='**/password-input.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PasswordInputComponent } from './password-input.component';
import { passwordStrengthValidator } from '@shared/validators/password-strength.validator';
import { AUTOCOMPLETE } from '@core/constants/autocomplete.constants';
import { MESSAGES } from '@core/constants/messages.constants';

describe('PasswordInputComponent', () => {
  const createControl = (initialValue = '') =>
    new FormControl(initialValue, [Validators.required, passwordStrengthValidator()]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, ReactiveFormsModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = (control: FormControl = createControl()) => {
    const fixture = TestBed.createComponent(PasswordInputComponent);
    fixture.componentInstance.control = control;
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose icons, MESSAGES, labels and ariaLabels from constants', () => {
    const { component } = createFixture();
    expect(component.icons).toBeDefined();
    expect(component.MESSAGES).toBe(MESSAGES);
    expect(component.labels).toBeDefined();
    expect(component.ariaLabels).toBeDefined();
  });

  it('should render label', () => {
    const { fixture, component } = createFixture();
    component.label = 'Password';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Password');
  });

  it('should bind formControl to input', () => {
    const control = createControl('ValidPass1');
    const { fixture } = createFixture(control);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.value).toBe('ValidPass1');
  });

  it('should use ariaLabel when provided', () => {
    const { fixture, component } = createFixture();
    component.ariaLabel = 'Enter your password';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Enter your password');
  });

  it('should have default autocomplete of NEW_PASSWORD', () => {
    const { component } = createFixture();
    expect(component.autocomplete).toBe(AUTOCOMPLETE.NEW_PASSWORD);
  });

  it('should bind autocomplete to input', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('autocomplete')).toBe(AUTOCOMPLETE.NEW_PASSWORD);
  });

  it('should fallback aria-label to label when ariaLabel is empty', () => {
    const { fixture, component } = createFixture();
    component.label = 'Password';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Password');
  });

  it('should hide password by default', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
  });

  it('should toggle password visibility when toggleVisibility is called', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.getAttribute('type')).toBe('password');
    component.toggleVisibility();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.getAttribute('type')).toBe('text');
    component.toggleVisibility();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('input')?.getAttribute('type')).toBe('password');
  });

  it('should return empty string from errorMessage when control has no errors', () => {
    const control = createControl('ValidPass1');
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

  it('should return INVALID_PASSWORD from errorMessage when password validation fails', () => {
    const control = createControl('weak');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_PASSWORD);
  });

  it('should return false from hasError when control is valid', () => {
    const control = createControl('ValidPass1');
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

  it('should render lock icon', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icons = el.querySelectorAll('mat-icon');
    expect(icons.length).toBeGreaterThan(0);
    expect(icons[0]?.textContent?.trim()).toBe('lock');
  });
});
