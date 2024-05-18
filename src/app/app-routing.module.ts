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
    redirectTo: 'login',
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
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
