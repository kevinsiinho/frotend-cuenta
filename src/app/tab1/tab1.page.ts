import { Component, OnInit } from '@angular/core';
import { ItemsService } from '../servicios/items/items.service';
import { Items } from '../clases/Items/items';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { UserService } from '../servicios/user/user.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
    public item = new Items();
    public items:Items[]=[];
    public isLoading = false;
    public loading:any;
  constructor(
    public itemService:ItemsService,
    public link:Router,
    private alertController: AlertController,
    public userService:UserService,
    private loadingController: LoadingController
  ) {}

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }


async ngOnInit(){
    if(await this.userService.Verificar()){
      this.OnQuien()
      }

  }

async Guardar(){
  this.loading = await this.loadingController.create({
    message: 'Cargando...',
  });
  await this.loading.present();
  this.isLoading = true;
    this.item.estado=true;
    this.item.favorito=false;
    this.item.total=0;
    if(this.item.color!=null && this.item.itemname!=""){
      this.itemService.Create(this.item).then((res)=>{
        if(res===200){
          this.loading.dismiss();
          this.isLoading = false;
          this.presentAlert("Guardado correctamente");
          this.item = new Items()
        }else{
          this.loading.dismiss();
          this.isLoading = false;
          this.presentAlert("Error en el servidor");
        }
      })
    }else{
      this.loading.dismiss();
      this.isLoading = false;
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

  async OnQuien(){
    const { value } = await Preferences.get({ key: 'token' });
    if(value)
    this.userService.Quien(value).then((res)=>{
      this.item.userId=res.data
    })
  }
}
