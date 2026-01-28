import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  @Input() type: 'button' | 'submit' = 'submit';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() variant: 'raised' | 'flat' | 'stroked' = 'raised';
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
