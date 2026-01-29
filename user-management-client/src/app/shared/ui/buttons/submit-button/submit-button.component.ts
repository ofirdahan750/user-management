import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialColor } from '@core/enums/material-color.enum';
import {
  MaterialButtonColor,
  MaterialButtonVariant,
  ButtonType,
  DEFAULT_SUBMIT_BUTTON_TYPE,
  DEFAULT_SUBMIT_BUTTON_VARIANT,
} from '@core/types/button.types';
import { ICONS } from '@core/constants/icons.constants';
import { LABELS } from '@core/constants/labels.constants';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './submit-button.component.html',
  styleUrl: './submit-button.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitButtonComponent {
  readonly icons = ICONS;
  readonly labels = LABELS;

  @Input() label: string = LABELS.SUBMIT; // label of the button
  @Input() isLoading: boolean = false; // is loading of the button
  @Input() disabled: boolean = false; // disabled of the button
  @Input() type: ButtonType = DEFAULT_SUBMIT_BUTTON_TYPE;// type of the button
  @Input() color: MaterialButtonColor = MaterialColor.PRIMARY; // color of the button
  @Input() variant: MaterialButtonVariant = DEFAULT_SUBMIT_BUTTON_VARIANT; // variant of the button
  @Input() tooltip: string = ''; // tooltip of the button
  @Input() clickHandler?: () => void; // click handler of the button


// get tooltip text function to get the tooltip text
  get tooltipText(): string {
    if (this.tooltip) { // if the tooltip is present, return the tooltip
      return this.tooltip; // return the tooltip
    }
    if (this.disabled || this.isLoading) { // if the disabled or is loading is present, return the tooltip text
      return this.disabled ? this.labels.TOOLTIP_FORM_DISABLED : ''; // return the tooltip text
    }
    return this.labels.TOOLTIP_SUBMIT_FORM; // return the tooltip text
  }
}
