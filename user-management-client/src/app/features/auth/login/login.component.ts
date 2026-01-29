import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormService } from '@core/services/form.service';
import { LocalStorageService } from '@core/services/local-storage.service';
import { EmailHelperService } from '@core/services/email-helper.service';
import { Routes } from '@core/enums/routes.enum';
import { LoginFormValue } from '@core/types/form.types';
import { StorageKeys } from '@core/enums/storage-keys.enum';
import { LABELS } from '@core/constants/labels.constants';
import { EmailInputComponent } from '@shared/ui/form-fields/email-input/email-input.component';
import { PasswordInputComponent } from '@shared/ui/form-fields/password-input/password-input.component';
import { SubmitButtonComponent } from '@shared/ui/buttons/submit-button/submit-button.component';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    EmailInputComponent,
    PasswordInputComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly labels = LABELS;
  readonly routes = Routes;

  private formService: FormService = inject(FormService); // form service
  private store: Store = inject(Store); // store for dispatching actions
  private router: Router = inject(Router); // router for navigation
  private route: ActivatedRoute = inject(ActivatedRoute); // route
  private localStorage: LocalStorageService = inject(LocalStorageService); // local storage service
  private emailHelper: EmailHelperService = inject(EmailHelperService); // email helper service

  loginForm: FormGroup = this.formService.createLoginForm() || ({} as FormGroup); // login form
  combinedLoading$: Observable<boolean> = this.formService.getCombinedLoading$() || of(false); // combined loading observable

  get loginIDControl(): FormControl {
    // get login ID control
    return this.loginForm.get('loginID') as FormControl; // login ID control
  }

  get passwordControl(): FormControl {
    // get password control
    return this.loginForm.get('password') as FormControl; // password control
  }

  // on submit form
  onSubmit(): void {
    if (!this.formService.validateForm(this.loginForm)) return; // if form is invalid, return

    const { loginID, password, rememberMe } = this.loginForm.value as LoginFormValue; // get form values

    if (rememberMe) { // if remember me is checked, set remember me in local storage
      this.localStorage.setItem(StorageKeys.REMEMBER_ME, loginID); // set remember me in local storage
    } else {
      this.localStorage.removeItem(StorageKeys.REMEMBER_ME); // remove remember me from local storage
    }

    this.store.dispatch(LoadingActions.showLoading()); // show loading
    this.store.dispatch(
      AuthActions.login({
        credentials: { loginID, password },
        rememberMe: rememberMe || false,
      }),
    );

    const returnUrlParam = this.route.snapshot.queryParams['returnUrl'];
    const returnUrl =
      typeof returnUrlParam === 'string' && returnUrlParam ? returnUrlParam : Routes.DASHBOARD;
    if (returnUrl !== Routes.DASHBOARD) {
      // Store return URL for navigation after login success
    }
  }

  navigateToForgotPassword(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const email = this.loginIDControl.value;
    if (email && typeof email === 'string') {
      this.emailHelper.setTemporaryEmail(email);
    }
    this.router.navigate([Routes.FORGOT_PASSWORD]);
  }

  navigateToRegister(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const email = this.loginIDControl.value;
    if (email && typeof email === 'string') {
      this.emailHelper.setTemporaryEmail(email);
    }
    this.router.navigate([Routes.REGISTER]);
  }
}
