import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./modules/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: '',
    redirectTo: 'verificar',
    pathMatch: 'full'
  },
  {
    path: 'registrarse',
    loadChildren: () => import('./modules/registrarse/registrarse.module').then( m => m.RegistrarsePageModule)
  },
  {
    path: 'update-user',
    loadChildren: () => import('./modules/update-user/update-user.module').then( m => m.UpdateUserPageModule)
  },
  {
    path: 'delete-user',
    loadChildren: () => import('./modules/delete-user/delete-user.module').then( m => m.DeleteUserPageModule)
  },
  {
    path: 'modificar-password',
    loadChildren: () => import('./modules/modificar-password/modificar-password.module').then( m => m.ModificarPasswordPageModule)
  },
  {
    path: 'codigo/:id',
    loadChildren: () => import('./modules/codigo/codigo.module').then( m => m.CodigoPageModule)
  },
  {
    path: 'ingresar-codigo/:id',
    loadChildren: () => import('./modules/ingresar-codigo/ingresar-codigo.module').then( m => m.IngresarCodigoPageModule)
  },
  {
    path: 'compartir/:id',
    loadChildren: () => import('./modules/compartir/compartir.module').then( m => m.CompartirPageModule)
  },
  {
    path: 'sin-internet',
    loadChildren: () => import('./modules/sin-internet/sin-internet.module').then( m => m.SinInternetPageModule)
  },
  {
    path: 'compartir-info/:id1/:id2',
    loadChildren: () => import('./modules/compartir-info/compartir-info.module').then( m => m.CompartirInfoPageModule)
  },
  {
    path: 'dispositivos',
    loadChildren: () => import('./modules/dispositivos/dispositivos.module').then( m => m.DispositivosPageModule)
  },
  {
    path: 'editar-tarjeta/:id',
    loadChildren: () => import('./modules/editar/editar.module').then( m => m.EditarPageModule)
  },
  {
    path: 'verificar',
    loadChildren: () => import('./modules/verificar/verificar.module').then( m => m.VerificarPageModule)
  },
  {
    path: 'tabs/tab2/tarjeta/:id',
    loadChildren: () => import('./modules/tarjeta/tarjeta.module').then( m => m.TarjetaPageModule)
  },
  {
    path: 'tarjeta/historial/:id',
    loadChildren: () => import('./modules/historial/historial.module').then( m => m.HistorialPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
