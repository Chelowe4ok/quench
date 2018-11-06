import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharePage } from './share';


import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    SharePage,
  ],
  imports: [
    IonicPageModule.forChild(SharePage),
    SharedModule
  ],
})
export class SharePageModule {}
