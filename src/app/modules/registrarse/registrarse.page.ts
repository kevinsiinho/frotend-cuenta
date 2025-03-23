import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'src/app/clases/user/user';
import { EmailService } from 'src/app/servicios/email/email.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
})
export class RegistrarsePage implements OnInit{

  public user= new User()
  public loading:any;
  public showBTN:boolean=false
  public email=""
  public emailvalido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  public password2:string=""

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
    public enviarEmail:EmailService,
    ) { }


  async ngOnInit() {
    this.user=new User()
    this.password2=""
      this.loading = await this.loadingController.create({
        message: 'Verificando...',
      });
  }

    async presentAlert(msn:String) {
      const alert = await this.alertController.create({
        header: 'Mensaje',
        message: ''+msn,
        buttons: ['ACEPTAR'],
      });
      await alert.present();
    }

 async create(){
  this.showBTN=false

  this.user.email = this.user.email.toLowerCase();
  this.email = this.email.toLowerCase();
  await this.loading.present();
    if(this.emailvalido.test(this.user.email)){
      if(this.user.email===this.email){
        if(await this.VerificarEmail()===true){
          this.user.estado="verificar"
          this.user.codigo=this.GenerarCodigo()
          this.userService.Create(this.user).then((data)=>{
            if(data.status==200){
              const nombre= this.user.name+" "+this.user.nickname
              this.enviarEmail.enviarCorreo(this.user.email,this.user.codigo!,nombre)
              this.loading.dismiss();
              this.presentAlert("Te haz unidos a nosotros exitosamente")
              this.user= new User()
              this.link.navigate(['/login'])
            }else{
              this.loading.dismiss();
              this.presentAlert("Error en el servidor, intenta nuevamente")
            }

          })
    }
      }else{
        this.presentAlert("Los correos no coinciden, verifica los campos.")
        this.loading.dismiss();
      }
    }else{
      this.presentAlert("Ingresa un tipo de correo valido.")
        this.loading.dismiss();
    }

    this.showBTN=true
  }

  async VerificarEmail(){
    const res = await this.userService.buscar(this.user.email);
    if (res.length > 0) {
      this.presentAlert("El correo ingreado ya se encuentra registrado, inicia sesión o intenta con uno nuevo");
      return false;
    } else {
      return true;
    }
  }

async Datos(){
  await this.loading.present();

  if(this.user.name!="" && this.user.nickname!="" && this.user.password!=""){
    if(this.user.password===this.password2){
      if(this.user.password.length>5){
        if(this.user.password=="123456" || this.user.password=="asdfghj"){
          this.loading.dismiss();
          this.presentAlert("Contraseña insegura")
        }else{
          this.showBTN=true
          this.loading.dismiss();
         /* if(this.user.cel>2999999999 && this.user.cel<4000000000){

          }else{
            this.loading.dismiss();
          this.presentAlert("Ingresa un número de celular valido")
          }*/
        }
      }else{
        this.loading.dismiss();
        this.presentAlert("La contraseña debe tener más de 5 caracteres")
      }
    }else{
      this.loading.dismiss();
      this.presentAlert("La contraseña no coinciden")
    }
  }else{
    this.loading.dismiss();
    this.presentAlert("Faltan campos por llenar")
  }
 }

 Regresar(){
  if(this.showBTN){
    this.showBTN=false
  }else{
    this.showBTN=true
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
