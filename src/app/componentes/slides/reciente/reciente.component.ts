import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Items } from 'src/app/clases/Items/items';
import { UserService } from 'src/app/servicios/user/user.service';
import tinycolor from 'tinycolor2';

@Component({
  selector: 'app-reciente',
  templateUrl: './reciente.component.html',
  styleUrls: ['./reciente.component.scss'],
})
export class RecienteComponent {

  @Input() items: Items[] = [];
  public item1= new Items();
  public item2= new Items();
  public item3= new Items();
  public item4= new Items();

  constructor(public userService:UserService, public link:Router) { }

  async ngOnChanges(changes: SimpleChanges) {

    if (changes['items'] && changes['items'].currentValue) {
      if(await this.userService.Verificar()){
        this.items.sort((a,b)=>{
          return new Date(b.reciente!).getTime() - new Date(a.reciente!).getTime();
        })
        }
      }
      this.item1=this.items[0]
      this.item2=this.items[1]
      this.item3=this.items[2]
      this.item4=this.items[3]
  }

   getCssVariables(color: string) {
        let lighterColor = tinycolor(color).lighten(30).toString();
        return {
          '--color1': color,
          '--color2': lighterColor
        };
   }

   Ruta(id:string){
    this.link.navigate(['/tabs/tab2/tarjeta/',id])
  }

}
