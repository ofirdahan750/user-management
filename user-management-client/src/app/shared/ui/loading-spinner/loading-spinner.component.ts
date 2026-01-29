import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { selectIsLoading } from '@core/store/loading/loading.selectors';
import { AppState } from '@core/store/root-state.model';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  private store: Store<AppState> = inject(Store);
  
  isLoading$: Observable<boolean> = this.store.select(selectIsLoading); // isLoading state
}
