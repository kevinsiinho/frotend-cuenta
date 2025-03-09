import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LoadingController } from '@ionic/angular';
import { Items } from 'src/app/clases/Items/items';
import { User } from 'src/app/clases/user/user';
import { ItemsService } from 'src/app/servicios/items/items.service';
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
export class TarjetasComponent  implements OnInit {
    public item= new Items();
    public items:Items[]=[];
    public item2= new Items();
    public items2:Items[]=[];
    public isLoading = true;
    public loading:any;
    public user = new User()

constructor(
    public userService:UserService,
    public itemService:ItemsService,
    private loadingController: LoadingController,
    public link:Router,
  ) {}

    getCssVariables(color: string) {
      let lighterColor = tinycolor(color).lighten(30).toString();
      return {
        '--color1': color,
        '--color2': lighterColor
      };
    }


async  ngOnInit() {

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

          this.itemService.allitems(data.data).then(async (res)=>{
            this.items=res

            //buscando los compartidos
            this.itemService.compartidos(data.data).then((res)=>{
              this.items2=res
            })

            //
            this.loading.dismiss();
            this.isLoading = false;
            const { value } = await Preferences.get({ key: 'IntemsOrden' });
            if(value){
              this.Ordenar(value)
            }
          })
        })
      }
    }
    this.loading.dismiss();
      this.isLoading = false;
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

}


