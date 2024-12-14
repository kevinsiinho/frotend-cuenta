import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { InfoDevice } from 'src/app/clases/device/device';
import { ConfiguracionesService } from 'src/app/servicios/configuraciones/configuraciones.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-dispositivos',
  templateUrl: './dispositivos.page.html',
  styleUrls: ['./dispositivos.page.scss'],
})
export class DispositivosPage implements OnInit {

  public loading: any;
  public devices:InfoDevice[]=[];

  constructor(
      private alertController: AlertController,
      public userService: UserService,
      public link:Router,
      private loadingController: LoadingController,
       private ConfigService:ConfiguracionesService
      ) { }

async ngOnInit() {
  this.loading = await this.loadingController.create({
    message: 'Verificando...',
  });

    await this.loading.present();

    if(await this.userService.Verificar()){
      const { value } = await Preferences.get({ key: 'token' });
      this.userService.Quien(value!).then((res)=>{
        this.ConfigService.Gets(res.data).then((res)=>{
          this.devices=res
          this.loading.dismiss();
        })
      })
    }

}

async presentAlert(msn:String) {

const alert = await this.alertController.create({
  header: 'Mensaje',
  message: ''+msn,
  buttons: ['ACEPTAR'],
});
  await alert.present();
}

Eliminar(id:string){
  this.ConfigService.Delete(id).then((res)=>{
    if(res===204){
      this.presentAlert("Dispositivo desvinculado exitosamente")
      this.link.navigate(['tabs/tab2'])
    }else{
      this.presentAlert("Error, intenta más tarde")
    }
  })
}

regresar(){
  this.link.navigate(['tabs/tab3'])
}

}
