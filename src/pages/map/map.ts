import {
  Component, NgZone, ViewChild, ElementRef,
  ComponentRef,
  ApplicationRef,
  Injector,
  ComponentFactoryResolver,
  OnInit, OnDestroy
} from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, ModalController } from 'ionic-angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  GoogleMapsAnimation,
  MarkerOptions,
  Marker,
  Geocoder,
  GeocoderResult,
  Environment,
  LocationService,
  HtmlInfoWindow,
  Spherical,
  BaseArrayClass
} from '@ionic-native/google-maps';

import * as moment from 'moment';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { bottomSnapAnimation } from '../../shared/animations';

import { Settings, ApiProvider, DataStatus } from '../../providers';
import { Event, Status, MapConfiguration, MAP_CONTROLS } from '../../models';
import { MarkerDetailsComponent } from '../../components/marker-details/marker-details';
import { MAP_STYLE } from '../../theme/map.style';
import { Subscription } from 'rxjs/Subscription';

export interface DataStatuses {
  id: DataStatus;
  label: string;
  icon: string;
  color: string;
};

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  animations: [bottomSnapAnimation]
})
export class MapPage implements OnDestroy{
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('markerDetails') markerDetailsElement: ElementRef;

  public events: Event[] = [];
  public statuses: Status[] = [];
  public map: GoogleMap;
  public loadingSearch: any;
  public loadingData: boolean = false;
  public search_address: string = '';
  public markerDetailEvent: Event;
  public userLocation: any;

  public mapConfiguration: MapConfiguration = {
    controls: [],
  }

  dataStatuses: DataStatuses[] = [
    {
      id: 'LOADING',
      label: 'Downloading data',
      icon: 'cloud_upload',
      color: 'yellow'
    },
    {
      id: 'UPDATED',
      label: 'Data updated',
      icon: 'verified_user',
      color: 'green'
    },
    {
      id: 'NOT_UPDATED',
      label: 'Data not updated',
      icon: 'error',
      color: 'red'
    },
  ]
  dataStatus: DataStatuses = {
    id: 'NOT_UPDATED',
    label: 'Data not updated',
    icon: 'error',
    color: 'red'
  };

