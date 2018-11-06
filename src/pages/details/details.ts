import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

import { FirstRunPage } from '../';
import { CLOSED_OFFER_IMAGE, PLACEHOLDER_IMAGE, CLOSED_OFFER_IMAGE_THUMB } from './../../config';


import { ApiProvider, Settings } from './../../providers';
import { Event, Status, Days, Day, HOUR_TYPES, MAP_CONTROLS } from './../../models';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';


@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {

  event: Event;
  days: Day[] = [];
  public REGULAR_HOURS: HOUR_TYPES = 'REGULAR_HOURS';
  public SELECTED_HOURS: HOUR_TYPES = 'SELECTED_HOURS';
  public GOOGLE_MAPS_DIRECTION: boolean = false;
  public UBER: boolean = false;


  controls: string[] = [];
  location: {
    lat: number;
    lng: number;
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private api: ApiProvider,
    private launchNavigator: LaunchNavigator
    ) {
    let event = navParams.get('event');
    this.event = event;
    console.log(event);

    if (!event) {
      this.navCtrl.setRoot(FirstRunPage);
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailsPage');
    this.initDays();
    this.checkAvailabledApps(); 
  }

  getOfferToday(): string {
    if (!this.event) return;

    return this.getOffer(this.event);
  }

  initDays(): void {

    console.log(this.event);
    if (!this.event) {
      setTimeout(this.initDays, 200);
      return;
    }

    for (let prop in this.event.days) {
      this.days.push({
        day_name: prop,
        name: this.event.days[prop].name,
        is_opened: this.event.days[prop].is_opened,
        start_time: this.event.days[prop].start_time,
        end_time: this.event.days[prop].end_time,
        image: this.event.days[prop].image,
      });
    }

    console.log(this.days);
  }

  leftDuration(): string {
    return `${this.getLeftDuration(this.event)} min`;
  }

  getLeftDuration(event: Event): number {

    if (!event) return null;

    const currentDay = moment().format('dddd');

    let start = moment(event.days[currentDay].start_time, ['h:m a', 'H:m']);
    let end = moment(event.days[currentDay].end_time, ['h:m a', 'H:m']);
    let minutesOfStartDate = start.minutes() + start.hours() * 60;
    let minutesOfEndDate = end.minutes() + end.hours() * 60;
    let currentMinutes = moment().minutes() + moment().hours() * 60;
    let isCurrentDay: boolean = event.days[moment().format('dddd')];

    if (!isCurrentDay) {
      return null;
    } else if (minutesOfStartDate <= currentMinutes && currentMinutes <= minutesOfEndDate) {
      return 0;
    } else if (minutesOfStartDate > currentMinutes) {
      return minutesOfStartDate - currentMinutes;
    } else {
      return minutesOfEndDate - currentMinutes;
    }
  }

  getVenueImageBg(): string {
    if (!this.event || !this.event.venue_image) return `url(${PLACEHOLDER_IMAGE})`;

    return `url(${this.event.venue_image.url})`;
  }

  getVenueDayImageBg(dayName: string): string {
    if (!this.event || !this.event.days[dayName].image) return `url(${PLACEHOLDER_IMAGE})`;

    if (!this.event.days[dayName].is_opened) return `url(${CLOSED_OFFER_IMAGE_THUMB})`;

    return `url(${this.event.days[dayName].image.url})`;
  }

  launchDirection() {

    this.launchNavigator.isAppAvailable(this.launchNavigator.APP.GOOGLE_MAPS)
      .then((isAvailable) => {
        let app;
        if (isAvailable) {
          app = this.launchNavigator.APP.GOOGLE_MAPS;
        } else {
          console.warn("Google Maps not available - falling back to user selection");
          app = this.launchNavigator.APP.USER_SELECT;
        }
        this.launchNavigator.navigate([this.event.location.latitude, this.event.location.longitude], {
          app: app
        });
      })
      .catch((error) => {
        alert(`Can not launch direction: ${error}`);
      })
  }

  launchUber() {
    let options: LaunchNavigatorOptions = {
      start: this.location ? [this.location.lat, this.location.lng] : null,
      app: this.launchNavigator.APP.UBER
    };

    this.launchNavigator.navigate([this.event.location.latitude, this.event.location.longitude], options)
      .then(
      success => console.log('Launched navigator'),
      error => console.log('Error launching navigator', error)
      );
  }

  controlIsAvailable(controleName: string): boolean {
    return this.controls.indexOf(controleName) === -1 ? false : true;
  }

  getOffer(event: Event): string {
    if (event.hours_type === this.SELECTED_HOURS) {
      return this.getEventToday(event).is_opened ? this.getEventToday(event).name : 'No offers available today';
    } else {
      return event.name;
    }
  }

  getOfferImage(): string {
    if (!this.event) return null;


    if (this.event.hours_type === this.SELECTED_HOURS) {
      return this.getEventToday(this.event).is_opened ? this.getEventToday(this.event).image.url : CLOSED_OFFER_IMAGE;
    } else {
      return this.event.image && this.event.image.url ? this.event.image.url : PLACEHOLDER_IMAGE;
    }
  }

  getEventToday(event: Event): Day {
    return event.days[moment().format('dddd')];
  }

  private checkAvailabledApps(): void {
    console.log('Start Check');

    this.launchNavigator.availableApps().then((res: any) => {
      console.log('END Check', res);
      if (res.uber) {
        this.UBER = true;
      }

      if (res.google_maps) {
        this.GOOGLE_MAPS_DIRECTION = true;
      }

    }).catch(err => console.error(err));
  }
}
