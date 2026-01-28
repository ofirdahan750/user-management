import { Component, ViewEncapsulation, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { NameCapitalizePipe } from '@shared/pipes/name-capitalize.pipe';
import { Routes } from '@core/enums/routes.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { UserProfile } from '@core/models/user.model';
import { LABELS } from '@core/constants/labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { selectUser } from '@core/store/auth/auth.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DateFormatPipe,
    NameCapitalizePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private store = inject(Store);

  public currentUser$: Observable<UserProfile | null> = this.store.select(selectUser);
  public welcomeMessage$: Observable<string> = this.currentUser$.pipe(
    map(user => user ? `${LABELS.WELCOME}, ${user.firstName}!` : '')
  );
  
  public readonly routes = Routes;
  public readonly labels = LABELS;
  public readonly icons = ICONS;
  public readonly MaterialColor = MaterialColor;
}
