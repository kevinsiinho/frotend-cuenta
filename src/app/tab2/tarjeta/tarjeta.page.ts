import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, IonModal, LoadingController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { Depositos } from 'src/app/clases/Items/depositos';
import { Items } from 'src/app/clases/Items/items';
import { Tarjetas } from 'src/app/clases/Items/tarjetas';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';
import html2canvas from 'html2canvas';
import { Preferences } from '@capacitor/preferences';
import { Compartir } from 'src/app/clases/compartir/compartir';
import { User } from 'src/app/clases/user/user';
import { ItemReorderEventDetail } from '@ionic/angular';

@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.page.html',
  styleUrls: ['./tarjeta.page.scss'],
})



export class TarjetaPage implements OnInit {

  public cardStates: boolean[] = [false, false];
  public id!:string;
  public item= new Items();
  public items:Items[]=[];
  public tarjeta=new Tarjetas();
  public tarjetaEditar=new Tarjetas();
  public tarjetas:Tarjetas[]=[];
  public user = new User()
  public deposito= new Depositos()
  public depositos:Depositos[]=[];
  public alertInputs2:any[]=[];
  public compartir=new Compartir()
  public compartirUno=new Compartir()
  public isLoading = true;
  public loading:any;
  public itemsSubscription= new Subscription()
  public totalTemp:string=""
  public colorFav!:string;
  public creador!:boolean
  public EstadoEditar!:string
  public idchat:string=""
  openModal = false;
  openModalEditar = false;
  openModal2 = false;
  isModalOpen = false;
  public btnEliminar=true;
  public isDisabled = true;
  public positivo:number=0
  public negativo:number=0
  public Totalresultado:number=0
  public posicion!:Number

  public alertInputs3:any[]= [
    {
      name: 'name',
      type: 'text',
      placeholder: 'Ingrese el nuevo nombre',
    },
  ];

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    this.Compartir()
  }

  regresar(){
    this.link.navigate(['tabs/tab2'])
  }

  @ViewChild('capturableArea') capturableArea!: ElementRef;

  constructor(
    private router:ActivatedRoute,
    public itemService:ItemsService,
    private alertController: AlertController,
    public userService:UserService,
    public link:Router,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
  ) { }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
      const DeIndex = ev.detail.from; // Índice original
      const AIndex = ev.detail.to;    // Índice nuevo

      // Mover el elemento dentro de this.item.tarjetas
      const movedItem = this.item.tarjetas.splice(DeIndex, 1)[0]; // Sacar el elemento
      this.item.tarjetas.splice(AIndex, 0, movedItem);// Insertarlo en la nueva posición

      // Marcar el reordenamiento como completado
      ev.detail.complete();
      this.Update()
      console.log('Nuevo orden:', this.item.tarjetas);
  }

  toggleReorder() {
    this.isDisabled = !this.isDisabled;
  }

  public async presentActionSheetEliminar(x:number,z:number) {
    let datos = new Depositos()
    this.item.tarjetas.forEach((element,index) => {
      if(index===x){
           element.depositos!.forEach((deposito:Depositos,index) => {
             if(index===z){
                datos=deposito
                return
             }
          });
      }
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Información del deposito',
      buttons: [
        {
          text: 'Creado por: '+datos.email,
        },
        {
          text: 'Fecha: '+datos.fecha,
        },
        {
          text: 'Valor: $'+datos.valor,
        },
        {
          text: datos.comentario,
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.AlertEliminar(x,z)
          }
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

  public getBtnEliminar(x: number, z: number) {
    return [
      {
        text: 'No',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Sí',
        handler: () => {
          this.EliminarDeposito(x, z);
        }
      }
    ];
  }

  async AlertEliminar(x: number, z: number) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      buttons: this.getBtnEliminar(x,z),
    });

    await alert.present();
  }

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.ngOnInit()
      event.target.complete();
    }, 2000);
  }

async ngOnInit() {
  let temporal=false
  this.loading = await this.loadingController.create({
    message: '',
  });
  await this.loading.present();

  if(await this.userService.Verificar()){
    const ahora= new Date();
    await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
    const { value } = await Preferences.get({ key: 'token' });
    if(value){
      this.userService.Quien(value).then((data)=>{
        this.userService.InfoUser(data.data).then((res)=>{
          this.user=res
        })
      })
    }

    this.id=this.router.snapshot.paramMap.get('id')!
    this.itemService.GetItem(this.id).then(async (res)=>{
      this.item=res;
      this.item.tarjetas.forEach((tarjeta,x) => {
        if(tarjeta.posicion==undefined){
          temporal=true
           tarjeta.posicion=x
        }
      });

      this.CompartidoUNO()
      const { value } = await Preferences.get({ key: 'TarjetaOrden' });
      if(value){
        this.Ordenar(value)
      }
      this.total()
      this.alertInputs2 = [
        {
          name: 'itemname',
          placeholder:"Escribe aquí",
          type: 'text',
        }
      ];


      this.ActualizarUltimaVez()
    })
    this.loading.dismiss();
    this.isLoading = false;

  }
  }

