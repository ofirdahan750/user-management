import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, take } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormService } from '@core/services/form/form.service';
import { DateFormatPipe } from '@shared/pipes/date-format/date-format.pipe';
import { TextInputComponent } from '@shared/ui/form-fields/text-input/text-input.component';
import { EmailInputComponent } from '@shared/ui/form-fields/email-input/email-input.component';
import { PhoneInputComponent } from '@shared/ui/form-fields/phone-input/phone-input.component';
import { DateInputComponent } from '@shared/ui/form-fields/date-input/date-input.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import { Routes } from '@core/enums/routes.enum';
import { UserProfile, ProfileUpdate, DEFAULT_USER_PROFILE } from '@core/models/user.model';
import { ProfileOriginalValues } from '@core/types/profile.types';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { PLACEHOLDERS } from '@core/constants/placeholders.constants';
import { selectUser, selectAuthLoading } from '@core/store/auth/auth.selectors';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';
import { AppState } from '@core/store/root-state.model';
import { PROFILE_FORM_CONTROLS } from '@core/constants/form-controls.constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
    SubmitButtonComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  readonly labels = LABELS;
  readonly routes = Routes;
  readonly MESSAGES = MESSAGES;
  readonly icons = ICONS;
  readonly placeholders = PLACEHOLDERS;
  readonly formControls = PROFILE_FORM_CONTROLS;

  private formService: FormService = inject(FormService);
  private store: Store<AppState> = inject(Store);

  profileForm: FormGroup = this.formService.createProfileForm() || ({} as FormGroup); // profile form

  hasUnsavedChanges: WritableSignal<boolean> = signal<boolean>(false); // has unsaved changes signal (true when there are unsaved changes, false when there are no unsaved changes)
  combinedLoading$: Observable<boolean> = this.formService.getCombinedLoading$() || of(false); // combined loading observable (true when there is a loading state, false when there is no loading state)
  currentUser$: Observable<UserProfile> = this.store.select(selectUser).pipe(
    map((user) => user ?? DEFAULT_USER_PROFILE),
    startWith(DEFAULT_USER_PROFILE),
  );

  originalValues: ProfileOriginalValues = {
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
  };

  ngOnInit(): void {
    this.disableEmailControl();
    this.subscribeToUserAndFormChanges();
  }

  private disableEmailControl(): void {
    const emailControl = this.profileForm.get(PROFILE_FORM_CONTROLS.EMAIL);
    if (emailControl) {
      emailControl.disable();
    }
  }

  private subscribeToUserAndFormChanges(): void {
    // Wait for first real user (skip DEFAULT_USER_PROFILE from startWith), then patch form
    this.currentUser$
      .pipe(
        filter((user) => !!user.UID),
        take(1),
      )
      .subscribe({
        next: (user) => {
          this.originalValues = {
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate ? new Date(user.birthDate) : '',
            phoneNumber: user.phoneNumber || '',
          };

          this.profileForm.patchValue({
            [PROFILE_FORM_CONTROLS.FIRST_NAME]: user.firstName,
            [PROFILE_FORM_CONTROLS.LAST_NAME]: user.lastName,
            [PROFILE_FORM_CONTROLS.EMAIL]: user.email,
            [PROFILE_FORM_CONTROLS.BIRTH_DATE]: user.birthDate ? new Date(user.birthDate) : '',
            [PROFILE_FORM_CONTROLS.PHONE_NUMBER]: user.phoneNumber || '',
          });
        },
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
    const c = PROFILE_FORM_CONTROLS;

    const updateData: ProfileUpdate = {
      firstName: formValue[c.FIRST_NAME],
      lastName: formValue[c.LAST_NAME],
    };

    if (formValue[c.BIRTH_DATE]) {
      updateData.birthDate = new Date(formValue[c.BIRTH_DATE]).toISOString();
    }

    if (formValue[c.PHONE_NUMBER]) {
      updateData.phoneNumber = formValue[c.PHONE_NUMBER];
    }

    this.store.dispatch(LoadingActions.showLoading());
    this.store.dispatch(AuthActions.updateProfile({ data: updateData }));

    // Subscribe to success to update local state - using take(2) to get initial and final state
    // This will auto-unsubscribe after 2 emissions (initial state and final state)
    this.store
      .select(selectAuthLoading)
      .pipe(take(2))
      .subscribe({
        next: (isLoading) => {
          if (!isLoading) {
            const c = PROFILE_FORM_CONTROLS;
            this.originalValues = {
              firstName: formValue[c.FIRST_NAME],
              lastName: formValue[c.LAST_NAME],
              birthDate: formValue[c.BIRTH_DATE] ?? '',
              phoneNumber: formValue[c.PHONE_NUMBER] ?? '',
            };
            this.hasUnsavedChanges.set(false);
          }
        },
      });
  }

  cancel(): void {
    this.profileForm.patchValue(this.originalValues);
    this.hasUnsavedChanges.set(false);
  }

  private checkForChanges(): void {
    const currentValues = this.profileForm.value;
    const hasChanges = (
      Object.keys(this.originalValues) as Array<keyof ProfileOriginalValues>
    ).some((key) => {
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
