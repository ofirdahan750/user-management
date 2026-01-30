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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { ProfileFormValue } from '@core/types/form.types';

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
    // select user from store
    map((user) => user ?? DEFAULT_USER_PROFILE), // if user is null, return default user profile
    startWith(DEFAULT_USER_PROFILE), // start with default user profile if user is null
  );

  originalValues: ProfileOriginalValues = {
    // original values for the form
    firstName: '', // first name
    lastName: '', // last name
    birthDate: '', // birth date
    phoneNumber: '', // phone number
  };

  ngOnInit(): void {
    this.disableEmailControl(); // disable email control when component is initialized (cannot be changed)
    this.subscribeToUserAndFormChanges(); // subscribe to user and form changes when component is initialized
  }

  // disable email control when component is initialized (cannot be changed)
  private disableEmailControl(): void {
    this.profileForm.get(PROFILE_FORM_CONTROLS.EMAIL)?.disable(); // disable email control when component is initialized (cannot be changed)
  }

  // subscribe to user and form changes when component is initialized
  private subscribeToUserAndFormChanges(): void {
    // Wait for first real user (skip default user profile from startWith), then patch form
    this.currentUser$
      .pipe(
        filter((user) => !!user.UID), // filter out users with no UID
        take(1),
      )
      .subscribe({
        next: (user) => {
          this.originalValues = {
            // set original values for the form
            firstName: user.firstName, // first name
            lastName: user.lastName, // last name
            birthDate: user.birthDate ? new Date(user.birthDate) : '', // birth date if it exists, otherwise empty string
            phoneNumber: user.phoneNumber, // phone number
          };

          this.profileForm.patchValue({
            [PROFILE_FORM_CONTROLS.FIRST_NAME]: user.firstName,
            [PROFILE_FORM_CONTROLS.LAST_NAME]: user.lastName,
            [PROFILE_FORM_CONTROLS.EMAIL]: user.email,
            [PROFILE_FORM_CONTROLS.BIRTH_DATE]: user.birthDate ? new Date(user.birthDate) : '',
            [PROFILE_FORM_CONTROLS.PHONE_NUMBER]: user.phoneNumber,
          });
        },
      });

    this.profileForm.valueChanges.subscribe(() => {
      this.checkForChanges(); // check for changes in the form
    });
  }
  // on submit profile form
  onSubmit(): void {
    if (!this.formService.validateForm(this.profileForm)) return; // if form is not valid, return
    const formValue = this.profileForm.value; // form value for the form
    const profileControls = PROFILE_FORM_CONTROLS; // profile controls for the form

    const updateData: ProfileUpdate = {
      // update data for the form
      firstName: formValue[profileControls.FIRST_NAME], // first name
      lastName: formValue[profileControls.LAST_NAME], // last name
    };

    if (formValue[profileControls.BIRTH_DATE]) {
      // if birth date is not empty, add it to the update data
      updateData.birthDate = new Date(formValue[profileControls.BIRTH_DATE]).toISOString(); // convert birth date to ISO string
    }

    if (formValue[profileControls.PHONE_NUMBER]) {
      // if phone number is not empty, add it to the update data
      updateData.phoneNumber = formValue[profileControls.PHONE_NUMBER]; // phone number
    }

    this.store.dispatch(LoadingActions.showLoading()); // show loading state
    this.store.dispatch(AuthActions.updateProfile({ data: updateData })); // update profile

    // Subscribe to success to update local state - using take(2) to get initial and final state
    // This will auto-unsubscribe after 2 emissions (initial state and final state)
    this.store
      .select(selectAuthLoading)
      .pipe(take(2))
      .subscribe({
        next: (isLoading) => {
          if (!isLoading) {
            this.originalValues = {
              firstName: formValue[profileControls.FIRST_NAME],
              lastName: formValue[profileControls.LAST_NAME],
              birthDate: formValue[profileControls.BIRTH_DATE] || '',
              phoneNumber: formValue[profileControls.PHONE_NUMBER] || '',
            };
            this.hasUnsavedChanges.set(false);
          }
        },
      });
  }

  // cancel profile form (reset form to original values)
  cancel(): void {
    this.profileForm.patchValue(this.originalValues); // reset form to original values
    this.hasUnsavedChanges.set(false); // set has unsaved changes to false
  }

  // check for changes in the form
  private checkForChanges(): void {
    const currentValues: ProfileFormValue = this.profileForm.value; // current values for the form
    const isDate = (v: string | Date): v is Date => v instanceof Date; // check if value is a date

    const keys = Object.keys(this.originalValues) as Array<keyof ProfileOriginalValues>; // keys for the original values
    const hasChanges = keys.some((key) => {
      // check if there are changes in the form
      const original: ProfileOriginalValues[keyof ProfileOriginalValues] = this.originalValues[key]; // original value for the key
      const raw: string | Date = currentValues[key] || ''; // raw value for the key
      const current: string | Date = raw == null ? '' : raw; // current value for the key

      if (isDate(original) && isDate(current)) {
        return original.getTime() !== current.getTime(); // check if original time is not equal to current time
      }

      return original !== current; // check if original is not equal to current
    });

    this.hasUnsavedChanges.set(hasChanges); // set has unsaved changes to true if there are changes in the form
  }
}
