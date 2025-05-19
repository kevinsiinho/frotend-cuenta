import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, IonModal, LoadingController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { Depositos } from 'src/app/clases/Items/depositos';
import { Items } from 'src/app/clases/Items/items';
import { UserService } from 'src/app/servicios/user/user.service';
import html2canvas from 'html2canvas';
import { Preferences } from '@capacitor/preferences';
import { Compartir } from 'src/app/clases/compartir/compartir';
import { User } from 'src/app/clases/user/user';
import { ItemReorderEventDetail } from '@ionic/angular';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { BolsillosService } from 'src/app/servicios/bolsillos/bolsillos.service';
import { Bolsillo } from 'src/app/clases/Items/bolsillo';
import { DepositosService } from 'src/app/servicios/depositos/depositos.service';
import { HistorialMes } from 'src/app/clases/Items/historial-mes';
import introJs from 'intro.js';

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
  public bolsilloEditar=new Bolsillo();
  public user = new User()
  public deposito= new Depositos()
  public depositos:Depositos[]=[];
  public depositos2:Depositos[]=[];
  public alertInputs2:any[]=[];
  public bolsillos:Bolsillo[]=[]
  public bolsillo= new Bolsillo()
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
  public positivos:number=0
  public negativos:number=0
  public negativo:number=0
  public Totalresultado:number=0
  public posicion!:Number
  nombreMeses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

convertirMesANumero(nombre: string): number {
  return this.nombreMeses.indexOf(nombre);
}

convertirNumeroAMes(numero: number): string {
  return this.nombreMeses[numero];
}
  // Verifica si el historial tiene datos y completa los meses faltantes
  // Si no hay historial, empieza desde enero del año actual
  // Si hay historial, empieza desde el mes siguiente al último registrado
  // Completa los meses faltantes hasta el mes actual
verificarYCompletarHistorial() {
 const hoy = new Date();
 if (hoy.getDate() === 1 && !this.item.realizado){
  this.item.realizado=true
};


  if(this.item.estadohistorial &&this.item.realizado && hoy.getDate() === 1){  

  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth();

  if (!this.item.historial) {
    this.item.historial = [];
  }

  let ultimoAnio = -1;
  let ultimoMes = -1;

  // Buscar el ultimo año y mes registrados
  for (let i = this.item.historial.length - 1; i >= 0; i--) {
    const anio = this.item.historial[i].ano;
    const meses = this.item.historial[i].meses;

    if (meses.length > 0) {
      ultimoAnio = Number(anio);
      ultimoMes = this.convertirMesANumero(meses[meses.length - 1].mes);
      break;
    }
  }

  // Si no hay historial, empezar desde enero del año actual
  if (ultimoAnio === -1) {
    ultimoAnio = anioActual;
    ultimoMes = 0; // Enero
  } else {
    // Empezar desde el mes siguiente al ultimo registrado
    ultimoMes += 1;
    if (ultimoMes > 11) {
      ultimoMes = 0;
      ultimoAnio++;
    }
  }

  // Completar meses faltantes
  let anio = Number(ultimoAnio);
  let mes = ultimoMes;
  while (anio < anioActual || (anio === anioActual && mes <= mesActual)) {
    const nombreMes = this.convertirNumeroAMes(mes);
    const esMesActual = (anio === anioActual && mes === mesActual);
    if (esMesActual) {
          console.log("mes actual"+esMesActual)
        }
    let registroAnual = this.item.historial.find(h =>Number( h.ano) === anio);
    if (!registroAnual) {      
      registroAnual = { ano: String(anio), meses: [] };
      this.item.historial?.push(registroAnual!);
      
    }

    const yaExiste = registroAnual?.meses.some(m => m.mes === nombreMes);
    if (!yaExiste) {
      const nuevoMes = new HistorialMes();
      nuevoMes.mes = nombreMes;
      nuevoMes.total = 0;
      nuevoMes.depositos = [];
      registroAnual?.meses.push(nuevoMes);
    }

    mes++;
    if (mes > 11) {
      mes = 0;
      anio++;
    }
  }
    // Buscar el ultimo año y mes registrados
  for (let i = this.item.historial.length - 1; i >= 0; i--) {
    const anio = this.item.historial[i].ano;
    const meses = this.item.historial[i].meses;

    if (meses.length > 0) {
      ultimoAnio = Number(anio);
      ultimoMes = this.convertirMesANumero(meses[meses.length - 1].mes);
      break;
    }
  }
  let total=0
  this.item.historial.forEach(element => {
      if(Number(anio)== Number(element.ano)){
        this.depositos.forEach(element => {
          total=total+element.valor
        });
        element.meses[ultimoMes].depositos=this.depositos
        element.meses[ultimoMes].total=total
      }
  });

  this.item.bolsillos?.forEach((bolsillo:Bolsillo) => {
    bolsillo.subtotal=0
    bolsillo.depositos?.forEach(element => {
     this.depositoServices.Delete(element.id!)
    });
    this.bolsilloService.Update(bolsillo)
  });
  this.item.realizado=false
  this.depositos=[]
  this.Update()
 }
 
}

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
    private bolsilloService: BolsillosService,
    private depositoServices:DepositosService
  ) { }

