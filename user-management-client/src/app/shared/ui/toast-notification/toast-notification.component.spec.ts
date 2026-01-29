// npx ng test --include='**/toast-notification.component.spec.ts' --no-watch --browsers=ChromeHeadless
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ToastMessage } from '@core/models/toast.model';
import { ToastType } from '@core/enums/toast-type.enum';
import { ICONS } from '@core/constants/icons.constants';
import { ARIA_LABELS } from '@core/constants/aria-labels.constants';
import { ToastNotificationComponent } from './toast-notification.component';

describe('ToastNotificationComponent', () => {
  const mockMessages = signal<ToastMessage[]>([]);
  const mockRemoveMessage = () => {};

  beforeEach(async () => {
    mockMessages.set([]);
    await TestBed.configureTestingModule({
      imports: [ToastNotificationComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: ToastNotificationService,
          useValue: {
            messages: mockMessages,
            removeMessage: mockRemoveMessage,
          },
        },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(ToastNotificationComponent);
    return { fixture, component: fixture.componentInstance };
  };

  it('should create the component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose ariaLabels, icons and ToastType', () => {
    const { component } = createFixture();
    expect(component.ariaLabels).toBe(ARIA_LABELS);
    expect(component.icons).toBe(ICONS);
    expect(component.ToastType).toBe(ToastType);
  });

  it('getIconForType returns correct icon for each type', () => {
    const { component } = createFixture();
    expect(component.getIconForType(ToastType.SUCCESS)).toBe(ICONS.CHECK_CIRCLE);
    expect(component.getIconForType(ToastType.ERROR)).toBe(ICONS.ERROR);
    expect(component.getIconForType(ToastType.WARNING)).toBe(ICONS.WARNING);
    expect(component.getIconForType(ToastType.INFO)).toBe(ICONS.INFO);
  });

  it('getIconForType returns INFO icon for unknown type', () => {
    const { component } = createFixture();
    expect(component.getIconForType('unknown' as ToastType)).toBe(ICONS.INFO);
  });

  it('should render no toasts when messages is empty', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toasts = el.querySelectorAll('.toast-notification__toast');
    expect(toasts.length).toBe(0);
  });

  it('should render toast when messages has items', () => {
    mockMessages.set([
      {
        id: '1',
        message: 'Test message',
        type: ToastType.SUCCESS,
      },
    ]);
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toasts = el.querySelectorAll('.toast-notification__toast');
    expect(toasts.length).toBe(1);
    expect(toasts[0].querySelector('.toast-notification__message')?.textContent?.trim()).toBe(
      'Test message'
    );
  });

  it('should apply type class to toast', () => {
    mockMessages.set([
      {
        id: '1',
        message: 'Error',
        type: ToastType.ERROR,
      },
    ]);
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const toast = el.querySelector('.toast-notification__toast--error');
    expect(toast).toBeTruthy();
  });

  it('should call removeMessage when toast is clicked', () => {
    const removeSpy = jasmine.createSpy('removeMessage');
    TestBed.overrideProvider(ToastNotificationService, {
      useValue: {
        messages: mockMessages,
        removeMessage: removeSpy,
      },
    });
    mockMessages.set([
      {
        id: '99',
        message: 'Close me',
        type: ToastType.INFO,
      },
    ]);
    const { fixture } = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const closeButton = el.querySelector('.toast-notification__close') as HTMLButtonElement;
    closeButton?.click();
    expect(removeSpy).toHaveBeenCalledWith('99');
  });
});
