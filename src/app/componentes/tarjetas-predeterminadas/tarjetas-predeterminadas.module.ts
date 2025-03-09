import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TarjetasPredeterminadasComponent } from './tarjetas-predeterminadas.component';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  declarations: [TarjetasPredeterminadasComponent],
  imports: [
    CommonModule,
    IonicModule,
     FormsModule,
  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
   exports: [TarjetasPredeterminadasComponent]
})
export class TarjetasPredeterminadasModule { }
