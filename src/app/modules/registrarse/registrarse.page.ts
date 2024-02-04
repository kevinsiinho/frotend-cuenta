import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
})
export class RegistrarsePage {

  public user= new User()
  public loading:any;

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

 async create(){
    this.loading = await this.loadingController.create({
      message: 'Verificando...',
    });
    if(this.user.name!="" && this.user.nickname!="" && this.user.email!="" && this.user.password!=""){
        if(this.user.password.length>5){
            if(this.user.password==="123456"){
              this.presentAlert("Contraseña insegura")
            }else{
              this.user.estado="Activo"
              this.userService.Create(this.user).then((data)=>{
                this.loading.dismiss();
                if(data==200){
                  this.presentAlert("Te haz unidos a nosotros exitosamente")
                  this.user= new User()
                  this.link.navigate(['/login'])
                }else{
                  this.presentAlert("Error en el servidor, intenta nuevamente")
                }

              })
            }

        }else{
          this.loading.dismiss();
          this.presentAlert("La contraseña debe tener más de 5 caracteres")
        }
    }else{
      this.loading.dismiss();
      this.presentAlert("Faltan campos por llenar")
    }

  }

}
