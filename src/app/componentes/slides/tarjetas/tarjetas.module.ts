import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TarjetasComponent } from './tarjetas.component';

@NgModule({
  declarations: [TarjetasComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
   exports: [TarjetasComponent]

})
export class TarjetasModule { }
