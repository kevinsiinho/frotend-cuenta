import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { UserService } from '../servicios/user/user.service';
import { Items } from '../clases/Items/items';
import { ItemsService } from '../servicios/items/items.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{
  public item= new Items();
  public items:Items[]=[];
  public isLoading = true;
  public loading:any;

  constructor(
    public userService:UserService,
    public itemService:ItemsService,
    private loadingController: LoadingController
  ) {}

  handleRefresh(event:any) {
    setTimeout(() => {
      this.ngOnInit()
      event.target.complete();
    }, 2000);
  }

async ngOnInit(){
    this.loading = await this.loadingController.create({
      message: '',
    });
    await this.loading.present();

    if(await this.userService.Verificar()){
        this.itemService.allitems().then(async (res)=>{
          this.items=res
          const { value } = await Preferences.get({ key: 'IntemsOrden' });
          if(value){
            this.Ordenar(value)
          }
        })
      }
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
    }
  }

}
