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
  public form1=false
  public form2=false
  public form3=false
  public password2:string=""
  public verPassword: boolean = false;
  public verPassword2: boolean = false;
  public verificarCodigo!: number
  public msnError:string = ""
  public EmailmsnError:boolean = false
  public errorName:boolean = false
  public errorApellido:boolean = false
  public errorCel:boolean = false
  public errorpassword:boolean = false
  public errorpassword2:boolean = false 
  public btnRegistrar:boolean=true 

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
    public enviarEmail:EmailService,
    ) { }


  async ngOnInit() {
    this.form2=true
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
  this.btnRegistrar=false
  await this.loading.present();

  if(this.user.name==="" || this.user.name===undefined){
    this.errorName=true
  }else{
    this.errorName=false
  }

  if(this.user.nickname==="" || this.user.nickname===undefined){
    this.errorApellido=true
  }else{
    this.errorApellido=false 
  }
  
  if(this.user.password==="" || this.user.password===undefined){
    this.errorpassword=true
  }else{
    this.errorpassword=false  
  }
  //mejorar esto 
  if( this.user.cel===undefined){ 
    this.errorCel=true
  }else{
    this.errorCel=false
  }           
  
  if(this.password2==="" || this.password2===undefined){
    this.errorpassword2=true
  }else{
    this.errorpassword2=false 
  }

  
  if(this.user.password.length<6){
    this.errorpassword2=true
    this.errorpassword=true
    this.msnError="*La contraseña debe tener más de 6 caracteres."
  }else if(this.user.password!==this.password2){
    this.errorpassword2=true
    this.errorpassword=true
    this.msnError="*La contraseña no coinciden"
  }else if(this.user.password===this.password2){
    this.errorpassword2=false 
    this.errorpassword=false
    this.msnError=""
  }


  if(this.user.name!="" && this.user.nickname!="" && this.user.password!="" && this.user.cel>0 && this.password2!=""){
    this.errorName=false
    this.errorApellido=false
    this.errorpassword=false
    this.errorCel=false
    this.errorpassword2=false
    this.msnError=""
    this.user.estado="Activo"
    this.user.codigo=0
    this.userService.Create(this.user).then((data)=>{
      if(data.status==200){
        this.user= new User()
        this.loading.dismiss();
        this.form1=true
        this.form2=false  
        this.form3=false
        this.presentAlert("Te haz unidos a nosotros exitosamente")
        this.link.navigate(['/login'])
      }else{
        this.loading.dismiss();
        this.presentAlert("Error en el servidor, intenta nuevamente")
      }

    })
  }
  this.btnRegistrar=true
  this.loading.dismiss();
  
  }

  async VerificarEmail(){
    var isValidEmail=false
    this.email = this.email.toLowerCase();
    this.user.email = this.user.email.toLowerCase();
    isValidEmail = this.emailvalido.test(this.user.email);
    if(this.user.email=="" || this.user.email==undefined){
      this.EmailmsnError=true
      this.msnError="*Completa los campos"
    } else if(this.email=="" || this.email==undefined){
      this.EmailmsnError=true
      this.msnError="*Completa los campos"
    }else if(!isValidEmail){
      this.EmailmsnError=true
      this.msnError="*Ingresa un correo valido"
    }else if(this.email!==this.user.email){
      this.msnError="*Los correos no coinciden, verifica los campos."
      this.EmailmsnError=true
    }else{
      this.EmailmsnError=false
      this.msnError=""
      const res = await this.userService.buscar(this.user.email);
      if(res.length>0){
        this.msnError="*El correo ya se encuentra registrado, inicia sesión o intenta nuevamente."
        this.EmailmsnError=true 
      }else{
        this.EmailmsnError=false
        this.msnError=""
        this.form3=true
        this.form2=false
        this.user.codigo=this.GenerarCodigo()
        this.enviarEmail.enviarCorreo(this.user.email,this.user.codigo!,"")
      }        
    }
  }

 GenerarCodigo(){
  let numeroAleatorio = Math.floor(Math.random() * 10000);
  if(numeroAleatorio===1234  || numeroAleatorio<1000 || numeroAleatorio>9999){
    this.GenerarCodigo()
  }
  return numeroAleatorio
}

VerificarCodigo(){
  this.loading.present()
  if(this.verificarCodigo==this.user.codigo){
    this.form1=true
    this.form3=false
    this.form2=false
    this.loading.dismiss()
  }else{
    this.loading.dismiss()
    this.EmailmsnError=true
    this.msnError="*El código no es correcto, intentanuevamente."
  }
}

FVerPassword() {
  this.verPassword2 = !this.verPassword2;
  this.verPassword = !this.verPassword;
}
}
