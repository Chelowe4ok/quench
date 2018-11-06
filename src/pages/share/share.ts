import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
  selector: 'page-share',
  templateUrl: 'share.html',
})
export class SharePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner
) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SharePage');
  }

  scan(): void {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);

      if (barcodeData.format !== 'QR_CODE') return;

      if (/quench/.test(barcodeData.text)) {
        window.open(barcodeData.text, '_blank')
      }

    }).catch(err => {
      console.log('Error', err);
    });
  }

}
