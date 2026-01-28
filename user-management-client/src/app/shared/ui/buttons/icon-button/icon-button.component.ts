import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialColor } from '@core/enums/material-color.enum';
import { MaterialButtonColor, ButtonType } from '@core/types/button.types';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  @Input() icon: string = '';
  @Input() tooltip: string = '';
  @Input() ariaLabel: string = '';
  @Input() disabled: boolean = false;
  @Input() color: MaterialButtonColor = MaterialColor.PRIMARY;
  @Input() type: ButtonType = 'button';
  @Input() clickHandler?: () => void;
}