ActualizarUltimaVez(){
  this.item.reciente= new Date()
  this.Update()
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

formatNumberMil(value: number): string {
    return value.toLocaleString();
}

Resultado(x:number): string {
  let Tvalor=0
  let Result=0
  let positivos=0
  let negativos=0
  this.tarjetas.forEach((tarjeta,index) =>{
    if(x===index){
      if(tarjeta.Vinicial){
        tarjeta.depositos!.forEach(depositos => {
          Tvalor=Tvalor+depositos.valor
        });
        Result=tarjeta.Valor!+Tvalor
      }else{
        tarjeta.depositos!.forEach(depositos => {
          if(depositos.valor>0){
            positivos=positivos+depositos.valor
          }else{
            negativos=negativos+depositos.valor
          }
        });
        Result=positivos+negativos
      }
    }
  });
  return String(Result)
}

Positivo(x:number): string {
  let positivos=0
  this.item.tarjetas.forEach((tarjeta,index) =>{
    if(x===index){
        tarjeta.depositos!.forEach(depositos => {
          if(depositos.valor>0){
            positivos=positivos+depositos.valor
          }
        });
      }
  });
  return this.formatNumberMil(positivos)
}

Negativo(x:number): string {
  let negativos=0
  this.item.tarjetas.forEach((tarjeta,index) =>{
    if(x===index){
        tarjeta.depositos!.forEach(depositos => {
          if(depositos.valor<0){
            negativos=negativos+depositos.valor
          }
        });
      }
  });
  return this.formatNumberMil(negativos)
}

total(){
  this.positivo=0
  this.negativo=0
  this.Totalresultado=0
  this.item.tarjetas.forEach((tarjeta) =>{
      if(tarjeta.Vinicial){
        tarjeta.depositos!.forEach(depositos => {
          if(depositos.valor<0){
            this.negativo=this.negativo+depositos.valor
          }else{
            this.positivo=this.positivo+depositos.valor
          }
        });
        this.positivo=this.positivo+tarjeta.Valor!
      }else{
        tarjeta.depositos!.forEach(depositos => {
          if(depositos.valor<0){
            this.negativo=this.negativo+depositos.valor
          }else{
            this.positivo=this.positivo+depositos.valor
          }
        });
      }
  });
  this.Totalresultado=this.positivo+(this.negativo)
}

Favorito(){
  if(this.item.favorito==true){
    this.item.favorito=false
  }else if(this.item.favorito==false){
    this.item.favorito=true
  }else{
    this.item.favorito=false
  }
  this.Update()
}

EditarNombreTarjeta() {
this.link.navigate(['/editar-tarjeta/',this.id])

}

async EditarBolsillo(x:number) {
  this.item.tarjetas.forEach(async (tarjeta,index) => {
    if(x===index){
      this.posicion=index
      this.tarjetaEditar=tarjeta
    }
    return
  });
}

confirmEditar() {
  if(this.tarjetaEditar.nombre!="" && this.tarjetaEditar.color!=null){
    this.tarjetaEditar.Vinicial=Boolean(this.tarjetaEditar.Vinicial)
    if(this.tarjetaEditar.Vinicial && this.tarjetaEditar.Valor!<1){
      this.presentAlert("Ingresa el valor inicial");
    }else{
      this.itemService.Update(this.item).then((res)=>{
        if(res===204){
          this.modalEditar.dismiss('confirm');
          this.tarjetaEditar= new Tarjetas();
        }else{
          this.presentAlert("Error, intenta nuevamente");
        }
      })
    }
  }else{
    this.presentAlert("Error, verifica los datos e intenta nuevamente");
  }
}

async EliminarDepositos(x:number){
  if(this.item.tarjetas[x].depositos!.length>0){
  const alert = await this.alertController.create({
    header: 'Vaciar depositos',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Sí',
        handler: () => {
          this.item.tarjetas.forEach((bolsillos:Tarjetas, posicion) => {
            if(x===posicion){
              console.log(this.item.tarjetas[x].depositos=[])
              this.item.tarjetas[x].subtotal=0
            }
          });
          this.Update()
          this.total()
        },
      },
    ],
  });

  await alert.present();
}else{
  this.presentAlert("No hay depositos")
}
}

show(x:number):void{
    this.cardStates[x] = !this.cardStates[x];
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

async EliminarItem(x:number){
    const alert = await this.alertController.create({
      header: 'Eliminar',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: () => {
            this.item.tarjetas.splice(x,1)
            this.Update()
            this.total()
          },
        },
      ],
    });
    await alert.present();
}

