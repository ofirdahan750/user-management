import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '@shared/components/header/header.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner/loading-spinner.component';
import { ToastNotificationComponent } from '@shared/ui/toast-notification/toast-notification.component';
import { routeAnimations } from '@core/animations/route.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    ToastNotificationComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private router = inject(Router);

  getRouteAnimationData() {
    return this.router.url;
  }
}
