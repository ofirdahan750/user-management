import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { URLS } from '@core/constants/urls.constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly URLS = URLS;
  readonly currentYear: number = new Date().getFullYear();
}
