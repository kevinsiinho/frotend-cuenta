import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Items } from 'src/app/clases/Items/items';
import { Tarjetas } from 'src/app/clases/tarjetas/tarjetas';
import { User } from 'src/app/clases/user/user';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';
import tinycolor from 'tinycolor2';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {

  public item = new Items();
  public user= new User()
  public isLoading = false;
  public loading:any;
  public id!:string
  public hoy:string=""
  public tarjeta=new Tarjetas()

  constructor(
    public itemService:ItemsService,
    public link:Router,
    private alertController: AlertController,
    public userService:UserService,
    private loadingController: LoadingController,
    private router:ActivatedRoute,
  ) {}

   public listaIconos: string[] = [
    'card', 'cash', 'wallet', 'stats-chart', 'business', 'money', 'pin', 'search',
    'add-circle', 'remove-circle', 'add', 'remove', 'checkmark-circle', 'close-circle',
    'arrow-up-circle', 'arrow-down-circle', 'person', 'build', 'home', 'gift'
  ];

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }


ColorDeLetra(){
  this.item.colorLetra==="white"? this.item.colorLetra="black":this.item.colorLetra="white"
}

  getGradientColor(){
  const lighterColor = tinycolor(this.item.ColorFondo).lighten(30).toString(); // 20% más claro
  document.documentElement.style.setProperty('--color1',this.item.ColorFondo!);
  document.documentElement.style.setProperty('--color2', lighterColor);
}

async ngOnInit() {

  this.loading = await this.loadingController.create({
    message: '',
  });

  await this.loading.present();

  if(await this.userService.Verificar()){

    this.id=this.router.snapshot.paramMap.get('id')!
    this.itemService.GetItem(this.id).then(async (res)=>{
      this.item=res;
      console.log(this.item)
    })
    this.loading.dismiss();
    this.isLoading = false;

  }
  }

async Actualizar(){
  this.loading = await this.loadingController.create({
    message: '',
  });

if(this.item.NombreTarjeta!="principal-dinamica"){
  this.item.ColorFondo=""
}
await this.loading.present();
this.isLoading = true;
  if(this.item.icono && this.item.itemname!="" || this.item.itemname!=null){
    if(this.Duplicado()){
          this.presentAlert("Ese nombre ya existe, intenta con uno diferente.");
          this.loading.dismiss();
          this.isLoading = false;
    }else{
      this.itemService.Update(this.item).then((res)=>{
        if(res===204){
          this.loading.dismiss();
          this.isLoading = false;
          this.presentAlert("Actualizado correctamente");
          this.item = new Items()
          this.ngOnInit()
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

Duplicado(){
let duplicado=false
/*
  this.items.forEach(item => {
    if(item.itemname==this.item.itemname){
        duplicado=true
    }
  });
*/
  return duplicado;

}

RecibirTarjeta(x:Tarjetas){
  this.tarjeta=x
  this.item.NombreTarjeta=this.tarjeta.nombreCSS!
  this.item.Idtarjeta=this.tarjeta.id!
}

regresar(){
  this.link.navigate(['tabs/tab2/tarjeta/',this.id])
}

}
