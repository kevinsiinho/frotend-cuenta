import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-ingresar-codigo',
  templateUrl: './ingresar-codigo.page.html',
  styleUrls: ['./ingresar-codigo.page.scss'],
})
export class IngresarCodigoPage implements OnInit {

  public codigo!:string;
  public codigo2!:Number;
  public loading:any;
  public intentos:number=1
  public user= new User()
  public id!:string
  public isLoading = true;
  public alertInputs:any[] = [
    {
      name: 'password',
      type: 'password',
      placeholder: 'Nueva contraseña'
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Confirmar contraseña'
    }
  ]

  constructor(
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router:ActivatedRoute,) {}

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
    message: '',
  });
  await loading.present();
        this.id=this.router.snapshot.paramMap.get('id')!
            this.userService.InfoUser(this.id).then((data)=>{
              this.user=data
              console.log(this.user)
              loading.dismiss();
              this.isLoading = false;
            })
        loading.dismiss();
        this.isLoading = false;
  }

  async AlertaNuevoPassword() {
    const alert = await this.alertController.create({
      header: 'Actualizar contraseña',
      inputs: this.alertInputs,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            const newPassword = data.password;
            const confirmPassword = data.confirmPassword;
            if(newPassword===confirmPassword && confirmPassword.length>5 && confirmPassword!="123456"){
                this.user.codigo=0
                this.userService.Update(this.user).then((res)=>{
                    if(res==204){
                      this.userService.UpdatePassword(this.user.id!,confirmPassword).then((res)=>{
                        if(res==204){
                          this.presentAlert("Haz modificado tu contraseña exitosamente!")
                          this.link.navigate(['login'])
                        }else{
                          this.presentAlert("Error en el sistema")
                        }
                      })
                    }else{
                      this.presentAlert("En estos momentos estamos teniendo problema con el servidor, intenta más tarde.")
                    }
                  })
            }else{
              this.AlertaNuevoPassword()
              this.presentAlert("Contraseña no valida, recuerda que debe ser mayor a 5 caracteres")

            }
          },
        },
      ],
    });
    await alert.present();
  }

  verificar(){
    this.codigo2=Number(this.codigo)
    if(this.user.codigo!=0){
      if(this.intentos<3){
        if(this.user.codigo===this.codigo2){
          this.AlertaNuevoPassword();
        }else{
          this.intentos=this.intentos+1
          this.presentAlert("El código no coinciden, recuerda que tiene un número limitados de intentos")
        }
      }else{
        this.presentAlert("Haz superado el número de intentos permitodos bloquearemos tu cuenta temporalmente, comunicate con nosotros para resolver este problema.")
      }
    }else{
      this.presentAlert("En estos momentos no puede actualizar la contraseña, intenta desde cero nuevamente")
    }
  }

salir(){
  this.link.navigate(['/login'])
}

}
