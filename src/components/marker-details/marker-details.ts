import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { NavController, NavParams } from 'ionic-angular';

import { DetailsPage } from '../../pages';
import { Event, MAP_CONTROLS, Status, HOUR_TYPES } from '../../models/';
import { Settings, ApiProvider, DataStatus } from '../../providers';
import { CLOSED_OFFER_IMAGE, PLACEHOLDER_IMAGE, CLOSED_OFFER_IMAGE_THUMB } from './../../config';

import {
  Spherical,
} from '@ionic-native/google-maps';

import * as moment from 'moment';

@Component({
  selector: 'marker-details',
  templateUrl: 'marker-details.html'
})
export class MarkerDetailsComponent implements OnChanges {

  event: Event;
  imageUrl: string;
  controls: string[];
  location: {
    lat: number;
    lng: number;
  };

  currentDay: string;

  public REGULAR_HOURS: HOUR_TYPES = 'REGULAR_HOURS';
  public SELECTED_HOURS: HOUR_TYPES = 'SELECTED_HOURS';

  constructor(
    public navCtrl: NavController,
    private launchNavigator: LaunchNavigator,
    private apiProvider: ApiProvider,
  ) {
    console.log('Hello MarkerDetailsComponent Component');
  }

  ngOnInit() {
    this.currentDay = moment().format('dddd');
    this.imageUrl = this.getVenueImageBg(this.currentDay);
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...

    console.log(changes);

    if (changes.event) {
      this.event = this.event;
    }
  }

  detail(): void {
    this.navCtrl.push(DetailsPage, {
      event: this.event,
    });
  }

  getVenueImageBg(dayName: string): string {
    if (this.event.hours_type === this.REGULAR_HOURS) {

      if (!this.event || !this.event.venue_image) return `url(${PLACEHOLDER_IMAGE})`;

      return `url(${this.event.venue_image.url})`;
    } else {
      if (!this.event || !this.event.days[dayName].image) return `url(${PLACEHOLDER_IMAGE})`;

      if (!this.event.days[dayName].is_opened) return `url(${CLOSED_OFFER_IMAGE_THUMB})`;

      return `url(${this.event.days[dayName].image.url})`;
    }

  }

  displayedDistance(): string {
    if (!this.location || !this.location.lat) {
      return '-';
    }

    const distanceMeters = Spherical.computeDistanceBetween(this.location, { lat: this.event.location.latitude, lng: this.event.location.longitude });

    const displayedDistance = distanceMeters ?
      distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${distanceMeters.toFixed(0)} meters`
      : '-';

    return displayedDistance;
  }

  getLocationStatus(event: Event): Status {
    return this.apiProvider.getLocationStatus(event);
  }

  getLeftDuration(event: Event): number {
    return this.apiProvider.getLeftDuration(event);
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

}
