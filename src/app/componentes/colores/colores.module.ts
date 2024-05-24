import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColoresComponent } from './colores.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ColoresComponent],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [ColoresComponent]
})
export class ColoresModule { }
