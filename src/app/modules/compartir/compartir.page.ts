import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Items } from 'src/app/clases/Items/items';
import { Compartir } from 'src/app/clases/compartir/compartir';
import { Mensajes } from 'src/app/clases/mensajes/mensajes';
import { User } from 'src/app/clases/user/user';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-compartir',
  templateUrl: './compartir.page.html',
  styleUrls: ['./compartir.page.scss'],
})
export class CompartirPage implements OnInit {

  public item= new Items();
  public items:Items[]=[];
  public user = new User()
  public resultados:any[]=[];
  public compartir=new Compartir()
  public compartirUno=new Compartir()
  public mensaje= new Mensajes()
  public isLoading = true;
  public loading:any;
  public creador!:boolean
  public EstadoEditar!:string
  public itemsSubscription= new Subscription()
  public id:string=""
  public hoy:string=""
  public letra:string=""

  constructor(
    private alertController: AlertController,
    public userService:UserService,
    public link:Router,
    private loadingController: LoadingController,
    public itemService:ItemsService,
    private router:ActivatedRoute,
  ) { }

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async ngOnInit() {

    this.loading = await this.loadingController.create({
      message: '',
    });
    await this.loading.present();

    if(await this.userService.Verificar()){

      const fecha= new Date();
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const ano = fecha.getFullYear();
      this.hoy = dia+"/"+mes+"/"+ano;
      this.id=this.router.snapshot.paramMap.get('id')!
        this.itemService.GetItem(this.id).then(async (res)=>{
          this.item=res;
          this.CompartidoUNO()
          this.userService.InfoUser(this.item.userId).then((res)=>{
            this.user=res
            this.letra=this.user.name.charAt(0)
          })
        })

  }
      this.loading.dismiss();
      this.isLoading = false;
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

  /*Buscar */
buscar(buscando:any){
  this.resultados=[]
  if(buscando.target.value.length>0){
    this.userService.buscar(buscando.target.value).then((data)=>{
      this.resultados=data
    })
  }else{
    this.resultados=[]
  }
}

async CompartidoUNO(){
  const { value } = await Preferences.get({ key: 'token' });
  if(value)
  this.userService.Quien(value).then((res)=>{

     if(res.data===this.item.userId){
        this.creador=true
     }else{
      this.item.compartir.forEach(element => {
        if(res.data===element.iduser){
          this.compartirUno=element
        }
      });
     }

  })
}

async add(id:string, email:string,nombre:string,apellido:string){

  this.compartir.iduser=id
  this.compartir.email=email
  this.compartir.estado=false
  this.compartir.nombre=nombre+" "+apellido
  this.compartir.Estadonotifacion=true

  const { value } = await Preferences.get({ key: 'token' });
  if(value){
    this.userService.Quien(value).then((res)=>{
      if(this.compartir.iduser===res.data){
        this.presentAlert("No puedes añadirte")
      }else{
        if(this.item.compartir.length === 0){
          this.item.compartir.push(this.compartir)
          this.presentAlert("Añadido")
          this.Update()
          this.compartir=new Compartir()
        }else{
          this.item.compartir.forEach(element => {

            if(element.iduser===this.compartir.iduser && this.compartir.email!.length>7){
              this.presentAlert("Ya lo haz agregado")
              return
            }else{
              if(this.compartir.email!.length>7){
                this.item.compartir.push(this.compartir)
                this.presentAlert("Añadido")
                this.Update()
                this.compartir=new Compartir()
                return
              }
            }
          });
        }
      }
    })
  }
}

Regresar(){
  this.link.navigate(['tabs/tab2/tarjeta/',this.id])
}

}
