import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Event, HOUR_TYPES, Days, Day, Status } from './../../models';

import { API_URL, CLOSED_OFFER_IMAGE, PLACEHOLDER_IMAGE } from './../../config';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { catchError } from 'rxjs/operators';

import * as moment from 'moment';

export type DataStatus = 'UPDATED' | 'LOADING' | 'NOT_UPDATED';

@Injectable()
export class ApiProvider {

  public dataStatus = new BehaviorSubject<DataStatus>('NOT_UPDATED');

  public REGULAR_HOURS: HOUR_TYPES = 'REGULAR_HOURS';
  public SELECTED_HOURS: HOUR_TYPES = 'SELECTED_HOURS';

  public statuses: Status[] = [
    {
      id: 0,
      color: 'grey',
      classes: ['not_open'],
      src: './assets/icon/grey-dot.png',
      name: 'Venue is not open today'
    },
    {
      id: 1,
      color: 'orange',
      classes: ['will_be_open_today'],
      src: '/assets/icon/black-dot.png',
      name: 'Venue will be open today'
    },
    {
      id: 3,
      color: '#00ff00',
      classes: ['location_open'],
      src: '/assets/icon/green-dot.png',
      name: 'Venue is open'
    },
    {
      id: 4,
      color: 'red',
      classes: ['location_closing'],
      src: '/assets/icon/red-dot.png',
      name: 'Venue is closing'
    }
  ];

  constructor(public http: HttpClient) {
   
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${API_URL}/public-events`);
  }

  getLocationStatus(event: Event): Status {

    const currentDay = moment().format('dddd');

    let start = moment(event.days[currentDay].start_time, ['h:m a', 'H:m']);
    let end = moment(event.days[currentDay].end_time, ['h:m a', 'H:m']);

    let isOpenedToday: boolean = event.days[currentDay].is_opened;

    //console.log(isOpenedToday);

    let startMinutes = start.minutes() + start.hours() * 60;
    let endMinutes = end.minutes() + end.hours() * 60;
    let currentMinutes = moment().minutes() + moment().hours() * 60;

   /* console.log('Start:', start.format('HH:mm'));
    console.log('End: ', end.format('HH:mm'));
    console.log('Start minutes: ', startMinutes);
    console.log('End minutes: ', endMinutes);
    console.log('Current minutes', currentMinutes);*/

    if (!start || !isOpenedToday) {
      return this.statuses.find(status => status.id === 0);
    } else if (currentMinutes < startMinutes - 120 && endMinutes >= currentMinutes) {
      return this.statuses.find(status => status.id === 1);
    } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      let color = this.shadeFromBlueToGreen(100);

      return {
        id: 7,
        color: color,
        classes: ['location_closing'],
        src: '/assets/icon/green-dot.png',
        name: 'Venue is not open'
      }
    } else if ((startMinutes - 120) <= currentMinutes && currentMinutes <= endMinutes) {

      let color = this.shadeFromBlueToGreen(100 - (((startMinutes - currentMinutes) / 120) * 100));

      return {
        id: 8,
        color: color,
        classes: ['location_closing'],
        src: '/assets/icon/red-dot.png',
        name: 'The venue will be open within the next two hours'
      }

    } else if (startMinutes > currentMinutes) {
      return this.statuses.find(status => status.id === 1);
    } else if (endMinutes < currentMinutes) {
      return this.statuses.find(status => status.id === 4);
    } else {
      return this.statuses.find(status => status.id === 0);
    }
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

  getOffer(event: Event): string {
    if (event.hours_type === this.SELECTED_HOURS) {
      return this.getEventToday(event).is_opened ? this.getEventToday(event).name : 'No offers available today';
    } else {
      return event.name;
    }
  }

  getOfferImage(event: Event): string {
    if (event.hours_type === this.SELECTED_HOURS) {
      return this.getEventToday(event).is_opened ? this.getEventToday(event).image.url : CLOSED_OFFER_IMAGE;
    } else {
      return event.image && event.image.url ? event.image.url : PLACEHOLDER_IMAGE;
    }   
  }

  getEventToday(event: Event): Day {
    return event.days[moment().format('dddd')];
  }

  private shadeFromBlueToGreen(percentage: number): string {
    return this.rgbToHex(0, percentage / 100 * 255, (100 - percentage) / 100 * 255);
  }

  private rgbToHex(red, green, blue): string {
    var rgb = blue | (green << 8) | (red << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
  }

}
