// npx ng test --include='**/form.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { FormService } from './form.service';
import { PROFILE_FORM_CONTROLS } from '@core/constants/form-controls.constants';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { authReducer } from '@core/store/auth/auth.reducer';

describe('FormService', () => {
  let service: FormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormService,
        provideStore({
          loading: loadingReducer,
          auth: authReducer
        })
      ]
    });
    service = TestBed.inject(FormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createRegisterForm should return form with required controls', () => {
    const form = service.createRegisterForm();
    expect(form.get('email')).toBeTruthy();
    expect(form.get('password')).toBeTruthy();
    expect(form.get('firstName')).toBeTruthy();
    expect(form.get('lastName')).toBeTruthy();
  });

  it('createLoginForm should return form', () => {
    const form = service.createLoginForm();
    expect(form.get('loginID')).toBeTruthy();
    expect(form.get('password')).toBeTruthy();
  });

  it('createProfileForm should return form with PROFILE_FORM_CONTROLS', () => {
    const form = service.createProfileForm();
    expect(form.get(PROFILE_FORM_CONTROLS.FIRST_NAME)).toBeTruthy();
    expect(form.get(PROFILE_FORM_CONTROLS.LAST_NAME)).toBeTruthy();
    expect(form.get(PROFILE_FORM_CONTROLS.EMAIL)).toBeTruthy();
    expect(form.get(PROFILE_FORM_CONTROLS.PHONE_NUMBER)).toBeTruthy();
    expect(form.get(PROFILE_FORM_CONTROLS.BIRTH_DATE)).toBeTruthy();
  });

  it('validateForm should return false for invalid form', () => {
    const form = service.createLoginForm();
    expect(service.validateForm(form)).toBe(false);
  });
});
