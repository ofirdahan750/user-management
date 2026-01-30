import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ICONS } from '@core/constants/icons.constants';
import { PLACEHOLDERS } from '@core/constants/placeholders.constants';
import { MESSAGES } from '@core/constants/messages.constants';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = PLACEHOLDERS.PHONE_NUMBER;
  @Input() formControlName: string = '';
  @Input() control?: FormControl;
  @Input() autocomplete: string = 'tel';
  @Input() ariaLabel: string = '';

  readonly icons = ICONS;
  readonly placeholders = PLACEHOLDERS;
  readonly MESSAGES = MESSAGES;

  private onChange = (value: string) => {};
  private onTouched = () => {};

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
    
    if (this.control.hasError('invalidPhone')) {
      return this.MESSAGES.INVALID_PHONE;
    }
    return '';
  }
}
