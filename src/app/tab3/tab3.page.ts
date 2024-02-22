import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { UserService } from '../servicios/user/user.service';
import { User } from '../clases/user/user';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  public user= new User()
  public isLoading = true;

  constructor(
    public userService: UserService,
    public link:Router,
    private loadingController: LoadingController) {}


    public menu=[
      {name:"Modificar datos", icono:"", link:"/update-user", estado:true},
      {name:"Modificar Contraseña", icono:"", link:"/modificar-password", estado:true},
      {name:"Eliminar cuenta", icono:"", link:"/delete-user", estado:true}

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
      this.link.navigate(['/login'])
    }

}
