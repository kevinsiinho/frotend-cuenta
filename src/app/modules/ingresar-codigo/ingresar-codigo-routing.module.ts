import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresarCodigoPage } from './ingresar-codigo.page';

const routes: Routes = [
  {
    path: '',
    component: IngresarCodigoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresarCodigoPageRoutingModule {}
