import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { FormsModule } from '@angular/forms';

import { materialModules } from './material/material';

@NgModule({
  declarations: [
  ],
  imports: [
    FormsModule,
    ...materialModules
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ],
  exports: [
    FormsModule,
    ...materialModules
  ]
})
export class SharedModule {}
