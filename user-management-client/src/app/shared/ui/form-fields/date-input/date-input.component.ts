import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MESSAGES } from '@core/constants/messages.constants';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './date-input.component.html',
  styleUrl: './date-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInputComponent {
  @Input() label = '';
  @Input({ required: true }) control!: FormControl<Date | null>;
  @Input() ariaLabel = '';

  get errorMessage(): string {
    if (!this.control?.errors) return ''; // if there are no errors, return an empty string
    if (this.control.hasError('invalidDate')) return MESSAGES.INVALID_DATE; // if the date is invalid, return the invalid date message
    if (this.control.hasError('futureDate')) return MESSAGES.INVALID_DATE_FUTURE; // if the date is in the future, return the invalid date future message
    if (this.control.hasError('minAge') || this.control.hasError('maxAge'))
      return MESSAGES.INVALID_DATE_AGE; // if the date is outside the min or max age, return the invalid date age message
    return ''; // if there are no errors, return an empty string
  }

  get showError(): boolean {
    // return true if the control is invalid, touched or dirty and there is an error message
    return !!(
      this.control?.invalid &&
      (this.control.touched || this.control.dirty) &&
      this.errorMessage
    ); // return true if the control is invalid, touched or dirty and there is an error message
  }
}
