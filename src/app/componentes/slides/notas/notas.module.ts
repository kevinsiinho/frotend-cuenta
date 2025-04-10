import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NotasComponent } from './notas.component';



@NgModule({
  declarations: [NotasComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports:[NotasComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotasModule { }
