import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { Compartir } from 'src/app/clases/compartir/compartir';
import { Items } from 'src/app/clases/Items/items';
import { User } from 'src/app/clases/user/user';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-compartir-info',
  templateUrl: './compartir-info.page.html',
  styleUrls: ['./compartir-info.page.scss'],
})
export class CompartirInfoPage implements OnInit {
  public item= new Items();
  public user = new User()
  public compartir=new Compartir()
  public yo=new Compartir()
  public isLoading = true;
  public loading:any;
  public creador!:boolean
  public EstadoEditar!:string
  public id1:string=""
  public id2:string=""
  public hoy:string=""
  public datos:any[]=[]
  public actionSheetButtons:any
  public nombre=""
  public estado:string=""
  contador=0
  constructor(
    private alertController: AlertController,
    public userService:UserService,
    public link:Router,
    private loadingController: LoadingController,
    public itemService:ItemsService,
    private router:ActivatedRoute,
    private actionSheetController: ActionSheetController,
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

      this.id1=this.router.snapshot.paramMap.get('id1')!
      this.id2=this.router.snapshot.paramMap.get('id2')!
          this.userService.InfoUser(this.id1).then((res)=>{
            this.datos=[]
            this.user=res
            this.nombre=this.user.name.charAt(0)
            this.datos.push({"icono":"person-outline","name":this.user.name+" "+this.user.nickname})
            this.datos.push({"icono":"mail-outline","name":this.user.email})
            this.datos.push({"icono":"call-outline","name":this.user.cel})
            this.datos.push({"icono":"swap-vertical-outline","name":this.user.estado})
            this.datos.push({"icono":"time-outline","name":this.user.ultimaVez})
          })

    this.itemService.GetItem(this.id2).then((res)=>{
      this.item=res;
      this.CompartidoUNO()
      this.item.compartir.forEach(element => {
        if(element.iduser===this.id1){
          this.compartir=element
          this.compartir.estado ? this.estado="Editar":this.estado="Solo ver"
        }
      });
    })
  }
      this.loading.dismiss();
      this.isLoading = false;
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
          this.yo=element
        }
      });
     }

  })
}

  Update(){
    this.itemService.Update(this.item).then((res)=>{
     if(res===204){
      this.ngOnInit()
     }else{
       this.presentAlert("Error, intenta nuevamente");
     }
   })
 }

 async Permiso(){
  const actionSheet = await this.actionSheetController.create({
    header: 'Permisos',
    buttons: [
      {
        text: 'Editar',
        handler: () => {
          this.EstadoPermiso(true,this.compartir.iduser!)
        }
      },
      {
        text:"Solo ver",
        handler:()=> {
          this.EstadoPermiso(false,this.compartir.iduser!)
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ],
  });
  await actionSheet.present();
}

EstadoPermiso(estado:boolean,id:string){
  this.item.compartir.forEach((element,index) => {
  if(element.iduser===id){
    element.estado=estado
    return;
  }
  });
  this.Update()
}

/*
permisos(event:any,id:string,z:number) {
  const valorSeleccionado = event.detail.value;
if(valorSeleccionado==="editar"){
  let msn="ha cambiado tu permiso, ahora puedes editar en";
  this.Estado(true,z,msn)
}else if(valorSeleccionado==="ver"){
  let msn="ha cambiado tu permiso, ahora solo puedes ver en";
  this.Estado(false,z,msn)
}else if(valorSeleccionado==="eliminar"){
  this.EliminarCompartido(id,z)
}
  this.Update()
}
*/

public async Eliminar() {
  const actionSheet = await this.actionSheetController.create({
    header: 'Sailr del Item',
    buttons: [
      {
        text: 'Eliminar',
        role: 'destructive',
        handler:() =>{
          this.item.compartir.forEach((element,z) => {
            if(this.id1===element.iduser){
              this.item.compartir.splice(z,1)
              this.Update()
             this.Regresar()
              return;
            }
          });
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ],
  });

  await actionSheet.present();
}

  Regresar(){
    this.link.navigate(['compartir/',this.id2])
  }

  EstadoNotificacion(){
    if(this.compartir.Estadonotifacion){
      this.compartir.Estadonotifacion=false
    }else{
      this.compartir.Estadonotifacion=true
    }
    this.Update()
  }
}
