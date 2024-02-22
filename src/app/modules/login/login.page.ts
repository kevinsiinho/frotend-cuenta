import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Login } from 'src/app/clases/login/login';
import { UserService } from 'src/app/servicios/user/user.service';
import { Network } from '@capacitor/network';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

  public login= new Login()
  public token:string=""
  public recordaremail:Boolean=true
  public loading:any;
  public viewPassword:Boolean=false
  public emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController
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

    await this.verificarConexion();
    this.escucharCambiosConexion();
      this.RecordarEmail();

      this.loading = await this.loadingController.create({
        message: 'Verificando...',
      });

  }


  async RecordarEmail() {
    if (this.recordaremail) {
      const result = await Preferences.get({ key: 'email' });
      this.login.email = result.value!;
    } else {
      this.login.email = "";
    }
  }

async ingresar(){

  await this.loading.present();

  //convierte el texto a minuscula
  this.login.email = this.login.email.toLowerCase();

  if(this.login.password!=null){
    this.userService.Login(this.login).then(async(res)=>{
       await Preferences.set({
        key: 'token',
        value: res.data.token,
      });

      if(this.recordaremail){
        await Preferences.set({
          key: 'email',
          value: this.login.email,
        });
      }

      if(res.data.token){
         this.loading.dismiss();
         this.link.navigate(['tabs/tab2'])
         this.login= new Login ()
      }else{
        this.loading.dismiss();
        this.presentAlert("Usuario no encontrado")
      }
   })
  }else{
    this.loading.dismiss();
    this.presentAlert("Escribe tu contraseña")
  }

}

async continuar(){

  await this.loading.present();

  if(this.login.email!=null){
    const isValidEmail = this.emailPattern.test(this.login.email);
    if (isValidEmail) {
      this.userService.buscar(this.login.email).then((data)=>{
        if(data.length>0){
          this.viewPassword=true
        }else{
          this.presentAlert("Email no encontrado")
        }
      })

    }else{
      this.presentAlert("El correo electrónico ingresado no es válido")
    }

  }else{
    this.presentAlert("Introduce un Email")
  }
  this.loading.dismiss();
}

}

