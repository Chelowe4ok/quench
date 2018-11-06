import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav } from 'ionic-angular';

import { FirstRunPage } from '../';
import { Settings, ApiProvider, DataStatus } from '../../providers';

export interface DataStatuses {
  id: DataStatus;
  label: string;
  icon: string;
  color: string;
};

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage { 

  @ViewChild(Nav) nav: Nav;

  rootPage = FirstRunPage;

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
      color: 'white'
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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private api: ApiProvider
  ) {
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuPage');
    this.api.dataStatus.subscribe((status: DataStatus) => {
      this.dataStatus = this.dataStatuses.find(s => s.id === status);
    })
  }

  goToPage(page: string): void {
    console.log(page);
    this.nav.setRoot(page);
  } 

 

}
