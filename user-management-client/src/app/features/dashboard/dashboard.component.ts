import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateFormatPipe } from '@shared/pipes/date-format/date-format.pipe';
import { NameCapitalizePipe } from '@shared/pipes/name-capitalize/name-capitalize.pipe';
import { Routes } from '@core/enums/routes.enum';
import { MaterialColor } from '@core/enums/material-color.enum';
import { UserProfile, DEFAULT_USER_PROFILE } from '@core/models/user.model';
import { LABELS } from '@core/constants/labels.constants';
import { ICONS } from '@core/constants/icons.constants';
import { selectUser } from '@core/store/auth/auth.selectors';
import { AppState } from '@core/store/root-state.model';
import { UtilService } from '@core/services/util/util.service';

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
    NameCapitalizePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly routes = Routes;
  readonly labels = LABELS;
  readonly icons = ICONS;
  readonly MaterialColor = MaterialColor;

  private store: Store<AppState> = inject(Store);
  private utilService = inject(UtilService);

  currentUser$: Observable<UserProfile> = this.store.select(selectUser).pipe(
    // user state
    map((user) => user ?? DEFAULT_USER_PROFILE),
    startWith(DEFAULT_USER_PROFILE),
  );

  welcomeMessage$: Observable<string> = this.currentUser$.pipe(
    map((user) =>
      user.firstName
        ? `${LABELS.WELCOME}, ${this.utilService.capitalizeFirst(user.firstName)}!`
        : '',
    ),
  );
}
