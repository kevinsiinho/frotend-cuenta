import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SinInternetPage } from './sin-internet.page';

const routes: Routes = [
  {
    path: '',
    component: SinInternetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SinInternetPageRoutingModule {}
