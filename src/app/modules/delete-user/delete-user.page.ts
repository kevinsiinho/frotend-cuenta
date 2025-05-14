import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { InfoDevice } from 'src/app/clases/device/device';
import { Bolsillo } from 'src/app/clases/Items/bolsillo';
import { Depositos } from 'src/app/clases/Items/depositos';
import { Items } from 'src/app/clases/Items/items';
import { Notas } from 'src/app/clases/notas/notas';
import { User } from 'src/app/clases/user/user';
import { BolsillosService } from 'src/app/servicios/bolsillos/bolsillos.service';
import { ConfiguracionesService } from 'src/app/servicios/configuraciones/configuraciones.service';
import { DepositosService } from 'src/app/servicios/depositos/depositos.service';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { NotasService } from 'src/app/servicios/notas/notas.service';
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
  public notas:Notas[]=[];
  public itemsSubscription= new Subscription()
  public cargar:boolean=false;
  public depositos:Depositos[]=[];
  public bolsillos:Bolsillo[]=[]
  public devices:InfoDevice[]=[];

  constructor(
    private alertController: AlertController,
    public userService: UserService,
    public itemService:ItemsService,
    public notaservices:NotasService,
    public link:Router,
    private loadingController: LoadingController,
    public depositosServices:DepositosService,
    public bolsilloService:BolsillosService,
    private ConfigService:ConfiguracionesService
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
  this.cargar=true;

    this.itemService.compartidos(this.user.id!).then((res)=>{
      this.items=res
      this.items.forEach((element)=>{
        if(element.compartir.length>0){
            element.compartir.forEach((element2,z) => {
              if(this.user.id===element2.iduser){
                element.compartir.splice(z,1)
                this.Update(element)
              }
            });
          }
      })


    })

  this.items=[]
   this.notas= await this.notaservices.allnotas(this.user.id!)
   this.items= await this.itemService.allitems(this.user.id!)

if(this.items.length>0){       
  this.notas.forEach((nota:Notas) => {
    this.notaservices.Delete(nota.id!)    
  });
}

if(this.items.length>0){
  this.items.forEach(async (item:Items) => {
    this.bolsillos= await this.bolsilloService.allbolsillo(item.id!)

  if(this.bolsillos.length>0){
   this.bolsillos.forEach((bolsillo:Bolsillo) => {

    this.depositosServices.alldepositosIDBolsillo(bolsillo.id!).then((res)=>{
    this.depositos=res 
    if(this.depositos.length>0){
    this.depositos.forEach((deposito:Depositos) => {
      this.depositosServices.Delete(deposito.id!)
    });
  }
    this.bolsilloService.Delete(bolsillo.id!) 
  })

   });
  }
    this.itemService.Delete(item.id!)
  });
}


 this.devices = await this.ConfigService.Gets(this.user.id!)

 this.devices.forEach(element => {
  this.ConfigService.Delete(element.id!)  
});

    this.userService.DeletePassword(this.user.id!).then((res)=>{
      if(res==204){
        this.userService.DeleteUser(this.user.id!).then(async (data)=>{
          if(data==204){
            this.presentAlert("Cuanta eliminada, hasta pronto.")
            await Preferences.remove({ key: 'token' });
            this.cargar=false;
            this.link.navigate(['/login'])
          }else{
            this.presentAlert("Error en el servidor, intenta nuevamente.")
          }
        })
      }else{
        this.presentAlert("Error en el servidor, intenta nuevamente.")
      }
    })
    
 this.cargar=false;
  }


  Update(item:Items){
    this.itemService.Update(item).then((res)=>{
     if(res===204){
       this.itemsSubscription=this.itemService.getItems$().subscribe()
     }else{
       this.presentAlert("Error, intenta nuevamente");
     }
   })
 }
}
