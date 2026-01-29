import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideStore, Store } from '@ngrx/store';
import { loadingReducer } from '@core/store/loading/loading.reducer';
import { showLoading, hideLoading } from '@core/store/loading/loading.actions';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [
        provideNoopAnimations(),
        provideStore({ loading: loadingReducer }),
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should select isLoading from store', () => {
    const { component } = createFixture();
    expect(component.isLoading$).toBeDefined();
  });

  it('should not show overlay when not loading', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const overlay = el.querySelector('.loading-spinner__overlay');
    expect(overlay).toBeNull();
  });

  it('should show overlay and mat-spinner when loading', () => {
    const { fixture } = createFixture();
    const store = TestBed.inject(Store);
    store.dispatch(showLoading());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const overlay = el.querySelector('.loading-spinner__overlay');
    const spinner = el.querySelector('mat-spinner');
    expect(overlay).toBeTruthy();
    expect(spinner).toBeTruthy();
  });

  it('should hide overlay when loading ends', () => {
    const { fixture } = createFixture();
    const store = TestBed.inject(Store);
    store.dispatch(showLoading());
    fixture.detectChanges();
    let overlay = (fixture.nativeElement as HTMLElement).querySelector('.loading-spinner__overlay');
    expect(overlay).toBeTruthy();

    store.dispatch(hideLoading());
    fixture.detectChanges();
    overlay = (fixture.nativeElement as HTMLElement).querySelector('.loading-spinner__overlay');
    expect(overlay).toBeNull();
  });
});
