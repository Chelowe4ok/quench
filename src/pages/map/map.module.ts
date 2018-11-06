import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapPage } from './map';

import { ComponentsModule } from '../../components/components.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    IonicPageModule.forChild(MapPage),
    SharedModule,
    ComponentsModule,
  ],
})
export class MapPageModule {}
