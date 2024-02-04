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
  public item2= new Items();
  public items2:Items[]=[];
  public isLoading = true;
  public loading:any;

  constructor(
    public userService:UserService,
    public itemService:ItemsService,
    private loadingController: LoadingController
  ) {}


  async ionViewWillEnter() {
      await this.Principal()
  }
  handleRefresh(event:any) {
    setTimeout(() => {
      this.ngOnInit()
      event.target.complete();
    }, 2000);
  }

  ngOnInit() {
      console.log()
  }

async Principal(){
    this.loading = await this.loadingController.create({
      message: '',
    });
    await this.loading.present();

    if(await this.userService.Verificar()){

      const { value } = await Preferences.get({ key: 'token' });
      if(value){
        this.userService.Quien(value).then((data)=>{
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
