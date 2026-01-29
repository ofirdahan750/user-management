// npx ng test --include='**/submit-button.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SubmitButtonComponent } from './submit-button.component';
import { MaterialColor } from '@core/enums/material-color.enum';
import { LABELS } from '@core/constants/labels.constants';
import {
  DEFAULT_SUBMIT_BUTTON_TYPE,
  DEFAULT_SUBMIT_BUTTON_VARIANT,
} from '@core/types/button.types';

describe('SubmitButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitButtonComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(SubmitButtonComponent);
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
    expect(component.label).toBe(LABELS.SUBMIT);
    expect(component.isLoading).toBe(false);
    expect(component.disabled).toBe(false);
    expect(component.type).toBe(DEFAULT_SUBMIT_BUTTON_TYPE);
    expect(component.color).toBe(MaterialColor.PRIMARY);
    expect(component.variant).toBe(DEFAULT_SUBMIT_BUTTON_VARIANT);
    expect(component.tooltip).toBe('');
    expect(component.clickHandler).toBeUndefined();
  });

  it('should render raised button by default', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector('button.submit-button--raised');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toContain(LABELS.SUBMIT);
  });

  it('should render flat button when variant is flat', () => {
    const { fixture, component } = createFixture();
    component.variant = 'flat';
    component.label = 'Save';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector('button.submit-button--flat');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toContain('Save');
  });

  it('should render stroked button when variant is stroked', () => {
    const { fixture, component } = createFixture();
    component.variant = 'stroked';
    component.label = 'Cancel';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector('button.submit-button--stroked');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toContain('Cancel');
  });

  it('should bind type to button', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.getAttribute('type')).toBe('submit');
  });

  it('should disable button when disabled or isLoading', () => {
    const { fixture, component } = createFixture();
    component.disabled = true;
    fixture.detectChanges();
    let button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(true);

    component.disabled = false;
    component.isLoading = true;
    fixture.detectChanges();
    button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.disabled).toBe(true);
  });

  it('should show spinner when isLoading', () => {
    const { fixture, component } = createFixture();
    component.isLoading = true;
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const spinner = el.querySelector('.submit-button__spinner');
    expect(spinner).toBeTruthy();
  });

  it('should return custom tooltip from tooltipText when tooltip is set', () => {
    const { component } = createFixture();
    component.tooltip = 'Custom tip';
    expect(component.tooltipText).toBe('Custom tip');
  });

  it('should return TOOLTIP_FORM_DISABLED from tooltipText when disabled', () => {
    const { component } = createFixture();
    component.disabled = true;
    expect(component.tooltipText).toBe(LABELS.TOOLTIP_FORM_DISABLED);
  });

  it('should return empty string from tooltipText when isLoading and not disabled', () => {
    const { component } = createFixture();
    component.isLoading = true;
    component.disabled = false;
    expect(component.tooltipText).toBe('');
  });

  it('should return TOOLTIP_SUBMIT_FORM from tooltipText when enabled and not loading', () => {
    const { component } = createFixture();
    expect(component.tooltipText).toBe(LABELS.TOOLTIP_SUBMIT_FORM);
  });

  it('should call clickHandler when button is clicked', () => {
    const { fixture, component } = createFixture();
    const handler = jasmine.createSpy('clickHandler');
    component.clickHandler = handler;
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not throw when clicked without clickHandler', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(() => button?.click()).not.toThrow();
  });
});
