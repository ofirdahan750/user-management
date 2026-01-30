// npx ng test --include='**/dashboard.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { authReducer } from '@core/store/auth/auth.reducer';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import * as AuthActions from '@core/store/auth/auth.actions';
import { DashboardComponent } from './dashboard.component';
import { UserProfile } from '@core/models/user.model';
import { LABELS } from '@core/constants/labels.constants';
import { Routes } from '@core/enums/routes.enum';

describe('DashboardComponent', () => {
  const mockUser: UserProfile = {
    UID: 'user-1',
    email: 'john@test.com',
    firstName: 'john',
    lastName: 'doe',
    isVerified: true,
    registrationDate: '2024-01-15T10:00:00Z',
    lastLoginDate: '2024-01-20T14:30:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DashboardComponent },
          { path: 'profile', component: DashboardComponent },
        ]),
        provideNoopAnimations(),
        provideStore({
          auth: authReducer,
          loading: loadingReducer,
        }),
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels and routes', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
    expect(component.routes.PROFILE).toBe('/profile');
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

  it('renders welcome message with user name when user is loaded', () => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.dashboard__title');
    expect(title?.textContent).toContain(LABELS.WELCOME);
    expect(title?.textContent).toContain('John');
  });

  it('renders profile summary section when user is loaded', () => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    const { fixture } = createFixture();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dashboard__card-title')?.textContent).toContain(LABELS.PROFILE_SUMMARY);
    expect(fixture.nativeElement.querySelector('.dashboard__info-value')?.textContent?.trim()).toBe('John');
  });

  it('renders edit profile button with link to profile', () => {
    const store = TestBed.inject(Store);
    store.dispatch(AuthActions.loadUserSuccess({ user: mockUser }));
    const { fixture } = createFixture();
    fixture.detectChanges();
    const editBtn = fixture.nativeElement.querySelector('.dashboard__action-btn');
    expect(editBtn).toBeTruthy();
    expect(editBtn?.textContent).toContain(LABELS.EDIT_PROFILE);
  });
});
