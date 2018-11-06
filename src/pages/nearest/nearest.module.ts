import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NearestPage } from './nearest';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    NearestPage,
  ],
  imports: [
    IonicPageModule.forChild(NearestPage),
    SharedModule
  ],
})
export class NearestPageModule {}
