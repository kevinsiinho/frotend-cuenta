import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompartidasComponent } from './compartidas.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CompartidasComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports:[CompartidasComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class CompartidasModule {

}
