import { Component,Input, SimpleChanges } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Items } from 'src/app/clases/Items/items';
import { User } from 'src/app/clases/user/user';
import { UserService } from 'src/app/servicios/user/user.service';
import tinycolor from 'tinycolor2';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';

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
  public positivo:number=0
  public negativo:number=0

constructor(
    public userService:UserService,
    public link:Router,
  ) {}

 getCssVariables(color: string) {
      let lighterColor = tinycolor(color).lighten(30).toString();
      return {
        '--color1': color,
        '--color2': lighterColor
      };
 }

async ngOnChanges(changes: SimpleChanges) {

  if (changes['items'] && changes['items'].currentValue) {
    if(await this.userService.Verificar()){

      const { value } = await Preferences.get({ key: 'IntemsOrden' });
      if(value){
        this.total()
        this.Ordenar(value)
      }
      }
    }
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
  this.items.forEach((item:Items,index)=>{
    this.positivo=0
    this.negativo=0
    item.tarjetas.forEach((tarjeta) =>{
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
  item.total=this.positivo+(this.negativo)
  })

}

}
