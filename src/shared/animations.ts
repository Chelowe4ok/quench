import {
  trigger,
  animate,
  transition,
  style,
  state,
  query,
  group
} from '@angular/animations';

export const bottomSnapAnimation = trigger('bottomSnapAnimation', [
  state('inactive', style({
    transform: 'translateY(100%)',
    display: 'none'
  })),
  state('active', style({
    transform: 'translateY(0)',
    display: 'block'
  })),
  transition('inactive => active', animate('0ms ease-in')),
  transition('active => inactive', animate('0ms ease-out'))
]);
