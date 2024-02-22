import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Items } from 'src/app/clases/Items/items';
import { User } from 'src/app/clases/user/user';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.page.html',
  styleUrls: ['./delete-user.page.scss'],
})
export class DeleteUserPage implements OnInit {

  public loading:any;
  public user = new User()
  public item= new Items();
  public items:Items[]=[];
  public itemsSubscription= new Subscription()

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public itemService:ItemsService,
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
          })
          })
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

    if(await this.userService.Verificar()){

    }
    await alert.present();


  }


  regresar(){
    this.link.navigate(['tabs/tab3'])
  }


 async Eliminar(){
      this.loading = await this.loadingController.create({
        message: 'Verificando...',
      });

      await this.loading.present();

    this.itemService.compartidos(this.user.id!).then((res)=>{
      this.items=res
      this.items.forEach((element)=>{
        if(element.compartir.length>0){
            element.compartir.forEach((element2,z) => {
              if(this.user.id===element2.iduser){
                element.compartir.splice(z,1)
              }
            });
          }
      })


    })

    this.userService.DeletePassword(this.user.id!).then((res)=>{
      if(res==204){
        this.userService.DeleteUser(this.user.id!).then(async (data)=>{
          if(data==204){
            this.Update()
            this.presentAlert("Cuanta eliminada, hasta pronto.")
            await Preferences.remove({ key: 'token' });
            this.link.navigate(['/login'])
          }else{
            this.presentAlert("Error en el servidor, intenta nuevamente.")
          }
        })
      }else{
        this.presentAlert("Error en el servidor, intenta nuevamente.")
      }
    })
    this.loading.dismiss();
  }


  Update(){
    this.itemService.Update(this.item).then((res)=>{
     if(res===204){
       this.itemsSubscription=this.itemService.getItems$().subscribe()
     }else{
       this.presentAlert("Error, intenta nuevamente");
     }
   })
 }
}
