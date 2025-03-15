import { Component,ElementRef,EventEmitter,OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Tarjetas } from 'src/app/clases/tarjetas/tarjetas';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { TarjetasService } from 'src/app/servicios/tarjetas/tarjetas.service';
import { UserService } from 'src/app/servicios/user/user.service';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-tarjetas-predeterminadas',
  templateUrl: './tarjetas-predeterminadas.component.html',
  styleUrls: ['./tarjetas-predeterminadas.component.scss'],
})
export class TarjetasPredeterminadasComponent  implements OnInit {
  public tarjetas:Tarjetas[]=[]
  public tarjeta = new Tarjetas()

  @Output() Tselecionada = new EventEmitter<Tarjetas>();
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  constructor(
    public itemService:ItemsService,
    public link:Router,
    public userService:UserService,
    private tarjetasServices:TarjetasService
  ) {}

 async ngOnInit(){
    if(await this.userService.Verificar()){
        this.tarjetasServices.allTarjetas().then((data)=>{
          this.tarjetas=data
          this.Tselecionada.emit(this.tarjetas[0])
        })
      }
  }

SelectTarjeta(x:Tarjetas){
  this.Tselecionada.emit(x)

}

}
