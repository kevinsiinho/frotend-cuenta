import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SinInternetPageRoutingModule } from './sin-internet-routing.module';

import { SinInternetPage } from './sin-internet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SinInternetPageRoutingModule
  ],
  declarations: [SinInternetPage]
})
export class SinInternetPageModule {}
