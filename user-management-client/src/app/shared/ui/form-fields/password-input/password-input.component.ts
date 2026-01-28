import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconButtonComponent } from '@shared/ui/buttons/icon-button/icon-button.component';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { LABELS } from '@core/constants/labels.constants';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    IconButtonComponent
  ],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true
    }
  ]
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() formControlName: string = '';
  @Input() control?: FormControl;
  @Input() autocomplete: string = 'new-password';
  @Input() showStrengthIndicator: boolean = false;
  @Input() ariaLabel: string = '';

  public hidePassword = signal<boolean>(true);
  public readonly ariaLabels = ARIA_LABELS;
  public readonly icons = ICONS;
  public readonly MESSAGES = MESSAGES;
  public readonly labels = LABELS;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  toggleVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    // Value is handled by form control
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  get hasError(): boolean {
    return this.control ? this.control.invalid && this.control.touched : false;
  }

  get errorMessage(): string {
    if (!this.control || !this.hasError) return '';
    
    if (this.control.hasError('required')) {
      return this.MESSAGES.REQUIRED_FIELD;
    }
    if (this.control.hasError('minLength') || this.control.hasError('uppercase') || 
        this.control.hasError('lowercase') || this.control.hasError('digit')) {
      return this.MESSAGES.INVALID_PASSWORD;
    }
    return '';
  }
}
