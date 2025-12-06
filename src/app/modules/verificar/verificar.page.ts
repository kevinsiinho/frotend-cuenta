import { Component, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { InfoDevice } from 'src/app/clases/device/device';
import { Bolsillo } from 'src/app/clases/Items/bolsillo';
import { Depositos } from 'src/app/clases/Items/depositos';
import { Items } from 'src/app/clases/Items/items';
import { BolsillosService } from 'src/app/servicios/bolsillos/bolsillos.service';
import { ConfiguracionesService } from 'src/app/servicios/configuraciones/configuraciones.service';
import { DepositosService } from 'src/app/servicios/depositos/depositos.service';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-verificar',
  templateUrl: './verificar.page.html',
  styleUrls: ['./verificar.page.scss'],
})
export class VerificarPage implements OnInit, OnDestroy {

  public loading:any;
  public InfoCel:InfoDevice = new InfoDevice()
  public InfoCel2:InfoDevice = new InfoDevice()
  private refreshTokenInterval: any;
  private readonly REFRESH_INTERVAL = 10 * 60 * 1000; // Renovar cada 10 minutos
  public items:Items[]=[]
  public tarjeta=new Bolsillo()
  public deposito= new Depositos()


constructor(
  private alertController: AlertController,
  public userService: UserService,
  public link:Router,
  private loadingController: LoadingController,
  private ConfigService:ConfiguracionesService,
  public itemService:ItemsService,
  public bolsilloSer:BolsillosService,
  public depositosServicios:DepositosService
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

  if(value){
    // Intentar renovar el token inmediatamente
    const refreshed = await this.userService.refreshToken();
    
    if (!refreshed) {
      console.log('No se pudo renovar el token, pero continuamos con el existente');
    }
    
    // Iniciar el intervalo de renovación automática
    this.iniciarRenovacionAutomatica();
    
    // Actualizar última actividad
    const ahora = new Date().getTime();
    await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
    
    this.loading.dismiss();
    this.link.navigate(['tabs/tab2']);
  }else{
    await Preferences.remove({ key: 'token' });
    this.loading.dismiss();
    this.link.navigate(['login']);
  }
  
  await this.verificarConexion();
  this.escucharCambiosConexion();
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }
  }

  private iniciarRenovacionAutomatica() {
    // Renovar el token cada 10 minutos (antes de que expire normalmente)
    this.refreshTokenInterval = setInterval(async () => {
      const { value } = await Preferences.get({ key: 'token' });
      
      if (value) {
        const refreshed = await this.userService.refreshToken();
        
        if (refreshed) {
          console.log('Token renovado automáticamente');
          // Actualizar última actividad cuando se renueva el token
          const ahora = new Date().getTime();
          await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
        } else {
          console.log('Error al renovar token automáticamente');
          // Si falla la renovación, intentar verificar si el token sigue siendo válido
          // Si no es válido, el usuario será redirigido al login en la próxima petición
        }
      } else {
        // Si no hay token, limpiar el intervalo
        clearInterval(this.refreshTokenInterval);
      }
    }, this.REFRESH_INTERVAL);
  }

  // Este método ya no es necesario con la renovación automática de token
  // Pero lo mantenemos por si acaso se necesita en algún otro lugar
  async VerificacionSesion(){
    // Ya no verificamos tiempo máximo, el token se renueva automáticamente
    // Solo actualizamos la última actividad
    const ahora = new Date().getTime();
    await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
    
    // Intentar renovar el token si existe
    const { value } = await Preferences.get({ key: 'token' });
    if (value) {
      await this.userService.refreshToken();
      this.loading.dismiss();
      this.link.navigate(['tabs/tab2']);
    } else {
      this.loading.dismiss();
      this.link.navigate(['login']);
    }
  }

}
