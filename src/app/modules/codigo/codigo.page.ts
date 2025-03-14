import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { EmailService } from 'src/app/servicios/email/email.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-codigo',
  templateUrl: './codigo.page.html',
  styleUrls: ['./codigo.page.scss'],
})
export class CodigoPage implements OnInit {

  public codigo!:number

  public user= new User()
  public isLoading = true;

  constructor(
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    public enviarEmail:EmailService,
  ) {}

    async presentAlert(msn:String) {

      const alert = await this.alertController.create({
        header: 'Mensaje',
        message: ''+msn,
        buttons: ['ACEPTAR'],
      });
      await alert.present();
    }

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

        if(2==2){
            const { value } = await Preferences.get({ key: 'token' });
            if(value){
              this.userService.Quien(value).then((res)=>{
              this.userService.InfoUser(res.data).then((data)=>{
                this.user=data
                console.log(this.user.codigo)
                loading.dismiss();
                this.isLoading = false;
              })
              })
            }else{
              loading.dismiss();
              this.isLoading = false;
            }
          }
          loading.dismiss();
          this.isLoading = false;
    }

  NuevoCodigo(){

   this.user.codigo=this.GenerarCodigo()
   this.userService.Update(this.user).then((res)=>{
      if(res==204){
        const nombre= this.user.name+" "+this.user.nickname
        this.enviarEmail.enviarCorreo(this.user.email,this.user.codigo!,nombre)
        this.presentAlert("Hola "+nombre+" se ha enviando un nuevo codigo a tu correo.")
      }else{
        this.presentAlert("En estos momentos estamos teniendo problema con el servidor, intenta más tarde.")
      }
    })

  }

  verificar(){
    if(this.codigo>0 && this.user.codigo===this.codigo){
      this.user.estado="Activo"
      this.user.codigo=0
      this.userService.Update(this.user).then((res)=>{
        if(res==204){
          this.presentAlert("Bienvenid@ "+this.user.name+" "+this.user.nickname+"  Ya puedes empezar a utilizar tu cuenta.")
          this.link.navigate(['tabs/tab2'])
        }else{
          this.presentAlert("En estos momentos estamos teniendo problema con el servidor, intenta más tarde.")
        }
      })
    }else{
      this.presentAlert("El código no coinciden, recuerda que tiene un número limitados de intentos")
    }
  }

  GenerarCodigo(){
    let numeroAleatorio = Math.floor(Math.random() * 10000);
    if(numeroAleatorio===1234  || numeroAleatorio<1000 || numeroAleatorio>9999){
      this.GenerarCodigo()
    }
    return numeroAleatorio
  }
}
