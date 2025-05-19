import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { User } from '../clases/user/user';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UserService } from '../servicios/user/user.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  public user= new User()
  public isLoading = true;
  public ver=false

  constructor(
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController,
   ) {}


    public menu=[
      {name:"Modificar datos", icono:"log-in-outline", link:"/update-user", estado:true},
      {name:"Modificar Contraseña", icono:"key-outline", link:"/modificar-password", estado:true},
      {name:"Dispositivos", icono:"phone-portrait-outline", link:"/dispositivos", estado:true},
      {name:"Eliminar cuenta", icono:"close-circle-outline", link:"/delete-user", estado:true}

    ]

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: 'Cargando...',
    });
    await loading.present();

        if(await this.userService.Verificar()){
            const { value } = await Preferences.get({ key: 'token' });
            if(value){
              this.userService.Quien(value).then((res)=>{
              this.userService.InfoUser(res.data).then((data)=>{
                this.user=data
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

    async salir(){
      await Preferences.remove({ key: 'token' });
      await Preferences.remove({ key: 'ultimaActividad' });
      this.link.navigate(['/login'])
    }

async VerGuia(){
      this.ver=!this.ver
      if(this.ver){
         localStorage.setItem('tourNuevaTarjeta', 'false');
         localStorage.setItem('tourbolsillo', 'false');
         localStorage.setItem('tourConfigTarjeta', 'false');
      }
    }

}
