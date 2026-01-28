import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialColor } from '@core/enums/material-color.enum';
import { MaterialButtonColor, MaterialButtonVariant, ButtonType } from '@core/types/button.types';
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
  @Input() label: string = 'Submit';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() type: ButtonType = 'submit';
  @Input() color: MaterialButtonColor = MaterialColor.PRIMARY;
  @Input() variant: MaterialButtonVariant = 'raised';
  @Input() tooltip: string = '';
  @Input() clickHandler?: () => void;

  public readonly icons = ICONS;
  public readonly labels = LABELS;

  get tooltipText(): string {
    if (this.tooltip) {
      return this.tooltip;
    }
    if (this.disabled || this.isLoading) {
      return this.disabled ? this.labels.TOOLTIP_FORM_DISABLED : '';
    }
    return this.labels.TOOLTIP_SUBMIT_FORM;
  }
}
