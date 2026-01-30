// npx ng test --include='**/profile.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ProfileComponent } from './profile.component';
import { FormService } from '@core/services/form/form.service';
import { authReducer } from '@core/store/auth/auth.reducer';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import * as AuthActions from '@core/store/auth/auth.actions';
import * as LoadingActions from '@core/store/loading/loading.actions';
import { UserProfile } from '@core/models/user.model';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { Routes } from '@core/enums/routes.enum';
import { PROFILE_FORM_CONTROLS } from '@core/constants/form-controls.constants';

describe('ProfileComponent', () => {
  const mockUser: UserProfile = {
    UID: 'user-1',
    email: 'john@test.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '0501234567',
    isVerified: true,
    registrationDate: '2024-01-15T10:00:00Z',
    lastLoginDate: '2024-01-20T14:30:00Z',
    birthDate: '1990-05-15',
  };

  const createProfileForm = (): FormGroup =>
    new FormBuilder().group({
      [PROFILE_FORM_CONTROLS.FIRST_NAME]: ['', Validators.required],
      [PROFILE_FORM_CONTROLS.LAST_NAME]: ['', Validators.required],
      [PROFILE_FORM_CONTROLS.EMAIL]: ['', [Validators.required, Validators.email]],
      [PROFILE_FORM_CONTROLS.PHONE_NUMBER]: [''],
      [PROFILE_FORM_CONTROLS.BIRTH_DATE]: [''],
    });

  const mockFormService = {
    createProfileForm,
    validateForm: (form: FormGroup) => form.valid,
    getCombinedLoading$: () => of(false),
  };

  beforeEach(async () => {
    mockFormService.validateForm = (form: FormGroup) => form.valid;

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideStore({ auth: authReducer, loading: loadingReducer }),
        { provide: FormService, useValue: mockFormService },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels, routes, MESSAGES, formControls, icons, placeholders', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
    expect(component.MESSAGES).toBe(MESSAGES);
    expect(component.formControls).toBe(PROFILE_FORM_CONTROLS);
    expect(component.icons).toBeTruthy();
    expect(component.placeholders).toBeTruthy();
  });

  it('profileForm should have required controls', () => {
    const { component } = createFixture();
    expect(component.profileForm.get(PROFILE_FORM_CONTROLS.FIRST_NAME)).toBeTruthy();
    expect(component.profileForm.get(PROFILE_FORM_CONTROLS.LAST_NAME)).toBeTruthy();
    expect(component.profileForm.get(PROFILE_FORM_CONTROLS.EMAIL)).toBeTruthy();
    expect(component.profileForm.get(PROFILE_FORM_CONTROLS.PHONE_NUMBER)).toBeTruthy();
    expect(component.profileForm.get(PROFILE_FORM_CONTROLS.BIRTH_DATE)).toBeTruthy();
  });

  it('currentUser$ emits default profile when store has no user', (done) => {
    const { component } = createFixture();
    component.currentUser$.pipe(take(1)).subscribe((user) => {
      expect(user.UID).toBe('');
      expect(user.firstName).toBe('');
      done();
    });
  });

  it('currentUser$ emits user when store has user', (done) => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    const { component } = createFixture();
    component.currentUser$
      .pipe(filter((user) => user.UID !== ''), take(1))
      .subscribe((user) => {
        expect(user.UID).toBe(mockUser.UID);
        expect(user.firstName).toBe(mockUser.firstName);
        expect(user.email).toBe(mockUser.email);
        done();
      });
  });

  it('ngOnInit patches form and sets originalValues when user is in store', (done) => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    const { component } = createFixture();
    component.ngOnInit();

    component.currentUser$
      .pipe(filter((user) => user.UID !== ''), take(1))
      .subscribe(() => {
        setTimeout(() => {
          expect(component.originalValues.firstName).toBe(mockUser.firstName);
          expect(component.originalValues.lastName).toBe(mockUser.lastName);
          expect(component.originalValues.phoneNumber).toBe(mockUser.phoneNumber);
          expect(component.profileForm.get(PROFILE_FORM_CONTROLS.FIRST_NAME)?.value).toBe(mockUser.firstName);
          expect(component.profileForm.get(PROFILE_FORM_CONTROLS.LAST_NAME)?.value).toBe(mockUser.lastName);
          expect(component.profileForm.get(PROFILE_FORM_CONTROLS.EMAIL)?.value).toBe(mockUser.email);
          done();
        }, 0);
      });
  });

  it('cancel should patch form with originalValues and set hasUnsavedChanges to false', () => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    const { component } = createFixture();
    component.ngOnInit();

    const c = PROFILE_FORM_CONTROLS;
    component.profileForm.patchValue({
      [c.FIRST_NAME]: 'Changed',
      [c.LAST_NAME]: mockUser.lastName,
    });
    component.originalValues = {
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      birthDate: mockUser.birthDate ? new Date(mockUser.birthDate) : '',
      phoneNumber: mockUser.phoneNumber,
    };
    component.hasUnsavedChanges.set(true);

    component.cancel();

    expect(component.profileForm.get(c.FIRST_NAME)?.value).toBe(mockUser.firstName);
    expect(component.profileForm.get(c.LAST_NAME)?.value).toBe(mockUser.lastName);
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('onSubmit should dispatch showLoading and updateProfile when form is valid', () => {
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    mockFormService.validateForm = () => true;

    const { component } = createFixture();
    component.ngOnInit();
    component.profileForm.patchValue({
      [PROFILE_FORM_CONTROLS.FIRST_NAME]: 'Jane',
      [PROFILE_FORM_CONTROLS.LAST_NAME]: 'Doe',
      [PROFILE_FORM_CONTROLS.EMAIL]: mockUser.email,
      [PROFILE_FORM_CONTROLS.PHONE_NUMBER]: mockUser.phoneNumber,
      [PROFILE_FORM_CONTROLS.BIRTH_DATE]: mockUser.birthDate ? new Date(mockUser.birthDate) : null,
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(LoadingActions.showLoading());
    expect(dispatchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: AuthActions.updateProfile.type,
        data: jasmine.objectContaining({
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      })
    );
  });

  it('onSubmit should not dispatch when form is invalid', () => {
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    mockFormService.validateForm = () => false;

    const { component } = createFixture();
    component.ngOnInit();
    component.onSubmit();

    expect(dispatchSpy).not.toHaveBeenCalledWith(LoadingActions.showLoading());
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ type: AuthActions.updateProfile.type })
    );
  });

  it('onSubmit updates originalValues and resets hasUnsavedChanges when auth loading becomes false', () => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    mockFormService.validateForm = () => true;

    const { component } = createFixture();
    component.ngOnInit();
    const c = PROFILE_FORM_CONTROLS;
    component.profileForm.patchValue({
      [c.FIRST_NAME]: 'Jane',
      [c.LAST_NAME]: 'Smith',
      [c.EMAIL]: mockUser.email,
      [c.PHONE_NUMBER]: mockUser.phoneNumber,
      [c.BIRTH_DATE]: null,
    });
    component.hasUnsavedChanges.set(true);

    component.onSubmit();
    store.dispatch(AuthActions.updateProfileSuccess({ user: { ...mockUser, firstName: 'Jane', lastName: 'Smith' } }));

    expect(component.originalValues.firstName).toBe('Jane');
    expect(component.originalValues.lastName).toBe('Smith');
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('renders edit profile title', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.profile__title');
    expect(title?.textContent?.trim()).toBe(LABELS.EDIT_PROFILE);
  });

  it('renders form with save and cancel buttons', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile__submit-btn')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.profile__cancel-btn')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.profile__cancel-btn')?.textContent?.trim()).toBe(LABELS.CANCEL);
  });
});
