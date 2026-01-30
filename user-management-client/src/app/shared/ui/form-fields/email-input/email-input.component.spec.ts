// npx ng test --include='**/email-input.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailInputComponent } from './email-input.component';
import { MESSAGES } from '@core/constants/messages.constants';

describe('EmailInputComponent', () => {
  const createControl = (initialValue = '') =>
    new FormControl(initialValue, [Validators.required, Validators.email]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailInputComponent, ReactiveFormsModule],
    }).compileComponents();
  });

  const createFixture = (control: FormControl = createControl()) => {
    const fixture = TestBed.createComponent(EmailInputComponent);
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

  it('should render label', () => {
    const { fixture, component } = createFixture();
    component.label = 'Email';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Email');
  });

  it('should bind formControl to input', () => {
    const control = createControl('test@example.com');
    const { fixture } = createFixture(control);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.value).toBe('test@example.com');
  });

  it('should use ariaLabel when provided', () => {
    const { fixture, component } = createFixture();
    component.ariaLabel = 'Enter your email';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Enter your email');
  });

  it('should fallback aria-label to label when ariaLabel is empty', () => {
    const { fixture, component } = createFixture();
    component.label = 'Email';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Email');
  });

  it('should render hint when provided', () => {
    const { fixture, component } = createFixture();
    component.hint = 'We will never share your email';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const hint = el.querySelector('mat-hint');
    expect(hint?.textContent?.trim()).toBe('We will never share your email');
  });

  it('should not render hint when empty', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const hint = el.querySelector('mat-hint');
    expect(hint).toBeFalsy();
  });

  it('should return empty string from errorMessage when control has no errors', () => {
    const control = createControl('valid@email.com');
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

  it('should return INVALID_EMAIL from errorMessage when email format error', () => {
    const control = createControl('invalid-email');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_EMAIL);
  });

  it('should return false from hasError when control is valid', () => {
    const control = createControl('valid@email.com');
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

  it('should render email icon', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icon = el.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('email');
  });
});
