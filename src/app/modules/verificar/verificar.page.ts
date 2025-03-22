import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { InfoDevice } from 'src/app/clases/device/device';
import { ConfiguracionesService } from 'src/app/servicios/configuraciones/configuraciones.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-verificar',
  templateUrl: './verificar.page.html',
  styleUrls: ['./verificar.page.scss'],
})
export class VerificarPage implements OnInit {

  public loading:any;
  public InfoCel:InfoDevice = new InfoDevice()
  public InfoCel2:InfoDevice = new InfoDevice()
  private tiempoMaximo = 30 * 60 * 1000; // 30 minutos en milisegundos

   constructor(
      private alertController: AlertController,
      public userService: UserService,
      public link:Router,
      private loadingController: LoadingController,
       private ConfigService:ConfiguracionesService
      ) { }


async presentAlert(msn:String) {
  const alert = await this.alertController.create({
    header: 'Mensaje',
    message: ''+msn,
    buttons: ['ACEPTAR'],
  });
  await alert.present();
}

async verificarConexion() {
  const status = await Network.getStatus();
  console.log('Estado de conexión:', status.connected ? 'Conectado' : 'Desconectado');
}

escucharCambiosConexion() {
  Network.addListener('networkStatusChange', (status) => {
    console.log('Estado de conexión cambiado:', status.connected ? 'Conectado' : 'Desconectado');
  });
}
async ngOnInit() {
  this.loading = await this.loadingController.create({
    message: 'Estamos preparando todo',
  });

  await this.loading.present();

  const { value } = await Preferences.get({ key: 'token' });

  if (!value) {
    this.loading.dismiss();
    this.link.navigate(['login']);
  }

  // Agregar un timeout real a la petición
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Tiempo de espera agotado')), 120000) // 2m máximo
  );

  try {
    const data = await Promise.race([
      this.userService.Quien(value!) as Promise<{ status: number }>, // Casting de tipo
      timeoutPromise
    ]) as { status: number }; // Asegurar que data tenga la estructura correcta

    if (data.status === 200) {
      await this.VerificacionSesion();
    } else {
      this.loading.dismiss();
      this.link.navigate(['login']);
    }
  }
   catch (error) {
    console.error('Error verificando sesión:', error);
    this.loading.dismiss();
    this.presentAlert('Error de conexión');
    this.link.navigate(['login']);
  }
}


  async VerificacionSesion(){

    const ultima = await Preferences.get({ key: 'ultimaActividad' });
    const ultimaActividad = parseInt(ultima.value!, 10);
    const ahora = new Date().getTime();
    if (ahora - ultimaActividad > this.tiempoMaximo) {
      this.presentAlert("Tu sesión ha caducado")
      await Preferences.remove({ key: 'token' });
      this.loading.dismiss();
      this.link.navigate(['login'])

    }else{
      await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
        this.loading.dismiss();
        this.link.navigate(['tabs/tab2'])
    }
  }

}
