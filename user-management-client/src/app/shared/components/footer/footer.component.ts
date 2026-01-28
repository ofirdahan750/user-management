import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  public readonly currentYear = new Date().getFullYear();
  public readonly linkedInUrl = 'https://www.linkedin.com/in/ofir-dahan-8ba3a318a/';
  public readonly githubUrl = 'https://github.com/ofirdahan750';
}
