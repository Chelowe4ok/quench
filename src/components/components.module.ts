import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { MarkerDetailsComponent } from './marker-details/marker-details';

import { SharedModule } from '../shared/shared.module';
import { DetailsComponent } from './details/details';

@NgModule({
	declarations: [
    MarkerDetailsComponent,
    DetailsComponent],
	imports: [
    CommonModule,
    SharedModule
  ],
  entryComponents: [MarkerDetailsComponent],
	exports: [
    MarkerDetailsComponent,
    DetailsComponent]
})
export class ComponentsModule {}
