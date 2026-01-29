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
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  @Input() icon: string = ''; // icon of the button
  @Input() tooltip: string = ''; // tooltip of the button
  @Input() ariaLabel: string = ''; // aria label of the button
  @Input() disabled: boolean = false; // disabled state of the button
  @Input() color: MaterialButtonColor = MaterialColor.PRIMARY; // color of the button
  @Input() type: ButtonType = 'button'; // type of the button
  @Input() clickHandler?: () => void; // click handler of the button
}
