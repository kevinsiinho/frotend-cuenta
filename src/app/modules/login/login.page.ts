import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Login } from 'src/app/clases/login/login';
import { UserService } from 'src/app/servicios/user/user.service';


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

async ngOnInit() {
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

  if(this.login.email!=null && this.login.password!=null){
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
    this.presentAlert("Faltan campos por llenar")
  }

}

async continuar(){

  await this.loading.present();

  this.userService.buscar(this.login.email).then((data)=>{
    if(data.length>0){
      this.loading.dismiss();
      this.viewPassword=true
    }else{
      this.loading.dismiss();
      this.presentAlert("Email no encontrado")
    }
  })
}

}

