import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecienteComponent } from './reciente.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [RecienteComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports:[RecienteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecienteModule { }
