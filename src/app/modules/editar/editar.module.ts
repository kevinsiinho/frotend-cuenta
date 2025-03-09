import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarPageRoutingModule } from './editar-routing.module';

import { EditarPage } from './editar.page';
import { TarjetasPredeterminadasModule } from 'src/app/componentes/tarjetas-predeterminadas/tarjetas-predeterminadas.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarPageRoutingModule,
    TarjetasPredeterminadasModule,
  ],
  declarations: [EditarPage]
})
export class EditarPageModule {}
