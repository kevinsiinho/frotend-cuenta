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
  openModal = false;
  openModal2 = false;
  isModalOpen = false;
  public btnEliminar=true;

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  @ViewChild('capturableArea') capturableArea!: ElementRef;

  constructor(private router:ActivatedRoute,
    public itemService:ItemsService,
    private alertController: AlertController,
    public userService:UserService,
    public link:Router,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController
  ) { }

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
          text: 'Fecha: $'+datos.fecha,
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

  public alertButtons3 = [
    {
      text: 'No',
      cssClass: 'alert-button-cancel',
    },
    {
      text: 'Yes',
      cssClass: 'alert-button-confirm',
      handler: () => {
        this.itemService.Delete(this.id).then((res)=>{
          console.log(res)
          this.link.navigate(['tabs/tab2'])
        })
      }
    },
  ];

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

  this.loading = await this.loadingController.create({
    message: '',
  });
  await this.loading.present();

  if(await this.userService.Verificar()){
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
    })
    this.loading.dismiss();
    this.isLoading = false;

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

formatNumberMil(value: number): string {
    return value.toLocaleString();
  }

total(){
  this.totalTemp=""
  this.item.total=0
  this.item.tarjetas.forEach(element => {
    this.item.total=this.item.total+element.subtotal
    this.totalTemp = this.item.total.toLocaleString();
  });
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

  async presentAlert2() {
    const alert = await this.alertController.create({
      header: 'Actualizar nombre',
      inputs: this.alertInputs2,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            this.item.itemname=data.itemname;
            this.Update()
          },
        },
      ],
    });

    await alert.present();
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
          text: 'Eliminar',
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

      this.Update();
      this.deposito= new Depositos();

    }else{
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

/*Modal añadir tarjeta*/
  @ViewChild(IonModal) modal!: IonModal;

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  Festado(tipo:string){
    tipo=="activar" ?   this.item.estado=false:  this.item.estado=true
    this.Update()
  }

  confirm() {
    if(this.tarjeta.nombre!="" && this.tarjeta.color!=null){
      this.tarjeta.subtotal=0;
      this.tarjeta.depositos=[]
      this.item.tarjetas.push(this.tarjeta);
      this.itemService.Update(this.item).then((res)=>{
        if(res===204){
          this.modal.dismiss('confirm');
          this.tarjeta= new Tarjetas();
        }else{
          this.presentAlert("Error, intenta nuevamente");
        }
      })

    }else{
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

  onWillDismiss(event: Event) {
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
