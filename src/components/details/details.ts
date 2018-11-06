import { Component } from '@angular/core';

/**
 * Generated class for the DetailsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'details',
  templateUrl: 'details.html'
})
export class DetailsComponent {

  text: string;

  constructor() {
    console.log('Hello DetailsComponent Component');
    this.text = 'Hello World';
  }

}
