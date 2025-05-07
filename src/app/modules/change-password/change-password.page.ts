import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { EmailService } from 'src/app/servicios/email/email.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage {
  private user= new User()
  public email:string=""
  public loading:any;
  public emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
    public enviarEmail:EmailService,
    ) { }

    async presentAlert(msn:String) {
      const alert = await this.alertController.create({
        header: 'Mensaje',
        message: ''+msn,
        buttons: ['ACEPTAR'],
      });
      await alert.present();
    }

 async BuscarEmail(){
  this.loading = await this.loadingController.create({
    message: '',
  });
      var isValidEmail=false
      await this.loading.present();
      isValidEmail = this.emailPattern.test(this.email);
      if(this.email.length>0){
        if(isValidEmail){
          this.email = this.email.toLowerCase();
          //buscando el correo
          this.userService.buscar(this.email).then((data)=>{
            this.user=data[0]
            if(this.user.email===this.email ){
              this.loading.dismiss();
              this.link.navigate(['/ingresar-codigo/'+this.user.id])
              this.user.codigo=this.GenerarCodigo()
              this.userService.Update(this.user).then((res)=>{
                  if(res==204){
                    const nombre= this.user.name+" "+this.user.nickname
                    this.enviarEmail.enviarCorreo(this.user.email,this.user.codigo!,nombre)
                  }else{
                    this.presentAlert("En estos momentos estamos teniendo problema con el servidor, intenta más tarde.")
                    this.link.navigate(['/change-password'])
                  }
                })
            }else{
              this.loading.dismiss();
              this.presentAlert("Email no registrado")
            }
          })

        }else{
          this.loading.dismiss();
          this.presentAlert("Escribe un Email valido")
        }
      }else{
        this.loading.dismiss();
          this.presentAlert("Escribe tu email")
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