//tour o guia
iniciarTour() {
  introJs()
    .setOptions({
      steps: [
        {
          element: '.favorito',
          intro: 'Puedes selecionar la tarjeta como favorita'
        },
        {
          element: '#estadoTarjeta',
          intro: 'Aquí puedes activar o desactivar la tarjeta'
        },
        {
          element: '#popover-button2',
          intro: 'Más opciones de configuraciones'
        }
      ],
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Terminar',
    })
     .oncomplete(() => {
      // Guardar en localStorage que el tour fue completado
      localStorage.setItem('tourConfigTarjeta', 'true');
    })
    .start();
}
iniciarTour2() {
  introJs()
    .setOptions({
      steps: [
        {
          element: '#configbolsillo',
          intro: 'Aquí puedes acceder a más opciones para personalizar el bolsillo.'
        },
        {
          element: '#ver',
          intro: 'Haz clic aquí para ver la lista de depósitos de este bolsillo.'
        },
        {
          element: '#verinfo',
          intro: 'Al seleccionar un depósito, podrás ver información detallada del mismo.'
        },
        {
          element: '.list-btns',
          intro: 'Estos dos botones te permiten guardar un depósito como ingreso (positivo) o gasto (negativo).'
        },
        {
          element: '#capture',
          intro: 'Este botón te permite guardar una captura con el historial de depósitos del bolsillo seleccionado.'
        }
      ],
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Terminar',
    })
    .onbeforechange((targetElement) => {
      // Si estamos en el paso donde se necesita mostrar el contenido oculto
      if (targetElement.id === 'ver') {
        this.show(0)
      }
      return true
    })
    .oncomplete(() => {
      localStorage.setItem('tourbolsillo', 'true');
    })
    .start();
}



 handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
  const DeIndex = ev.detail.from;
  const AIndex = ev.detail.to;

  const movedItem = this.item.bolsillos?.splice(DeIndex, 1)[0];
  this.item.bolsillos?.splice(AIndex, 0, movedItem!);

  // ✅ Actualiza la posición
  this.item.bolsillos?.forEach((bolsillo, index) => {
    bolsillo.posicion = index + 1;
  });

  ev.detail.complete();

}

  toggleReorder() {
    this.isDisabled = !this.isDisabled;
    if (this.isDisabled) {
      this.item.bolsillos!.forEach(element => {
        this.bolsilloService.Update(element)
      });
    }
  }

  public async presentActionSheetEliminar(bolsillo:Bolsillo,deposito:Depositos) {

    const actionSheet = await this.actionSheetController.create({
      header: 'Información del deposito',
      cssClass: 'informacion-action-sheet',
      buttons: [
        {
          text: 'Creado por: '+deposito.email,
        },
        {
          text: 'Fecha: '+deposito.fecha,
        },
        {
          text: 'Valor: $'+deposito.valor,
        },
        {
          text: deposito.comentario,
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.AlertEliminar(bolsillo,deposito)
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

  public getBtnEliminar(bolsillo:Bolsillo, deposito:Depositos) {
    return [
      {
        text: 'No',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Sí',
        handler: () => {
          this.EliminarDeposito(bolsillo,deposito);
        }
      }
    ];
  }

  async AlertEliminar(bolsillo:Bolsillo, deposito:Depositos) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      buttons: this.getBtnEliminar(bolsillo,deposito),
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
     this.bolsillo.color="#5d4037"
     this.bolsilloEditar.color="#5d4037"
    this.loading = await this.loadingController.create({ message: '' });
    await this.loading.present();

    if (await this.userService.Verificar()) {
      const ahora = new Date();
      await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });

      const { value: token } = await Preferences.get({ key: 'token' });
      if (token) {
        const data = await this.userService.Quien(token);
        this.user = await this.userService.InfoUser(data.data);
      }

      this.id = this.router.snapshot.paramMap.get('id')!;
      this.item = await this.itemService.GetItem(this.id);

      await this.CompartidoUNO();
      if (this.item.estadohistorial) {
        this.bolsillo.Vinicial=true
        this.bolsilloEditar.Vinicial=true
        console.log(this.bolsillo.Vinicial)
      }
      this.item.bolsillos = await this.bolsilloService.allbolsillo(this.id);
      
      this.item.bolsillos!.sort((a, b) => {
        return a.posicion - b.posicion;
      });

      const todosLosDepositos = await this.depositoServices.alldepositos(this.id);
      this.depositos = todosLosDepositos;

      this.positivos = 0;
      this.negativos = 0;

      this.depositos.forEach(deposito => {
        if (deposito.valor > 0) {
          this.positivos += deposito.valor;
        } else if (deposito.valor < 0) {
          this.negativos += deposito.valor;
        }
      });


      // Distribuir depósitos a cada bolsillo
      this.item.bolsillos?.forEach(bolsillo => {
        bolsillo.depositos = this.depositos.filter(dep => dep.idBolsillo === bolsillo.id);
        if(bolsillo.Vinicial){
          if (bolsillo.valor! > 0) {
            this.positivos += bolsillo.valor!
          } else if (bolsillo.valor! < 0) {
            this.negativos += bolsillo.valor!
          }
        }
      });


      this.Totalresultado = this.positivos + this.negativos;
      const { value: orden } = await Preferences.get({ key: 'TarjetaOrden' });
      if (orden) {
        this.Ordenar(orden);
      }


      this.alertInputs2 = [
        {
          name: 'itemname',
          placeholder: "Escribe aquí",
          type: 'text',
        }
      ];

      this.ActualizarUltimaVez();
      this.verificarYCompletarHistorial()
      this.loading.dismiss();
      this.isLoading = false;
         
    const tourHecho1 = localStorage.getItem('tourConfigTarjeta');
      if (!tourHecho1) {
        this.iniciarTour();
      }
      const tourHecho2 = localStorage.getItem('tourbolsillo');
      if (this.item.bolsillos!.length>0 && !tourHecho2) {
        this.iniciarTour2();
      }
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

  formatNumberMil(value: number | undefined | null): string {
    if (typeof value !== 'number') return '0';
    return value.toLocaleString();
  }

/*
Resultado(x:number): string {
  let Tvalor=0
  let Result=0
  let positivos=0
  let negativos=0
  this.bolsillos.forEach((bolsillo,index) =>{
    if(x===index){
      if(bolsillo.Vinicial){
        bolsillo.depositos!.forEach(depositos => {
          Tvalor=Tvalor+depositos.valor
        });
        Result=bolsillo.valor!+Tvalor
      }else{
        bolsillo.depositos!.forEach(depositos => {
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
*/

Positivo(bolsillo:Bolsillo): string {
  let positivos=0
        bolsillo.depositos?.forEach(deposito => {
          if(deposito.valor>0){
            positivos=positivos+deposito.valor
          }
        });
  return this.formatNumberMil(positivos)
}

Negativo(bolsillo:Bolsillo): string {
  let negativos=0
  bolsillo.depositos?.forEach(depositos => {
    if(depositos.valor<0){
      negativos=negativos+depositos.valor
    }
  });
  return this.formatNumberMil(negativos)
}

total(){
  this.positivo=0
  this.negativo=0
  this.Totalresultado=0
  this.item.bolsillos!.forEach((bolsillo) =>{
      if(bolsillo.Vinicial){
        bolsillo.depositos!.forEach(depositos => {
          if(depositos.valor<0){
            this.negativo=this.negativo+depositos.valor
          }else{
            this.positivo=this.positivo+depositos.valor
          }
        });
        this.positivo=this.positivo+bolsillo.valor!
      }else{
        bolsillo.depositos!.forEach(deposito => {
          if(deposito.valor<0){
            this.negativo=this.negativo+deposito.valor
          }else{
            this.positivo=this.positivo+deposito.valor
          }
        });
      }
  });
  this.Totalresultado=this.positivo+(this.negativo)
  this.item.total=this.Totalresultado
  this.Update()
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

async EditarBolsillo(bolsillo:Bolsillo) {
  this.bolsilloEditar=bolsillo
}

confirmEditar() {
  if(this.bolsilloEditar.nombre!="" && this.bolsilloEditar.color!=null){
    this.bolsilloEditar.Vinicial=Boolean(this.bolsilloEditar.Vinicial)
    if(this.bolsilloEditar.Vinicial && this.bolsilloEditar.valor!<1){
      this.presentAlert("Ingresa el valor inicial");
    }else{
      this.bolsilloService.Update(this.bolsilloEditar).then((res)=>{
        if(res===204){
          this.modalEditar.dismiss('confirm');
          this.bolsilloEditar= new Bolsillo();
        }else{
          this.presentAlert("Error, intenta nuevamente");
        }
      })
    }
  }else{
    this.presentAlert("Error, verifica los datos e intenta nuevamente");
  }
}

async EliminarDepositos(id:string){

  this.item.bolsillos!.forEach(async (bolsillo:Bolsillo) => {
     
    if(id===bolsillo.id){
          
      if(bolsillo.depositos!.length>0){
          const alert = await this.alertController.create({
            header: 'Vaciar depositos',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
              },
              {
                text: 'Sí',
                handler: async () => {
                  //eliminando todos los depositos
                     await this.loading.present();
                  bolsillo.depositos!.forEach((deposito:Depositos) => {
                    this.depositoServices.Delete(deposito.id!)  
                  });
                  this.loading.dismiss();
                  bolsillo.subtotal=0
                      this.bolsilloService.Update(bolsillo).then((res)=>{
                        if(res==204){
                          bolsillo.depositos=[]
                        }
                      })
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
  });

  
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

  async EliminarItem(x: number) {
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
            this.item.bolsillos?.forEach((bolsillo, i) => {
              if (x == i) {
                bolsillo.depositos?.forEach(element => {
                  this.depositoServices.Delete(element.id!)
                });

                this.bolsilloService.Delete(bolsillo.id!).then((res) => {
                  if (res == 204) {
                    this.item.bolsillos?.splice(x, 1);

                  } else {
                    this.presentAlert("Error en el servidor, intenta más tarde.");
                  }
                  alert.dismiss();
                });
              }
            });
            this.total();
            this.ngOnInit()
            return false;
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

          this.item.bolsillos?.forEach(bolsillo => {
            if(bolsillo.depositos?.length==undefined){
              bolsillo.depositos=[]
            }
            bolsillo.depositos?.forEach(deposito => {
                this.depositoServices.Delete(deposito.id!)
            });
            this.bolsilloService.Delete(bolsillo.id!)
          });

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

EliminarDeposito(bolsillo:Bolsillo,deposito:Depositos){
    bolsillo.subtotal=0
     this.depositoServices.Delete(deposito.id!).then((res)=>{
      if(res==204){
        bolsillo.depositos?.forEach((element,x) => {
          if(element.id==deposito.id){
            bolsillo.depositos?.splice(x,1)
            bolsillo.depositos!.forEach((deposito) => {
              bolsillo.subtotal=bolsillo.subtotal+deposito.valor
            });

            this.bolsilloService.Update(bolsillo)
            this.total()
          }
        });
      }
    })

}

Compartir(){
 this.link.navigate(['compartir/',this.id])
}

RutaHistorial(){
 this.link.navigate(['tarjeta/historial',this.id])
}

  depositar(bolsillo:Bolsillo,tipo:string,){
    const fecha= new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
    const ano = fecha.getFullYear();
    this.deposito.fecha = dia+"/"+mes+"/"+ano;
    this.deposito.email=this.user.email
    this.deposito.creado= new Date ()
    this.deposito.idBolsillo=bolsillo.id
    this.deposito.idItem=this.item.id
    if(!bolsillo.depositos || bolsillo.depositos.length<0){
      bolsillo.depositos=[]
    }
    bolsillo.depositos!.push(this.deposito)
    bolsillo.subtotal=0
    if(this.deposito.valor!=null){

      if(tipo==="restar"){
        this.deposito.valor=this.deposito.valor*-1;
      }
      this.depositoServices.Create(this.deposito).then((res)=>{
        if(res.status==200){

          bolsillo.depositos!.forEach((deposito) => {
            bolsillo.subtotal=bolsillo.subtotal+deposito.valor
          });
        }
        this.bolsilloService.Update(bolsillo)
        this.total()
        this.ngOnInit()
      })

      //this.NewNotification("ha añadido un nuevo valor de $"+this.deposito.valor)

      this.deposito= new Depositos();

    }else{
      this.presentAlert("Debes ingresar un valor.");
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
    if(!this.bolsillo.Vinicial){
      this.bolsillo.Vinicial=true
    }else{
      this.bolsillo.Vinicial=false
    }
    console.log("Valor"+this.bolsillo.Vinicial)
  }

FingresarValor2(){
    if(!this.bolsilloEditar.Vinicial){
      this.bolsilloEditar.Vinicial=true
    }else{
      this.bolsilloEditar.Vinicial=false
    }
    console.log("Valor editar"+this.bolsilloEditar.Vinicial)
  }

confirm() {
    if(this.bolsillo.nombre!="" && this.bolsillo.color!=null){
      this.bolsillo.Vinicial=Boolean(this.bolsillo.Vinicial)
      if(this.bolsillo.Vinicial && this.bolsillo.valor!<1){
        this.presentAlert("Ingresa el valor inicial");
      }else{
        this.bolsillo.subtotal=0;
        this.bolsillo.creado=new Date()
        this.bolsillo.idItem=this.item.id!
        this.bolsillo.posicion=this.item.bolsillos!.length+1
      this.item.bolsillos!.push(this.bolsillo);
        this.bolsilloService.Create(this.bolsillo).then((res)=>{
          if(res.status===200){
            this.modal.dismiss('confirm');
            this.bolsillo= new Bolsillo();
            this.ngOnInit()
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
    this.bolsillos.sort((a, b) => {
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
