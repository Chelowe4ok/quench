import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailsPage } from './details';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    DetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailsPage),
    SharedModule
  ],
})
export class DetailsPageModule {}
