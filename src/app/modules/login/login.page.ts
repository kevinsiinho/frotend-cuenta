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
  public recordaremail!:Boolean
  public email:string=""
  public loading:any;
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
   // await this.verificarConexion();
    this.escucharCambiosConexion();
     const result2 = await Preferences.get({ key: 'select' });
    this.recordaremail = Boolean(JSON.parse(result2.value!))

    if (this.recordaremail) {
      const result = await Preferences.get({ key: 'email' });
      this.email = result.value!;
      this.login.email = result.value!;
    } else {
      this.email = "";
      this.login.email="";
      await Preferences.remove({ key: 'email' });
    }
      this.loading = await this.loadingController.create({
        message: 'Verificando...',
      });

  }

  async RecordarEmail() {

    if(this.recordaremail){
      await Preferences.set({
        key: 'select',
        value:'true',
      });
    }else{
      await Preferences.set({
        key: 'select',
        value:'false',
      });
    }
  }

async ingresar(){
 var isValidEmail=false
  await this.loading.present();

  //convierte el texto a minuscula
  isValidEmail = this.emailPattern.test(this.login.email);

  if(this.login.password!=null && isValidEmail){

    this.login.email = this.login.email.toLowerCase();

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
         this.link.navigate(['tabs/tab2'])
         this.login= new Login ()
         this.loading.dismiss();
      }else{
        this.loading.dismiss();
        this.presentAlert("Usuario no encontrado")
      }
   }).then
  }else{
    this.loading.dismiss();
    this.presentAlert("Verifica los campos e intenta nuevamente.")
  }

}

}
