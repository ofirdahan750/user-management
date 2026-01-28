import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormService } from '@core/services/form.service';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { TextInputComponent } from '@shared/ui/form-fields/text-input/text-input.component';
import { EmailInputComponent } from '@shared/ui/form-fields/email-input/email-input.component';
import { PhoneInputComponent } from '@shared/ui/form-fields/phone-input/phone-input.component';
import { DateInputComponent } from '@shared/ui/form-fields/date-input/date-input.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { Routes } from '@core/enums/routes.enum';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { PLACEHOLDERS } from '@core/constants/placeholders.constants';
import { selectUser, selectAuthLoading } from '@core/store/auth/auth.selectors';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    DateFormatPipe,
    TextInputComponent,
    EmailInputComponent,
    PhoneInputComponent,
    DateInputComponent,
    SubmitButtonComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private formService = inject(FormService);
  private store = inject(Store);
  private router = inject(Router);

  public profileForm: FormGroup;
  public hasUnsavedChanges = signal<boolean>(false);
  public originalValues: Record<string, unknown> = {};
  public combinedLoading$: Observable<boolean>;
  public currentUser$: Observable<any>;

  public readonly labels = LABELS;
  public readonly routes = Routes;
  public readonly MESSAGES = MESSAGES;
  public readonly icons = ICONS;
  public readonly placeholders = PLACEHOLDERS;

  get firstNameControl(): FormControl {
    return this.profileForm.get('firstName') as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.profileForm.get('lastName') as FormControl;
  }

  get emailControl(): FormControl {
    return this.profileForm.get('email') as FormControl;
  }

  get phoneNumberControl(): FormControl {
    return this.profileForm.get('phoneNumber') as FormControl;
  }

  get birthDateControl(): FormControl {
    return this.profileForm.get('birthDate') as FormControl;
  }

  constructor() {
    this.profileForm = this.formService.createProfileForm();
    // Disable email field as it shouldn't be editable
    this.profileForm.get('email')?.disable();
    
    this.combinedLoading$ = this.formService.getCombinedLoading$();
    this.currentUser$ = this.store.select(selectUser);

    // Subscribe to user changes - using take(1) since we only need initial value
    // The template will use async pipe for reactive updates
    // This will auto-unsubscribe after 1 emission
    this.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          this.originalValues = {
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            phoneNumber: user.phoneNumber || ''
          };

          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            phoneNumber: user.phoneNumber || ''
          });
        }
      }
    });

    this.profileForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.profileForm)) {
      return;
    }

    const formValue = this.profileForm.value;

    const updateData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      birthDate: formValue.birthDate ? new Date(formValue.birthDate).toISOString() : undefined,
      phoneNumber: formValue.phoneNumber || undefined
    };

    this.store.dispatch(LoadingActions.showLoading());
    this.store.dispatch(AuthActions.updateProfile({ data: updateData }));
    
    // Subscribe to success to update local state - using take(2) to get initial and final state
    // This will auto-unsubscribe after 2 emissions (initial state and final state)
    this.store.select(selectAuthLoading).pipe(take(2)).subscribe({
      next: (isLoading) => {
        if (!isLoading) {
          this.originalValues = { ...formValue };
          this.hasUnsavedChanges.set(false);
        }
      }
    });
  }

  cancel(): void {
    this.profileForm.patchValue(this.originalValues);
    this.hasUnsavedChanges.set(false);
  }

  private checkForChanges(): void {
    const currentValues = this.profileForm.value;
    const hasChanges = Object.keys(this.originalValues).some(key => {
      const original = this.originalValues[key];
      const current = currentValues[key];
      
      if (original instanceof Date && current instanceof Date) {
        return original.getTime() !== current.getTime();
      }
      
      return original !== current;
    });

    this.hasUnsavedChanges.set(hasChanges);
  }
}
