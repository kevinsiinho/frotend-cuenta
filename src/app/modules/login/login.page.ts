import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Login } from 'src/app/clases/login/login';
import { UserService } from 'src/app/servicios/user/user.service';
import { Network } from '@capacitor/network';
import { User } from 'src/app/clases/user/user';
import { ConfiguracionesService } from 'src/app/servicios/configuraciones/configuraciones.service';
import { InfoDevice } from 'src/app/clases/device/device';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

  public login= new Login()
  public token:string=""
  public recordaremail!:Boolean
  public email:string=""
  public loading:any;
  public emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  public InfoCel:InfoDevice = new InfoDevice()
  public InfoCel2:InfoDevice = new InfoDevice()
  private tiempoMaximo = 30 * 60 * 1000; // 30 minutos en milisegundos

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
     private ConfigService:ConfiguracionesService
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
  const { value } = await Preferences.get({ key: 'token' });

  if(value){
 this.VerificacionSesion()
}

    this.InfoCel= await this.ConfigService.getDeviceInfo()
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

async VerificacionSesion(){
  const ultima = await Preferences.get({ key: 'ultimaActividad' });
  const ultimaActividad = parseInt(ultima.value!, 10);
  const ahora = new Date().getTime();
  if (ahora - ultimaActividad > this.tiempoMaximo) {
    this.presentAlert("Tu sesión ha caducado")
    await Preferences.remove({ key: 'token' });
  }else{
    await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
    this.link.navigate(['tabs/tab2'])
  }
}

 async ingresar(){
 var isValidEmail=false
 var newDevice=false
 const ahora = new Date().getTime();

  await this.loading.present();

  //verifica si el correo es valido
  isValidEmail = this.emailPattern.test(this.login.email);

  if(this.login.password!=null && isValidEmail){

    this.login.email = this.login.email.toLowerCase();

    this.userService.Login(this.login).then(async(res)=>{

      if(res.status===200){
        await Preferences.set({
          key: 'token',
          value: res.data.token,
        });

        if(this.recordaremail){
          await Preferences.set({
            key: 'email',
            value: this.login.email,
          });
          this.login= new Login ()
        //Verificando el estado de la cuenta
        this.userService.Quien(res.data.token).then((res)=>{
          this.userService.InfoUser(res.data).then((info:User)=>{
            const fecha= new Date();
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
            const ano = fecha.getFullYear();
            info.ultimaVez= dia+"/"+mes+"/"+ano;
            this.InfoCel.IdUser=info.id
            this.InfoCel.fecha=info.ultimaVez
            this.userService.Update(info)
            this.loading.dismiss();
            this.ConfigService.Get(this.InfoCel.id!).then(async (res)=>{
              if(res===0){
                newDevice=true
              }else{
                this.InfoCel2 = res
              }
              //sino el dispositivo no esta registrado
            if(newDevice){
              this.presentAlert(info.name+", estas ingresando desde un Dispositivo no registrado previamente")
              this.ConfigService.Create(this.InfoCel).then(async (res)=>{
                await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });

                this.link.navigate(['tabs/tab2'])
               /* if(res.status===200){
                  console.log("Registrado")
                  this.link.navigate(['tabs/tab2'])
                }else{
                  console.log(res)
                }*/
              })
            }else if(info.estado=="Activo"){
              //Verificando que el dispositivo alla sido agregado
              await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
              this.link.navigate(['tabs/tab2'])
            }else if(info.estado=="pendiente"){
              //para recuperar la contraseña
            }else if(info.estado=="verificar"){
              this.link.navigate(['/codigo/'+info.id])
            }else if(info.estado=="suspendida"){
              //poner para cuando sea suspendida
            }else if(info.estado=="desactivada"){
              this.presentAlert("Tu cuenta ha sido bloqueado por uso inadecuado, si consideras que hay un error por favor comunicate con atención al usuario.")
            }
            })
          })
        })
        }
      }else{
        this.loading.dismiss();
        this.presentAlert("Credenciales invalidas, intentanuevamente")
      }
   })
  }else{
    this.loading.dismiss();
    this.presentAlert("Verifica los campos e intenta nuevamente.")
  }
}


}
