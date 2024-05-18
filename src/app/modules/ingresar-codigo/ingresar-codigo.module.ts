import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresarCodigoPageRoutingModule } from './ingresar-codigo-routing.module';

import { IngresarCodigoPage } from './ingresar-codigo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresarCodigoPageRoutingModule
  ],
  declarations: [IngresarCodigoPage]
})
export class IngresarCodigoPageModule {}
