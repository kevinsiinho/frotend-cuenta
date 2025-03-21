import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { TarjetasModule } from '../componentes/slides/tarjetas/tarjetas.module';
import { CompartidasModule } from '../componentes/slides/compartidas/compartidas.module';
import { RecienteModule } from '../componentes/slides/reciente/reciente.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    TarjetasModule,
    CompartidasModule,
    RecienteModule
  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}
