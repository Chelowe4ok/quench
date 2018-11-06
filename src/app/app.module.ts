import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';

import { materialModules } from '../shared/material/material';

import { HttpClientModule } from '@angular/common/http';

// third part
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MyApp } from './app.component';
import { Settings, ApiProvider } from '../providers';

export function provideSettings(storage: Storage) {
 
  return new Settings(storage, {
    events: []
  });
}

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    IonicStorageModule.forRoot(),
    ...materialModules,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    ApiProvider,
    LaunchNavigator,
    BarcodeScanner
  ]
})
export class AppModule {}