async EliminarCompartida(id:string){
  const alert = await this.alertController.create({
    header: 'Eliminar',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Quitar',
        handler: () => {
          this.item.compartir.forEach((data,index)=>{
            if(data.iduser===id){
              this.item.compartir.splice(index,1)
              this.Update()
              this.regresar()
              return
            }
          })
        },
      },
    ],
  });
  await alert.present();
}

async EliminarTarjeta(){
  const alert = await this.alertController.create({
    header: 'Eliminar tarjeta',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: () => {
          this.itemService.Delete(this.id).then((data)=>{
           if(data==204){
            this.regresar()
           }else{
            this.presentAlert("Error, intenta nuevamente");
           }

          })
        },
      },
    ],
  });
  await alert.present();
}

  EliminarDeposito(x:number,z:number){

    this.item.tarjetas.forEach((element,index) => {
      if(index===x){
        element.depositos!.splice(z,1);
        element.subtotal=0
        element.depositos!.forEach(element2 => {
          element.subtotal=element.subtotal+element2.valor
        });
        this.total()
        return;
      }
    });

    this.Update();
  }

  Compartir(){
    this.link.navigate(['compartir/',this.id])
  }

  depositar(x:number,tipo:string){
    const fecha= new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
    const ano = fecha.getFullYear();
    this.deposito.fecha = dia+"/"+mes+"/"+ano;
    this.deposito.email=this.user.email

    if(this.deposito.valor!=null){

      if(tipo==="restar"){
        this.deposito.valor=this.deposito.valor*-1;
      }
      this.item.tarjetas.forEach((element,index) => {
        if(index===x){
          element.depositos?.push(this.deposito)
          element.subtotal=0
            element.depositos!.forEach(element2 => {
              element.subtotal=element.subtotal+element2.valor
            });
            this.total()
          return;
        }
      });
      //this.NewNotification("ha añadido un nuevo valor de $"+this.deposito.valor)
      this.Update();
      this.deposito= new Depositos();

    }else{
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

/*Modal añadir tarjeta*/
@ViewChild('modal', { static: false }) modal!: IonModal;
@ViewChild('modalEditar', { static: false }) modalEditar!: IonModal;

cancel() {
  this.modal.dismiss(null, 'cancel');
}

cancel2() {
  this.modalEditar.dismiss(null, 'cancel');
}


  Festado(tipo:string){
    tipo=="activar" ?   this.item.estado=false:  this.item.estado=true
    this.Update()
  }

  FingresarValor(){
    if(!this.tarjeta.Vinicial){
      this.tarjeta.Vinicial=true
    }else{
      this.tarjeta.Vinicial=false
    }
  }

  confirm() {
    if(this.tarjeta.nombre!="" && this.tarjeta.color!=null){
      this.tarjeta.Vinicial=Boolean(this.tarjeta.Vinicial)
      if(this.tarjeta.Vinicial && this.tarjeta.Valor!<1){
        this.presentAlert("Ingresa el valor inicial");
      }else{
        this.tarjeta.subtotal=0;
        this.tarjeta.depositos=[]
        this.tarjeta.posicion=this.item.tarjetas.length+1
      this.item.tarjetas.push(this.tarjeta);
        this.itemService.Update(this.item).then((res)=>{
          if(res===204){
            this.modal.dismiss('confirm');
            this.tarjeta= new Tarjetas();
          }else{
            this.presentAlert("Error, intenta nuevamente");
          }
        })
      }
    }else{
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
    }
  }

  onWillDismissE(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
    }
  }

async Ordenar(ordenar:string){

  await Preferences.set({
    key: 'TarjetaOrden',
    value: ordenar,
  });

  if(ordenar=="nombre"){
    this.tarjetas.sort((a, b) => {
      return a.nombre.localeCompare(b.nombre);
    });
  }else if(ordenar=="favorito"){
    this.items.sort((a, b) => {
      return a.favorito === b.favorito ? 0 : a.favorito ? -1 : 1;
    });
  }
}

/*tomar capture*/
@ViewChild(IonContent, { static: false }) ionContent!: IonContent;
CapturaPantalla(x: number) {
  const itemElementId = 'item-' + x;
  const capturableArea = document.getElementById(itemElementId);

  if (!capturableArea) {
    console.error(`El elemento ${itemElementId} no se encontró en el DOM.`);
    return;
  }

  html2canvas(capturableArea).then(canvas => {
    const imageData = canvas.toDataURL('image/png');

    // Crear un enlace para descargar la imagen
    const downloadLink = document.createElement('a');
    downloadLink.href = imageData;
    downloadLink.download = 'captura_pantalla.png';
    document.body.appendChild(downloadLink);

    // Simular clic en el enlace para iniciar la descarga
    downloadLink.click();

    // Eliminar el enlace después de la descarga
    document.body.removeChild(downloadLink);

    this.presentAlert("Imagen descargada")
  });
}

}
