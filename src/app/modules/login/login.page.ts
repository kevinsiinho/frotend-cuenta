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
  public estadoBuscar:Boolean=false
  public email:string=""
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

    if(this.login.email!=null && this.recordaremail){
      this.viewPassword=true
      this.loading.dismiss();
    }else{

      if(this.estadoBuscar){
        this.viewPassword=true
        this.loading.dismiss();
      }else{
        this.presentAlert("Introduce un Email valido")
        this.loading.dismiss();
      }
    }

}

buscar(buscando:any){
  this.estadoBuscar=false
  var isValidEmail=false

  if(buscando.target.value.length>9){
    this.userService.buscar(buscando.target.value).then((data)=>{
      isValidEmail = this.emailPattern.test(buscando.target.value);

      if(data.length>0 && isValidEmail && buscando.target.value===data[0].email){
        this.login.email=data[0].email
        this.estadoBuscar=true
      }

    })
  }
}

regresar(){
  this.viewPassword=false
}

}

