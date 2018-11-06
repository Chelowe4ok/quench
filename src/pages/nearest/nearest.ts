import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider, Settings } from './../../providers';
import { Event, HOUR_TYPES, Status, Days, Day } from './../../models';
import { DetailsPage } from '../';

import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Geocoder,
  GeocoderResult,
  Environment,
  LocationService,
  HtmlInfoWindow,
  Spherical,
  ILatLng,
} from '@ionic-native/google-maps';

export interface LocalError {
  id: 'LOCATION';
  message: string;
}

@IonicPage()
@Component({
  selector: 'page-nearest',
  templateUrl: 'nearest.html',
})
export class NearestPage implements OnDestroy{

  public events: Event[] = [];
  public errors: LocalError[] = [];

  private maxDistance: number = 25000;
  private userLocation: ILatLng;
  private subscribers: Subscription[] = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private settings: Settings,
    private api: ApiProvider
  ) {
  }

  ionViewDidLoad() {
    this.loadData();
  }

  loadData(): Promise<boolean> {

    // define current location
    this.initUserLocation();

    // quickly load storage and then update API data
    return new Promise<boolean>((resolve, reject) => {
      this.loadStorage()
        .then((events => {
          //this.sortByDistance(events);
          return this.loadApiData()
            .then((result) => resolve(result))
            .catch(error => reject(false));
        }))
        .catch(error => {
          return this.loadApiData()
            .then((result) => resolve(result))
            .catch(error => reject(false));
        });
    })
   
  }

  loadStorage(): Promise<Event[]> {
    return this.settings.getValue('events');
  }

  getOfferOfTheDay(event: Event): string {
    return this.api.getOffer(event);
  }

  async loadApiData(): Promise<boolean> {
    this.api.dataStatus.next('LOADING');

    return new Promise<boolean>((resolve, reject) => {
      let eventSubscriber = this.api.getEvents().subscribe(events => {
        this.sortByDistance(events);
        this.settings.setValue('events', events)
        this.api.dataStatus.next('UPDATED');
        resolve(true);
      },
        (error) => {
          this.api.dataStatus.next('NOT_UPDATED');
          resolve(false);
        });
      this.subscribers.push(eventSubscriber);
    });
   
  }

  doRefresh(refresher) {
    this.loadData()
      .then(data => {
        refresher.complete();
      })
      .catch(error => {
        alert('Data has not been updated');
        refresher.complete();
      });

  }

  detail(event: Event): void {
    this.navCtrl.push(DetailsPage, {
      event: event,
    });
  }

  private sortByDistance(events: Event[]): void {

    if (!this.userLocation) {
      // clear location error message
      this.errors = this.errors ? this.errors.filter(error => error.id != 'LOCATION') : [];

      this.errors.push({
        id: 'LOCATION',
        message: 'Current location is not defined'
      });

      // wait one second and try againt
      //this.initUserLocation();
      setTimeout(this.sortByDistance, 1000);
      this.events = events;
      return;
    }

    // clear location error message
    if (this.errors) {
      this.errors = this.errors.filter(error => error.id != 'LOCATION');
    }

    events = this.filterByDistance(this.maxDistance, events);

    events.sort((a: Event, b: Event) => {
      const distanceA = Spherical.computeDistanceBetween(this.userLocation, { lat: a.location.latitude, lng: a.location.longitude });
      const distanceB = Spherical.computeDistanceBetween(this.userLocation, { lat: b.location.latitude, lng: b.location.longitude });
      return distanceA - distanceB;
    });

    this.events = events;
  }

  filterByDistance(distance: number, events: Event[]): Event[] {

    if (!this.userLocation) return events;

    return events.filter(event => {

      const distanceMeters = Spherical.computeDistanceBetween(this.userLocation, { lat: event.location.latitude, lng: event.location.longitude });
      return distanceMeters < distance;
    })
  }

  getDistance(event: Event): string {
    if (!this.userLocation) return null;
    const distanceMeters = Spherical.computeDistanceBetween(this.userLocation, { lat: event.location.latitude, lng: event.location.longitude });

    const displayedDistance = distanceMeters ?
      distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${distanceMeters.toFixed(0)} meters`
      : '-';
    return displayedDistance;
  }

  getEventToday(event: Event): Day {
    return this.api.getEventToday(event);
  }

  private getLeftDuration(event: Event): number {

    const currentDay = moment().format('dddd');

    let start = moment(event.days['currentDay'].start_time, ['h:m a', 'H:m']);
    let end = moment(event.days['currentDay'].end_time, ['h:m a', 'H:m']);
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

  getLocationStatus(event: Event): Status {
    return this.api.getLocationStatus(event);
  }

  initUserLocation() {

    LocationService.getMyLocation({ enableHighAccuracy: true }).then(
      (result) => {
        this.userLocation = result.latLng;
      },
      (err) => {
        console.error(JSON.stringify(err));
      }
    ).catch((e) => {
      console.error(JSON.stringify(e));
    });
  }


  ngOnDestroy(): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber) {
        subscriber.unsubscribe();
      }
    })
  }

}
