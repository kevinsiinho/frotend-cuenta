import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Items } from 'src/app/clases/Items/items';
import { UserService } from 'src/app/servicios/user/user.service';
import tinycolor from 'tinycolor2';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-compartidas',
  templateUrl: './compartidas.component.html',
  styleUrls: ['./compartidas.component.scss'],
})
export class CompartidasComponent   {

    @Input() items2: Items[] = [];
    items:Items[]=[]
    @ViewChild ( 'swiper' )
  swiperRef : ElementRef | undefined ;
  swiper?: Swiper ;

  constructor(
     public userService:UserService,
     public link:Router,
  ) { }

 getCssVariables(color: string) {
      let lighterColor = tinycolor(color).lighten(30).toString();
      return {
        '--color1': color,
        '--color2': lighterColor
      };
    }

  async ngOnChanges(changes: SimpleChanges) {

    if (changes['items2'] && changes['items2'].currentValue) {
      if(await this.userService.Verificar()){
        console.log(this.items2[0].NombreTarjeta)
         }
      }
  }

  Ruta(id:string){
    this.link.navigate(['/tabs/tab2/tarjeta/',id])
  }
}
