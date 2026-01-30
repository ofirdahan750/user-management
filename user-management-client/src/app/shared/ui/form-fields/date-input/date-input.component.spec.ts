// npx ng test --include='**/date-input.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DateInputComponent } from './date-input.component';
import { defaultDateAgeValidator } from '@shared/validators/date-age.validator';
import { MESSAGES } from '@core/constants/messages.constants';

describe('DateInputComponent', () => {
  const createControl = (initialValue: Date | null = null) =>
    new FormControl<Date | null>(initialValue, [defaultDateAgeValidator()]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateInputComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = (control: FormControl<Date | null> = createControl()) => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentInstance.control = control;
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    const { fixture, component } = createFixture();
    component.label = 'Birth Date';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Birth Date');
  });

  it('should bind formControl to input', () => {
    const control = createControl(new Date('1990-05-15'));
    const { fixture } = createFixture(control);
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input).toBeTruthy();
    expect(control.value).toEqual(new Date('1990-05-15'));
  });

  it('should use ariaLabel when provided', () => {
    const { fixture, component } = createFixture();
    component.ariaLabel = 'Select birth date';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Select birth date');
  });

  it('should fallback aria-label to label when ariaLabel is empty', () => {
    const { fixture, component } = createFixture();
    component.label = 'Birth Date';
    fixture.detectChanges();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Birth Date');
  });

  it('should return empty string from errorMessage when control has no errors', () => {
    const control = createControl(new Date('1990-05-15'));
    const { component } = createFixture(control);
    expect(component.errorMessage).toBe('');
  });

  it('should return INVALID_DATE_AGE from errorMessage when minAge error', () => {
    const control = createControl(new Date('2020-01-01'));
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_DATE_AGE);
  });

  it('should return INVALID_DATE_AGE from errorMessage when maxAge error', () => {
    const control = createControl(new Date('1800-01-01'));
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_DATE_AGE);
  });

  it('should return INVALID_DATE_FUTURE from errorMessage when futureDate error', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const control = createControl(futureDate);
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_DATE_FUTURE);
  });

  it('should return INVALID_DATE from errorMessage when invalidDate error', () => {
    const control = new FormControl<Date | null>(new Date('invalid'), [defaultDateAgeValidator()]);
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.errorMessage).toBe(MESSAGES.INVALID_DATE);
  });

  it('should return false from showError when control is valid', () => {
    const control = createControl(new Date('1990-05-15'));
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.showError).toBe(false);
  });

  it('should return false from showError when control invalid but not touched or dirty', () => {
    const control = createControl(new Date('2020-01-01'));
    const { component } = createFixture(control);
    expect(component.showError).toBe(false);
  });

  it('should return true from showError when control invalid and touched', () => {
    const control = createControl(new Date('2020-01-01'));
    const { component } = createFixture(control);
    control.markAsTouched();
    expect(component.showError).toBe(true);
  });

  it('should render mat-error when showError is true', () => {
    const control = createControl(new Date('2020-01-01'));
    const { fixture } = createFixture(control);
    control.markAsTouched();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const matError = el.querySelector('mat-error');
    expect(matError).toBeTruthy();
    expect(matError?.textContent?.trim()).toBe(MESSAGES.INVALID_DATE_AGE);
  });
});
