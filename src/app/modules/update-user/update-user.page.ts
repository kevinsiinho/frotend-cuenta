import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.page.html',
  styleUrls: ['./update-user.page.scss'],
})
export class UpdateUserPage implements OnInit {
  public user= new User()
  public loading: any;
  public email:string=""
  public permitir:boolean=false

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
      const { value } = await Preferences.get({ key: 'token' });
      if(value){
        this.userService.Quien(value).then((res)=>{
        this.userService.InfoUser(res.data).then((data)=>{
          this.user=data
          this.email=this.user.email
          this.loading.dismiss();
        })
        })
      }else{
        this.loading.dismiss();
      }
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

async actualizar(){
  this.user.email = this.user.email.toLowerCase();
  await this.loading.present();
  if(this.user.name!="" && this.user.nickname!="" && this.user.email!="" && this.user.cel>2999999999 && this.user.cel<4000000000){
    if(this.email!=this.user.email){
      if(await this.VerificarEmail(this.email)==false){
        this.permitir=true
      }else{
        this.presentAlert("Correo registrado")
      }
    }else{
      this.permitir=true
    }

    if(this.permitir==true){
      this.userService.Update(this.user).then((data)=>{
        this.loading.dismiss();
        console.log(data)
        if(data==204){
          this.presentAlert("Datos modificados exitosamente")
        }else{
          this.presentAlert("Error en el servidor, intenta nuevamente")
        }

      })
      }

  }else{
    this.presentAlert("Verifica los campos")
  }
}

  async VerificarEmail(email:string){
    const res = await this.userService.buscar(email);
    if (res.length > 0) {
      this.presentAlert("Correo registrado");
      return true;
    } else {
      return false;
    }
  }

  regresar(){
    this.link.navigate(['tabs/tab3'])
  }

}
