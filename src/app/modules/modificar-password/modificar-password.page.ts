import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-modificar-password',
  templateUrl: './modificar-password.page.html',
  styleUrls: ['./modificar-password.page.scss'],
})
export class ModificarPasswordPage implements OnInit {

  public loading:any;
  public password:string=""
  public password2:string=""
  public user = new User()

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController
    ) { }

    async ngOnInit() {
      this.loading = await this.loadingController.create({
        message: 'Verificando...',
      });

      await this.loading.present();

      if(await this.userService.Verificar()){

      }
      this.loading.dismiss();
  }

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['ACEPTAR'],
    });
    await alert.present();
  }

  regresar(){
    this.link.navigate(['tabs/tab3'])
  }

async  verificar(){
  this.loading = await this.loadingController.create({
    message: 'Verificando...',
  });
  await this.loading.present();
  if(this.password!="" && this.password2!=""){

      if(this.password===this.password2){
        if(this.password2.length>5){
            if(this.user.password==="123456"){
              this.loading.dismiss();
              this.presentAlert("Contraseña insegura")
            }else{

              const { value } = await Preferences.get({ key: 'token' });
            if(value){
              this.userService.Quien(value).then((res)=>{
                this.userService.UpdatePassword(res.data,this.password2).then((res)=>{
                  if(res==204){
                    this.loading.dismiss();
                    this.presentAlert("Contraseña actualizada")
                    this.password2=this.password=""
                  }else{
                    this.loading.dismiss();
                    this.presentAlert("Error en el servidor intenta más tarde.")
                  }
                })
            })
          }else{
            this.loading.dismiss();
          }

            }
          }else{
            this.loading.dismiss();
            this.presentAlert("La contraseña debe tener más de 5 caracteres")
          }

      }else{
        this.loading.dismiss();
        this.presentAlert("Las contraseña no coinciden")
      }

    }else{
      this.loading.dismiss();
      this.presentAlert("Verifica los campos e intenta nuevamente")
    }

  }

}
