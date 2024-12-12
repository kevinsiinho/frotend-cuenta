import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompartirInfoPageRoutingModule } from './compartir-info-routing.module';

import { CompartirInfoPage } from './compartir-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartirInfoPageRoutingModule
  ],
  declarations: [CompartirInfoPage]
})
export class CompartirInfoPageModule {}
