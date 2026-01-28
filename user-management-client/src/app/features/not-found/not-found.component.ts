import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Routes } from '@core/enums/routes.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { LABELS } from '@core/constants/labels.constants';
import { MESSAGES } from '@core/constants/messages.constants';
import { ICONS } from '@core/constants/icons.constants';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {
  private router = inject(Router);
  
  public readonly labels = LABELS;
  public readonly messages = MESSAGES;
  public readonly icons = ICONS;
  public readonly routes = Routes;
  public readonly MaterialColor = MaterialColor;

  navigateToHome(): void {
    this.router.navigate([Routes.DASHBOARD]);
  }

  navigateToLogin(): void {
    this.router.navigate([Routes.LOGIN]);
  }
}
