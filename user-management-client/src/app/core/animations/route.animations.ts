import { trigger, transition, style, query, animate, group, animateChild } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Set a default style for enter and leave
    query(':enter, :leave', [
      style({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%'
      })
    ], { optional: true }),
    
    // Animate the new page in
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' })
    ], { optional: true }),
    
    // Animate the old page out and new page in simultaneously
    group([
      query(':leave', [
        animate('250ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ], { optional: true }),
      
      query(':enter', [
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ])
]);
