import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Items } from 'src/app/clases/Items/items';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { UserService } from 'src/app/servicios/user/user.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  public id:string=""
  public item= new Items()
  constructor(
    public link:Router,
    private router:ActivatedRoute,
    public userService: UserService,
    private loadingController: LoadingController,
    public itemservice:ItemsService

  ) { }

async ngOnInit() {
 const loading = await this.loadingController.create({
  message: 'Cargando...',
});
  await loading.present();

  if(await this.userService.Verificar()){
    this.id = this.router.snapshot.paramMap.get('id')!;
  
   this.item= await this.itemservice.GetItem(this.id)
   this.item.historial.forEach((element)=>{
    element.meses.forEach(element2 => {
      element2.depositos.forEach(element3 => {
        console.log(element3.valor)
      });
    });
   })
    console.log(this.item)
    }
  loading.dismiss();
  }

  Regresar(){
  this.link.navigate(['tabs/tab2/tarjeta/',this.id])
}


  formatNumberMil(value: number | undefined | null): string {
    if (typeof value !== 'number') return '0';
    return value.toLocaleString();
  }

}
