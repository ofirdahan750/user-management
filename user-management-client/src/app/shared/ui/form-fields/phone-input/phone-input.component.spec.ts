// npx ng test --include='**/phone-input.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PhoneInputComponent } from './phone-input.component';
import { israeliPhoneValidator } from '@shared/validators/israeli-phone.validator';
import { AUTOCOMPLETE } from '@core/constants/autocomplete.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { PLACEHOLDERS } from '@core/constants/placeholders.constants';

describe('PhoneInputComponent', () => {
  const createControl = (initialValue = '') =>
    new FormControl(initialValue, [israeliPhoneValidator()]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneInputComponent, ReactiveFormsModule],
    }).compileComponents();
  });

  const createFixture = (control: FormControl = createControl()) => {
    const fixture = TestBed.createComponent(PhoneInputComponent);
    fixture.componentInstance.control = control;
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose icons, placeholders and MESSAGES from constants', () => {
    const { component } = createFixture();
    expect(component.icons).toBeDefined();
    expect(component.placeholders).toBe(PLACEHOLDERS);
    expect(component.MESSAGES).toBe(MESSAGES);
  });

  it('should render label', () => {
    const { fixture, component } = createFixture();
    component.label = 'Phone Number';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Phone Number');
  });

  it('should bind formControl to input', () => {
    const control = createControl('+972501234567');
    const { fixture } = createFixture(control);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.value).toBe('+972501234567');
  });

  it('should use ariaLabel when provided', () => {
    const { fixture, component } = createFixture();
    component.ariaLabel = 'Enter your phone number';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Enter your phone number');
  });

  it('should fallback aria-label to label when ariaLabel is empty', () => {
    const { fixture, component } = createFixture();
    component.label = 'Phone';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Phone');
  });

  it('should have default autocomplete of tel', () => {
    const { component } = createFixture();
    expect(component.autocomplete).toBe(AUTOCOMPLETE.TEL);
  });

  it('should use placeholder from PLACEHOLDERS when not provided', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe(PLACEHOLDERS.PHONE_NUMBER);
  });

  it('should use custom placeholder when provided', () => {
    const { fixture, component } = createFixture();
    component.placeholder = 'Custom placeholder';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('Custom placeholder');
  });

  it('should return empty string from errorMessage when control has no errors', () => {
    const control = createControl('+972501234567');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe('');
  });

  it('should return INVALID_PHONE from errorMessage when invalidPhone error', () => {
    const control = createControl('123');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_PHONE);
  });

  it('should return false from hasError when control is valid', () => {
    const control = createControl('+972501234567');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.hasError).toBe(false);
  });

  it('should return false from hasError when control invalid but not touched', () => {
    const control = createControl('invalid');
    const { component } = createFixture(control);
    expect(component.hasError).toBe(false);
  });

  it('should return true from hasError when control invalid and touched', () => {
    const control = createControl('invalid');
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.hasError).toBe(true);
  });

  it('should render mat-error when hasError is true', () => {
    const control = createControl('invalid');
    const { fixture } = createFixture(control);
    control.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const matError = el.querySelector('mat-error');
    expect(matError).toBeTruthy();
    expect(matError?.textContent?.trim()).toBe(MESSAGES.INVALID_PHONE);
  });

  it('should render phone icon', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const icon = el.querySelector('mat-icon');
    expect(icon?.textContent?.trim()).toBe('phone');
  });
});
