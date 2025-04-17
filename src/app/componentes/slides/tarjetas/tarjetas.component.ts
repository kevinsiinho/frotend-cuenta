import { Component,Input, SimpleChanges } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Items } from 'src/app/clases/Items/items';
import { User } from 'src/app/clases/user/user';
import tinycolor from 'tinycolor2';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/servicios/user/user.service';
import { Depositos } from 'src/app/clases/Items/depositos';
import { DepositosService } from 'src/app/servicios/depositos/depositos.service';
import { BolsillosService } from 'src/app/servicios/bolsillos/bolsillos.service';

register();
@Component({
  selector: 'app-tarjetas',
  templateUrl: './tarjetas.component.html',
  styleUrls: ['./tarjetas.component.scss'],
})

export class TarjetasComponent {
  public item= new Items();
  public user = new User()
  @Input() items: Items[] = [];
  public positivos:number=0
  public negativos:number=0
  public loading:any;
  public deposito= new Depositos()
  public depositos:Depositos[]=[];
  public Totalresultado:number=0

constructor(
    public userService:UserService,
    public link:Router,
    private loadingController: LoadingController,
    private depositoServices:DepositosService,
    private bolsilloService: BolsillosService,

  ) {}

 getCssVariables(color: string) {
      let lighterColor = tinycolor(color).lighten(30).toString();
      return {
        '--color1': color,
        '--color2': lighterColor
      };
 }

async ngOnChanges(changes: SimpleChanges) {

  this.loading = await this.loadingController.create({});
  await this.loading.present();
  if (changes['items'] && changes['items'].currentValue) {
    if(await this.userService.Verificar()){
      const { value } = await Preferences.get({ key: 'IntemsOrden' });
      if(value){
        this.Ordenar(value)
      }
      }
    }
    this.total()
    this.loading.dismiss();
}

Ruta(id:string){
  this.link.navigate(['/tabs/tab2/tarjeta/',id])
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
    }
 }

  formatNumberMil(value: number): string {
    return value.toLocaleString();
}


total(){
  this.items.forEach(async (item:Items,index)=>{
    this.depositos = await this.depositoServices.alldepositos(item.id!);
    this.item.bolsillos = await this.bolsilloService.allbolsillo(item.id!);
    this.positivos=0
    this.negativos=0
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

  item.total=this.positivos+(this.negativos)
  })

}

}
