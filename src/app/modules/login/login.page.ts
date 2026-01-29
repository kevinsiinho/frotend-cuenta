import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Login } from 'src/app/clases/login/login';
import { UserService } from 'src/app/servicios/user/user.service';
import { User } from 'src/app/clases/user/user';
import { ConfiguracionesService } from 'src/app/servicios/configuraciones/configuraciones.service';
import { InfoDevice } from 'src/app/clases/device/device';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';


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
  verPassword: boolean = false;
  public EmailmsnError=false
  public PasswordmsnError=false
  public Password2msnError=false

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
    private ConfigService:ConfiguracionesService,
    private permisosService: PermisosService
    ) { }

  async presentAlert(msn:String): Promise<void> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Mensaje',
        message: ''+msn,
        buttons: [{
          text: 'ACEPTAR',
          handler: () => {
            resolve();
          }
        }],
      });
      await alert.present();
      // También resolver cuando se cierre el alert (por si se cierra de otra forma)
      alert.onDidDismiss().then(() => {
        resolve();
      });
    });
  }

async ngOnInit() {
    await Preferences.remove({ key: 'token' });
    
    // Preparar permisos (se solicitarán automáticamente cuando se necesiten)
    await this.permisosService.solicitarPermisosDispositivo();
    await this.permisosService.solicitarPermisosAlmacenamiento();
    
    // Obtener información del dispositivo
    // Nota: Device.getInfo() y Device.getId() generalmente no requieren permisos
    // pero si falla, continuamos sin la info del dispositivo
    try {
      this.InfoCel = await this.ConfigService.getDeviceInfo();
      console.log("Información del dispositivo obtenida:", this.InfoCel);
    } catch (error) {
      console.error("Error al obtener información del dispositivo:", error);
      // Continuar aunque falle, la info del dispositivo es opcional para el login
      // Si es necesario, se puede intentar de nuevo más tarde
    }
    
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

 async ingresar(){
 var isValidEmail=false
 var newDevice=false
 this.EmailmsnError=false
 this.PasswordmsnError=false
 this.Password2msnError=false

 const ahora = new Date().getTime();

  await this.loading.present();

  //verifica si el correo es valido
  isValidEmail = this.emailPattern.test(this.login.email);

  if(this.login.email==null || this.login.email==""){
    this.loading.dismiss();
    this.EmailmsnError=true
  }
  if(this.login.password==null || this.login.password==""){
    this.loading.dismiss();
    this.Password2msnError=true
  }else if(isValidEmail){
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
        this.userService.Quien(res.data.token).then(async (res)=>{
          this.userService.InfoUser(res.data).then(async (info:User)=>{
            const fecha= new Date();
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
            const ano = fecha.getFullYear();
            info.ultimaVez= dia+"/"+mes+"/"+ano;
            this.InfoCel.IdUser=info.id
            this.InfoCel.fecha=info.ultimaVez
            this.userService.Update(info)
            // NO cerrar el loading aquí, esperar a verificar el dispositivo
            
            // Verificar que tengamos el ID del dispositivo antes de continuar
            if (!this.InfoCel.id) {
              console.warn("No se pudo obtener el ID del dispositivo, intentando obtenerlo nuevamente...");
              try {
                const deviceInfo = await this.ConfigService.getDeviceInfo();
                this.InfoCel.id = deviceInfo.id;
                this.InfoCel = { ...this.InfoCel, ...deviceInfo };
              } catch (error) {
                console.error("Error al obtener ID del dispositivo:", error);
                // Continuar sin verificar el dispositivo, permitir el login de todas formas
                this.loading.dismiss();
                await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
                this.link.navigate(['tabs/tab2']);
                return;
              }
            }
            
            this.ConfigService.Get(this.InfoCel.id!).then(async (res)=>{
              if(res===0){
                newDevice=true
              }else{
                this.InfoCel2 = res
              }
              // Verificación de dispositivo nuevo COMENTADA: evitaba iniciar sesión y dejaba cargando
              // if(newDevice){
              //   this.loading.dismiss();
              //   await this.presentAlert(info.name+", estas ingresando desde un Dispositivo no registrado previamente")
              //   this.loading = await this.loadingController.create({ message: 'Registrando dispositivo...', });
              //   await this.loading.present();
              //   this.ConfigService.Create(this.InfoCel).then(async (res)=>{
              //     if(res.status===200){
              //       await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
              //       this.loading.dismiss();
              //       this.link.navigate(['tabs/tab2'])
              //     }else{
              //       this.loading.dismiss();
              //       await this.presentAlert("Error al registrar el dispositivo. Por favor intenta nuevamente.")
              //     }
              //   }).catch(async (error) => {
              //     this.loading.dismiss();
              //     await this.presentAlert("Error al registrar el dispositivo. Por favor intenta nuevamente.")
              //   })
              //   return
              // }
              if(newDevice){
                // Dispositivo nuevo: ir directo a la app sin registrar ni alert
                await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
                this.loading.dismiss();
                this.link.navigate(['tabs/tab2']);
                return;
              }
              if(info.estado=="Activo"){
              //Verificando que el dispositivo alla sido agregado
              await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
              this.loading.dismiss();
              this.link.navigate(['tabs/tab2'])
              return
            }else if(info.estado=="pendiente"){
              //para recuperar la contraseña
              this.loading.dismiss();
            }else if(info.estado=="verificar"){
              this.loading.dismiss();
              this.link.navigate(['/codigo/'+info.id])
              return
            }else if(info.estado=="suspendida"){
              //poner para cuando sea suspendida
              this.loading.dismiss();
              return
            }else if(info.estado=="desactivada"){
              this.loading.dismiss();
              await this.presentAlert("Tu cuenta ha sido bloqueado por uso inadecuado, si consideras que hay un error por favor comunicate con atención al usuario.")
              return
            }
            }).catch(async (error) => {
              console.error("Error al verificar dispositivo:", error);
              this.loading.dismiss();
              // Continuar con el flujo normal si falla la verificación del dispositivo
              if(info.estado=="Activo"){
                await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
                this.link.navigate(['tabs/tab2'])
              }
            })
          })
        })
        }
      }else{
        this.loading.dismiss();
        this.PasswordmsnError=true
      }
   })
    }else{
      this.loading.dismiss();
      this.EmailmsnError=true
    }

  }


VerPassword() {
  this.verPassword = !this.verPassword;
}

}
