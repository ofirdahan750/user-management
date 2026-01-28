import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
  private formService = inject(FormService);
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private localStorage = inject(LocalStorageService);
  private emailHelper = inject(EmailHelperService);

  loginForm: FormGroup;
  combinedLoading$: Observable<boolean>;

  readonly labels = LABELS;
  readonly routes = Routes;

  get loginIDControl(): FormControl {
    return this.loginForm.get('loginID') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  constructor() {
    this.loginForm = this.formService.createLoginForm();
    this.combinedLoading$ = this.formService.getCombinedLoading$();
  }

  onSubmit(): void {
    if (!this.formService.validateForm(this.loginForm)) {
      return;
    }

    const { loginID, password, rememberMe } = this.loginForm.value as LoginFormValue;

    if (rememberMe) {
      this.localStorage.setItem(StorageKeys.REMEMBER_ME, loginID);
    } else {
      this.localStorage.removeItem(StorageKeys.REMEMBER_ME);
    }

    this.store.dispatch(LoadingActions.showLoading());
    this.store.dispatch(AuthActions.login({ 
      credentials: { loginID, password },
      rememberMe: rememberMe || false
    }));

    const returnUrlParam = this.route.snapshot.queryParams['returnUrl'];
    const returnUrl = (typeof returnUrlParam === 'string' && returnUrlParam) ? returnUrlParam : Routes.DASHBOARD;
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
