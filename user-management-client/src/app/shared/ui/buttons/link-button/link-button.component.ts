import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialColor } from '@core/enums/material-color.enum';
import { MaterialButtonColor, MaterialButtonVariant } from '@core/types/button.types';

@Component({
  selector: 'app-link-button',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './link-button.component.html',
  styleUrl: './link-button.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkButtonComponent {
  @Input() route: string | string[] = ''; // route of the button
  @Input() label: string = ''; // label of the button
  @Input() icon: string = ''; // icon of the button
  @Input() tooltip: string = ''; // tooltip of the button
  @Input() variant: MaterialButtonVariant = 'flat'; // variant of the button
  @Input() color: MaterialButtonColor = MaterialColor.PRIMARY;
  @Input() showIcon: boolean = true; // show icon of the button
}
