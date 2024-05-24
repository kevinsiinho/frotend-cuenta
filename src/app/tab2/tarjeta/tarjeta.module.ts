import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TarjetaPageRoutingModule } from './tarjeta-routing.module';

import { TarjetaPage } from './tarjeta.page';
import { ColoresModule } from 'src/app/componentes/colores/colores.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarjetaPageRoutingModule,
    ColoresModule,
  ],
  declarations: [TarjetaPage],

})

export class TarjetaPageModule {}
