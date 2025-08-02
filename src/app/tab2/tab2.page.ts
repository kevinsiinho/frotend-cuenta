import { Component, OnInit, ViewChild } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Items } from '../clases/Items/items';
import { ItemsService } from '../servicios/items/items.service';
import { IonContent, LoadingController } from '@ionic/angular';
import { User } from '../clases/user/user';
import { register } from 'swiper/element/bundle';
import { IonPopover } from '@ionic/angular';
import { Notas } from '../clases/notas/notas';
import { NotasService } from '../servicios/notas/notas.service';
import { UserService } from '../servicios/user/user.service';
import { DepositosService } from '../servicios/depositos/depositos.service';
import { BolsillosService } from '../servicios/bolsillos/bolsillos.service';
import { Depositos } from '../clases/Items/depositos';
import { Bolsillo } from '../clases/Items/bolsillo';

register();
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  public item= new Items();
  public items:Items[]=[];
  public item2= new Items();
  public items2:Items[]=[];
  public notas:Notas[]=[]
  public isLoading = true;
  public loading:any;
  public user = new User()
  public positivos:number=0
  public negativos:number=0
  public depositos:Depositos[]=[];

  @ViewChild('popover') popover!: IonPopover;
  @ViewChild(IonContent, { static: false }) content!: IonContent;


 //lista de opciones y opción selecionada
 public listopciones:string[] = ['ALL','TARJETAS','LISTAS','COMPARTIDOS'];
 public opcionselecionada: string = this.listopciones[0];

constructor(
    public userService:UserService,
    public itemService:ItemsService,
    private loadingController: LoadingController,
    public notaservices:NotasService,
    private depositoServices:DepositosService,
    private bolsilloService: BolsillosService,
  ) {}

  openPopover(event: Event) {
    this.popover.event = event;
    this.popover.present();
  }

  async ionViewWillEnter() {
      await this.Principal()
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.Principal()
      event.target.complete();
    }, 2000);
  }

async ngOnInit() {
  const ahora= new Date();
  await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });
  //this.itemService.all()
  }

async Principal(){

  this.loading = await this.loadingController.create({
    message: 'Cargando...',
  });

  await this.loading.present();

  // ✅ Verificación rápida antes de cargar datos
  const isValid = await this.userService.Verificar();
  
  if (isValid) {
    const { value:token } = await Preferences.get({ key: 'token' });
    if(token){
      const data = await this.userService.Quien(token)
      this.user = await this.userService.InfoUser(data.data)
      this.notas= await this.notaservices.allnotas(data.data)
      this.items= await this.itemService.allitems(data.data)
      this.items2= await   this.itemService.compartidos(data.data)
    }
    
    const { value } = await Preferences.get({ key: 'IntemsOrden' });
    if(value){
      this.Ordenar(value)
    }
  }
  
  // ✅ Siempre cerrar loading
  this.loading.dismiss();
  this.isLoading = false;
}

 async Ordenar(ordenar:string){
    await Preferences.set({
      key: 'IntemsOrden',
      value: ordenar,
    });

    if(ordenar=="nombre"){
      this.items.sort((a, b) => {
        return a.itemname.localeCompare(b.itemname);
      });
    }else if(ordenar=="favorito"){
      this.items.sort((a, b) => {
        return a.favorito === b.favorito ? 0 : a.favorito ? -1 : 1;
      });
    }else if(ordenar=="reciente"){
      this.items.sort((a,b)=>{
        return new Date(b.reciente!).getTime() - new Date(a.reciente!).getTime();
      })
    }
  }


scrollToTop() {
  this.content.scrollToTop(300); // 300ms para suavizar el desplazamiento
}

async total() {
  for (const item of this.items) {
    let positivos = 0;
    let negativos = 0;
    item.total = 0;

    const bolsillos = await this.bolsilloService.allbolsillo(item.id!);
    const depositos = await this.depositoServices.alldepositos(item.id!);

    bolsillos.forEach((bolsillo:Bolsillo) => {
      bolsillo.depositos = depositos.filter((dep:Bolsillo) => dep.idItem === bolsillo.id);

      if (item.id === bolsillo.idItem) {
        if (bolsillo.Vinicial) {
          if (bolsillo.valor! > 0) {
            positivos += bolsillo.valor!;
          } else if (bolsillo.valor! < 0) {
            negativos += bolsillo.valor!;
          }
        }
      }
    });

    depositos.forEach((deposito:Depositos) => {
      if (item.id === deposito.idItem) {
        if (deposito.valor > 0) {
          positivos += deposito.valor;
        } else if (deposito.valor < 0) {
          negativos += deposito.valor;
        }
      }
    });

    item.total = positivos + negativos;
  }
}
}
