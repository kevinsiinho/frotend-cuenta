import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompartirInfoPage } from './compartir-info.page';

const routes: Routes = [
  {
    path: '',
    component: CompartirInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompartirInfoPageRoutingModule {}
