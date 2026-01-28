import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ICONS } from '@core/constants/icons.constants';
import { MESSAGES } from '@core/constants/messages.constants';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './email-input.component.html',
  styleUrl: './email-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailInputComponent),
      multi: true
    }
  ]
})
export class EmailInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() formControlName: string = '';
  @Input() control?: FormControl;
  @Input() autocomplete: string = 'email';
  @Input() readonly: boolean = false;
  @Input() hint: string = '';
  @Input() ariaLabel: string = '';
  @Input() autofocus: boolean = false;

  readonly icons = ICONS;
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
    
    if (this.control.hasError('required')) {
      return this.MESSAGES.REQUIRED_FIELD;
    }
    if (this.control.hasError('email')) {
      return this.MESSAGES.INVALID_EMAIL;
    }
    return '';
  }
}