  private mvcArray: BaseArrayClass<MarkerOptions>;
  private fullListOfEvents: Event[] = [];
  private centeredMarker: Marker;
  private maxDistance = 25000;
  private eventMarkers: Marker[] = [];
  private htmInfoWindow: HtmlInfoWindow;
  private updateInterval: any;
  private subscribers: Subscription[] = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private apiProvider: ApiProvider,
    private settings: Settings,
    private launchNavigator: LaunchNavigator,
    private ngZone: NgZone,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
  ) {
  }

  ionViewDidLoad() {

    this.platform.ready().then(() => {
      this.loadMap();
    });

    this.apiProvider.dataStatus.subscribe((status: DataStatus) => {
      this.dataStatus = this.dataStatuses.find(s => s.id === status);
    })
  }

  async loadData(): Promise<any> {
    this.statuses = this.apiProvider.statuses;

    this.apiProvider.dataStatus.next('LOADING');
    this.loadStorage().then(data => {
      this.fullListOfEvents = data;
      this.events = this.filterByDistance(this.maxDistance, data);
      this.loadApiData();
    }).catch(error => {
      this.loadApiData();
      });

    this.checkAvailabledApps();
    
  }

  loadApiData(): void {
    let eventSubscriber = this.apiProvider.getEvents().subscribe(events => {

      this.fullListOfEvents = events;
      this.events = this.filterByDistance(this.maxDistance, events);
      this.addMarkers();

      this.loadingData = true;
      this.settings.setValue('events', events)
      this.apiProvider.dataStatus.next('UPDATED');
    }, (error) => {
      this.apiProvider.dataStatus.next('NOT_UPDATED');
    });
    this.subscribers.push(eventSubscriber);
  }

  checkAvailabledApps(): void {
    this.launchNavigator.availableApps().then((res: any) => {

      if (res.uber) {
        this.mapConfiguration.controls.push(MAP_CONTROLS.UBER);
      }

      if (res.google_maps) {
        this.mapConfiguration.controls.push(MAP_CONTROLS.GOOGLE_MAPS_DIRECTION);
      }

    }).catch(err => console.error(err));
  }

  loadMap() {

    // This code is necessary for browser
    /*Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyBBYSYi1fVay9lDh0Y9zPM6eaPxsMlWivU',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyBBYSYi1fVay9lDh0Y9zPM6eaPxsMlWivU'
    });*/

    let mapOptions: GoogleMapOptions = {
      camera: {
        zoom: 16,
      },
      styles: MAP_STYLE,
      controls: {
        mapToolbar: false   // currently Android only
      },
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    this.getUserLocation();

    this.loadData();

    this.handleMapEvents();
  }

  addMarkers(): void {
    
    this.map.clear();

    this.addCurrentLocationMarker();
    this.addCenteredMarker();

    this.htmInfoWindow = new HtmlInfoWindow();

    let options: MarkerOptions[] = [];

    this.fullListOfEvents.forEach(event => {

      let option: MarkerOptions = {
        icon: this.apiProvider.getLocationStatus(event).id == 0 ?
          this.apiProvider.getLocationStatus(event).src :this.apiProvider.getLocationStatus(event).color,
        position: {
          lat: event.location.latitude,
          lng: event.location.longitude
        },
        event: event,
        styles: {
          'padding': 0,
          'min-width': '250px'
        },
        visible: this.getDistanceToEvent(event) < this.maxDistance,
        animation: GoogleMapsAnimation.DROP,
        disableAutoPan: true
      };

      options.push(option);
    });

    // Create markers
    this.mvcArray = new BaseArrayClass<MarkerOptions>(options);
    this.mvcArray.mapAsync((markerOpts: MarkerOptions, next: (marker: Marker) => void) => {
      this.map.addMarker(markerOpts).then(next);
    }).then((markers: Marker[]) => {

      this.eventMarkers = markers;

      // Listen the MARKER_CLICK event on all markers
      markers.forEach((marker: Marker) => {
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((parmas: any[]) => {
          this.onMarkerClick(parmas);
        });
      });

      this.updateEventStatus();
    });

  }

  onMarkerClick(params: any[]) {
    // Get a marker instance from the passed parameters
    let marker: Marker = params.pop();

    // Create a component
    const compFactory = this.resolver.resolveComponentFactory(MarkerDetailsComponent);
    let compRef: ComponentRef<MarkerDetailsComponent> = compFactory.create(this.injector);
    compRef.instance.event = marker.get("event");
    compRef.instance.controls = this.mapConfiguration.controls;
    compRef.instance.location = this.userLocation;

    this.appRef.attachView(compRef.hostView);

    let div = compRef.location.nativeElement;

    // Dynamic rendering
    this.ngZone.run(() => {
      this.htmInfoWindow.setContent(div);
      this.htmInfoWindow.open(marker);
    });

    // Destroy the component when the htmlInfoWindow is closed.
    this.htmInfoWindow.one(GoogleMapsEvent.INFO_CLOSE).then(() => {
      compRef.destroy();
    });
  }

  updateEventStatus(): void {

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.eventMarkers.forEach((marker: Marker) => {
        let event = marker.get('event');

        if (!event) return;

        /*marker.setIcon(this.apiProvider.getLocationStatus(event).id == 0 ?
          this.apiProvider.getLocationStatus(event).src :
          this.apiProvider.getLocationStatus(event).color)*/
      })

    }, 10000)
  }

  getDistanceToEvent(event: Event): number {

    if (!this.map.getCameraPosition().target || !event) return 0;

    const distanceMeters = Spherical.computeDistanceBetween({ lat: this.map.getCameraPosition().target.lat, lng: this.map.getCameraPosition().target.lng }, { lat: event.location.latitude, lng: event.location.longitude });
    return distanceMeters;
  }

  updateDisplayedMarkers(): void {

    // TODO: very many time launch

    this.eventMarkers.forEach((marker) => {
      let event = marker.get("event");
      marker.setVisible(this.getDistanceToEvent(event) < this.maxDistance);
    });

    this.events = this.filterByDistance(this.maxDistance, this.fullListOfEvents);
  }


  filterByDistance(distance: number, events: Event[]): Event[] {

    if (!this.map || !this.map.getCameraPosition().target) return events;

    return events.filter(event => {
      const distanceMeters = Spherical.computeDistanceBetween({ lat: this.map.getCameraPosition().target.lat, lng: this.map.getCameraPosition().target.lng }, { lat: event.location.latitude, lng: event.location.longitude });
      return distanceMeters < distance;
    })
  }

  addInfoWindow(marker: Marker, event: Event): void {
    let infoWindow = new HtmlInfoWindow();
    //let frame: HTMLElement = document.createElement('div');


    const distanceMeters = Spherical.computeDistanceBetween(this.userLocation, { lat: event.location.latitude, lng: event.location.longitude });

    const displayedDistance = distanceMeters ?
      distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${distanceMeters.toFixed(0)} meters`
      : '-';

    const currentDay = moment().format('dddd');

    this.markerDetailEvent = event;
    let frame = this.markerDetailsElement.nativeElement;

    infoWindow.setContent(frame, {width: "250px"});


    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {

      this.showDetails(event);
      
      infoWindow.open(marker);
    })
  }

  showDetails(event: Event): void {
    this.markerDetailEvent = event;
  }

  loadStorage(): Promise<Event[]> {
    return this.settings.getValue('events');
  }

  addCenteredMarker(): void {

    if (this.centeredMarker) return;

    if (!this.map || !this.map.getCameraPosition().target) {
      setTimeout(this.addCenteredMarker, 1000);
      return;
    }

    this.centeredMarker = this.map.addMarkerSync({
          icon: './assets/icon/center-map-pin.png',
          animation: 'DROP',
          position: {
            lat: this.map.getCameraPosition().target.lat,
            lng: this.map.getCameraPosition().target.lng
          },
        });
  }

  addCurrentLocationMarker(): void {
    LocationService.getMyLocation({ enableHighAccuracy: true }).then(
      (result) => {

        this.userLocation = result.latLng;

        let marker: Marker = this.map.addMarkerSync({
          title: 'You are here',
          icon: './assets/icon/my_location_pin_4.png',
          animation: 'DROP',
          position: {
            lat: this.userLocation.lat,
            lng: this.userLocation.lng
          },
        });

        this.map.setCameraTarget(this.userLocation);
        this.map.setCameraZoom(16);
      },
      (err) => {
        console.error(JSON.stringify(err));
      }
    ).catch((e) => {
      console.error(JSON.stringify(e));
    });
  }

  private handleMapEvents(): void {
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(() => {
      this.showDetails(null);
    });



    this.map.on(GoogleMapsEvent.CAMERA_MOVE).subscribe((e) => {

      if (this.centeredMarker) {
        this.centeredMarker.setPosition(e[0].target);
      }

      this.updateDisplayedMarkers();
    })
  }

  private getLeftDuration(event: Event): number {

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


  async findGeolocation(event) {

    if (!this.search_address) return;

    this.loadingSearch = await this.loadingCtrl.create({
      content: 'Please wait...'
    });
    await this.loadingSearch.present();

    // Address -> latitude,longitude
    Geocoder.geocode({
      "address": this.search_address
    })
      .then((results: GeocoderResult[]) => {

        this.loadingSearch.dismiss();

        if (!results && results.length === 0 && !results[0].position) return;

        this.map.animateCamera({
          'target': results[0].position,
          'zoom': 16
        }).then(() => {
         
          });
      }).catch(error => {
        console.error(error);
        this.loadingSearch.dismiss();
      });
  }

  getUserLocation() {

    LocationService.getMyLocation({ enableHighAccuracy: true }).then(
      (result) => {
      
        this.userLocation = result.latLng;

        this.map.setCameraTarget(this.userLocation);
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
