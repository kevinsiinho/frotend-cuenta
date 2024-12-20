import { Component, OnInit } from '@angular/core';
import { ItemsService } from '../servicios/items/items.service';
import { Items } from '../clases/Items/items';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { UserService } from '../servicios/user/user.service';
import { User } from '../clases/user/user';
import { Compartir } from '../clases/compartir/compartir';
import { Mensajes } from '../clases/mensajes/mensajes';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
    public item = new Items();
    public items:Items[]=[];
    public user= new User()
    public mensaje= new Mensajes()
    public isLoading = false;
    public loading:any;
    public iduser!:string
    public hoy:string=""
  constructor(
    public itemService:ItemsService,
    public link:Router,
    private alertController: AlertController,
    public userService:UserService,
    private loadingController: LoadingController,
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

    const fecha= new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
    const ano = fecha.getFullYear();
    this.hoy = dia+"/"+mes+"/"+ano;

    const { value } = await Preferences.get({ key: 'token' });
    if(value){
      this.userService.Quien(value).then((data)=>{
        this.iduser=data.data
        this.userService.InfoUser(this.iduser).then((res:User)=>{
          this.user=res
        })
        this.itemService.allitems(data.data).then(async (res)=>{
          this.items=res
        })
      })
    }
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
    this.item.userId=this.iduser
    this.item.fecha=this.hoy
    console.log(this.item.fecha)
    if(this.item.color!=null && this.item.itemname!=""){

      if(this.Duplicado()){
            this.presentAlert("Ese nombre ya existe, intenta con uno diferente.");
            this.loading.dismiss();
            this.isLoading = false;
      }else{
        this.itemService.Create(this.item).then((res)=>{
          if(res.status===200){
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
      }
    }else{
      this.loading.dismiss();
      this.isLoading = false;
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

//Verifica que no haya dos items iguales
Duplicado(){
 let duplicado=false

  this.items.forEach(item => {
    if(item.itemname==this.item.itemname){
        duplicado=true
    }
  });

  return duplicado;
}


}
