import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { of } from 'rxjs';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { authReducer } from '@core/store/auth/auth.reducer';
import { App } from './app';

describe('App', () => {
  const mockRouter = {
    url: '/',
    events: of(null),
    navigate: () => Promise.resolve(true),
    navigateByUrl: () => Promise.resolve(true),
    createUrlTree: () => ({}),
    serializeUrl: () => '',
  };

  const mockActivatedRoute = {
    url: of([]),
    params: of({}),
    queryParams: of({}),
    outlet: 'primary',
    snapshot: {} as unknown,
    root: {} as ActivatedRoute,
    parent: null,
    firstChild: null,
    children: [],
    pathFromRoot: [] as ActivatedRoute[],
    paramMap: of(new Map()),
    queryParamMap: of(new Map()),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideNoopAnimations(),
        provideStore({
          loading: loadingReducer,
          auth: authReducer,
        }),
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(App);
    return { fixture, app: fixture.componentInstance };
  };

  it('should create the app', () => {
    const { app } = createFixture();
    expect(app).toBeTruthy();
  });

  it('getRouteAnimationData() returns current router url', () => {
    const { app } = createFixture();
    expect(app.getRouteAnimationData()).toBe('/');

    mockRouter.url = '/users';
    expect(app.getRouteAnimationData()).toBe('/users');
  });

  it('renders main layout with header, main and footer', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('main.app__main')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
  });
});
