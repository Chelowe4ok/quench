import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

import { MenuPage } from '../pages';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(
   platform: Platform,
   statusBar: StatusBar,
   splashScreen: SplashScreen,
   iconRegistry: MatIconRegistry,
   sanitizer: DomSanitizer,
  ) {
    platform.ready().then(() => {
      this.rootPage = MenuPage; 

      iconRegistry.addSvgIcon(
        'map-marker-distance',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/map-marker-distance.svg'));
      iconRegistry.addSvgIcon(
        'information-outline',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/information-outline.svg'));
      iconRegistry.addSvgIcon(
        'settings',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/settings.svg'));
      iconRegistry.addSvgIcon(
        'sort-descending',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/sort-descending.svg'));
      iconRegistry.addSvgIcon(
        'facebook',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/facebook.svg'));
      iconRegistry.addSvgIcon(
        'uber',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/uber.svg'));
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

