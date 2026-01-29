// npx ng test --include='**/not-found.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Routes } from '@core/enums/routes.enum';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(NotFoundComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  };

  it('should create component successfully', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels, messages, icons, routes and MaterialColor', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.messages).toBe(MESSAGES);
    expect(component.icons).toBe(ICONS);
    expect(component.routes).toBe(Routes);
    expect(component.MaterialColor).toBeDefined();
  });

  it('navigateTo should call router.navigate with the given route', () => {
    const { component } = createFixture();
    const router = TestBed.inject(Router) as Router;
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateTo(Routes.DASHBOARD);
    expect(navigateSpy).toHaveBeenCalledWith([Routes.DASHBOARD]);
  });

  it('navigateTo should navigate to login when given Routes.LOGIN', () => {
    const { component } = createFixture();
    const router = TestBed.inject(Router) as Router;
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateTo(Routes.LOGIN);
    expect(navigateSpy).toHaveBeenCalledWith([Routes.LOGIN]);
  });

  it('should render page not found title', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.not-found__title');
    expect(title?.textContent?.trim()).toBe(component.messages.PAGE_NOT_FOUND_TITLE);
  });

  it('should render page not found message', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const message = el.querySelector('.not-found__message');
    expect(message?.textContent?.trim()).toBe(component.messages.PAGE_NOT_FOUND_MESSAGE);
  });

  it('should render dashboard and login buttons', () => {
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('.not-found__button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toContain(component.labels.GO_TO_DASHBOARD);
    expect(buttons[1].textContent?.trim()).toContain(component.labels.BACK_TO_LOGIN);
  });
});
