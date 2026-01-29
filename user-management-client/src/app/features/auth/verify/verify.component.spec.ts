import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { Routes } from '@core/enums/routes.enum';
import { VerificationStatus } from '@core/enums/verification-status.enum';
import { VerifyComponent } from './verify.component';
import { AuthService } from '@core/services/auth.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';

describe('VerifyComponent', () => {
  const mockQueryParams: Record<string, string> = {};

  const mockAuthService = {
    verifyEmail: vi.fn(),
    resendVerificationEmail: vi.fn(),
  };

  const mockToastService = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    Object.keys(mockQueryParams).forEach((k) => delete mockQueryParams[k]);

    await TestBed.configureTestingModule({
      imports: [VerifyComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            get snapshot() {
              return { queryParams: { ...mockQueryParams } };
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastNotificationService, useValue: mockToastService },
      ],
    }).compileComponents();
  });

  const createFixture = () => {
    const fixture = TestBed.createComponent(VerifyComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  };

  it('should create component', () => {
    const { component } = createFixture();
    expect(component).toBeTruthy();
  });

  it('should expose labels, routes, MESSAGES, icons, VerificationStatus, MaterialColor', () => {
    const { component } = createFixture();
    expect(component.labels).toBe(LABELS);
    expect(component.routes).toBe(Routes);
    expect(component.MESSAGES).toBe(MESSAGES);
    expect(component.icons).toBeDefined();
    expect(component.VerificationStatus).toBe(VerificationStatus);
    expect(component.MaterialColor).toBeDefined();
  });

  it('should have initial status PENDING and countdown 5', () => {
    const { component } = createFixture();
    expect(component.status()).toBe(VerificationStatus.PENDING);
    expect(component.countdown()).toBe(5);
  });

  it('ngOnInit with token and email should set email, token, LOADING and call verifyEmail', () => {
    mockQueryParams['token'] = 'token123';
    mockQueryParams['email'] = 'user@test.com';
    const verifySubject = new Subject<unknown>();
    mockAuthService.verifyEmail.mockReturnValue(verifySubject.asObservable());

    const { component } = createFixture();
    component.ngOnInit();

    expect(component.email()).toBe('user@test.com');
    expect(component.token()).toBe('token123');
    expect(component.status()).toBe(VerificationStatus.LOADING);
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('token123', 'user@test.com');
  });

  it('ngOnInit with only email should set email and status PENDING', () => {
    mockQueryParams['email'] = 'user@test.com';

    const { component } = createFixture();
    component.ngOnInit();

    expect(component.email()).toBe('user@test.com');
    expect(component.token()).toBe('');
    expect(component.status()).toBe(VerificationStatus.PENDING);
    expect(mockAuthService.verifyEmail).not.toHaveBeenCalled();
  });

  it('ngOnInit with no params should set status ERROR', () => {
    const { component } = createFixture();
    component.ngOnInit();

    expect(component.status()).toBe(VerificationStatus.ERROR);
    expect(mockAuthService.verifyEmail).not.toHaveBeenCalled();
  });

  it('verifyEmail success should set isVerifying false, status SUCCESS and show success toast', () => {
    const verifySuccess$ = new Subject<unknown>();
    mockAuthService.verifyEmail.mockReturnValue(verifySuccess$.asObservable());

    const { component } = createFixture();
    component.verifyEmail('t', 'e@e.com');
    expect(component.isVerifying()).toBe(true);

    verifySuccess$.next({});
    verifySuccess$.complete();

    expect(component.isVerifying()).toBe(false);
    expect(component.status()).toBe(VerificationStatus.SUCCESS);
    expect(mockToastService.showSuccess).toHaveBeenCalledWith(MESSAGES.VERIFICATION_SUCCESS);
  });

  it('verifyEmail error should set isVerifying false, status ERROR and show error toast', () => {
    mockAuthService.verifyEmail.mockReturnValue(throwError(() => new Error('fail')));

    const { component } = createFixture();
    component.verifyEmail('t', 'e@e.com');

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(component.isVerifying()).toBe(false);
        expect(component.status()).toBe(VerificationStatus.ERROR);
        expect(mockToastService.showError).toHaveBeenCalledWith(MESSAGES.VERIFICATION_ERROR);
        resolve();
      }, 0);
    });
  });

  it('onVerifyClick should call verifyEmail when token and email are set', () => {
    mockAuthService.verifyEmail.mockReturnValue(of({}));

    const { component } = createFixture();
    component.email.set('user@test.com');
    component.token.set('token123');
    component.onVerifyClick();

    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('token123', 'user@test.com');
  });

  it('onVerifyClick should not call verifyEmail when token or email is missing', () => {
    const { component } = createFixture();
    component.email.set('');
    component.token.set('token123');
    component.onVerifyClick();
    expect(mockAuthService.verifyEmail).not.toHaveBeenCalled();

    component.email.set('e@e.com');
    component.token.set('');
    component.onVerifyClick();
    expect(mockAuthService.verifyEmail).not.toHaveBeenCalled();
  });

  it('resendVerification should return early when email is empty', () => {
    const { component } = createFixture();
    component.email.set('');
    component.resendVerification();
    expect(mockAuthService.resendVerificationEmail).not.toHaveBeenCalled();
  });

  it('resendVerification success with verificationToken should set token and status PENDING', () => {
    mockAuthService.resendVerificationEmail.mockReturnValue(
      of({ verificationToken: 'new-token' }),
    );

    const { component } = createFixture();
    component.email.set('user@test.com');
    component.resendVerification();

    expect(component.token()).toBe('new-token');
    expect(component.status()).toBe(VerificationStatus.PENDING);
    expect(mockToastService.showSuccess).not.toHaveBeenCalled();
  });

  it('resendVerification success without verificationToken should show success toast', () => {
    mockAuthService.resendVerificationEmail.mockReturnValue(of({}));

    const { component } = createFixture();
    component.email.set('user@test.com');
    component.resendVerification();

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockToastService.showSuccess).toHaveBeenCalledWith(
          MESSAGES.RESEND_VERIFICATION_SUCCESS,
        );
        resolve();
      }, 0);
    });
  });

  it('resendVerification error should show error toast', () => {
    mockAuthService.resendVerificationEmail.mockReturnValue(
      throwError(() => new Error('fail')),
    );

    const { component } = createFixture();
    component.email.set('user@test.com');
    component.resendVerification();

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(mockToastService.showError).toHaveBeenCalledWith(MESSAGES.ERROR);
        resolve();
      }, 0);
    });
  });

  it('getVerificationUrl should return URL with token and email when both set', () => {
    const { component } = createFixture();
    component.token.set('abc');
    component.email.set('user@test.com');
    const url = component.getVerificationUrl();
    expect(url).toContain(Routes.VERIFY);
    expect(url).toContain('token=abc');
    expect(url).toContain('email=');
    expect(url).toContain(encodeURIComponent('user@test.com'));
  });

  it('getVerificationUrl should return empty string when token or email missing', () => {
    const { component } = createFixture();
    expect(component.getVerificationUrl()).toBe('');

    component.token.set('t');
    expect(component.getVerificationUrl()).toBe('');

    component.token.set('');
    component.email.set('e@e.com');
    expect(component.getVerificationUrl()).toBe('');
  });

  it('copyVerificationLink should not call clipboard when url is empty', () => {
    const { component } = createFixture();
    const writeTextSpy = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true,
    });
    component.copyVerificationLink();
    expect(writeTextSpy).not.toHaveBeenCalled();
  });

  it('copyVerificationLink should write to clipboard and show toast when url and clipboard exist', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true,
    });

    const { component } = createFixture();
    component.token.set('t');
    component.email.set('e@e.com');
    component.copyVerificationLink();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${Routes.VERIFY}?token=t`),
    );
    expect(mockToastService.showSuccess).toHaveBeenCalledWith(MESSAGES.VERIFICATION_LINK_COPIED);
  });

  it('verifyClickHandler should call onVerifyClick', () => {
    const { component } = createFixture();
    const spy = vi.spyOn(component, 'onVerifyClick');
    component.verifyClickHandler();
    expect(spy).toHaveBeenCalled();
  });

  it('resendClickHandler should call resendVerification', () => {
    const { component } = createFixture();
    const spy = vi.spyOn(component, 'resendVerification');
    component.resendClickHandler();
    expect(spy).toHaveBeenCalled();
  });

  it('should render title for VERIFICATION_LOADING when status is LOADING', () => {
    mockQueryParams['email'] = 'u@u.com';
    const { fixture, component } = createFixture();
    fixture.detectChanges();
    component.status.set(VerificationStatus.LOADING);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.verify__title');
    expect(title?.textContent?.trim()).toBe(MESSAGES.VERIFICATION_LOADING);
  });
});
