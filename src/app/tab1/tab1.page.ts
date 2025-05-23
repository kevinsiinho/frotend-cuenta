import { Component, OnInit, } from '@angular/core';
import { ItemsService } from '../servicios/items/items.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { UserService } from '../servicios/user/user.service';
import { User } from '../clases/user/user';
import { Mensajes } from '../clases/mensajes/mensajes';
import { register } from 'swiper/element/bundle';
import tinycolor from 'tinycolor2';
import { Tarjetas } from '../clases/tarjetas/tarjetas';
import { Items } from '../clases/Items/items';
import introJs from 'intro.js';


register();
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
    public item = new Items();
    public items:Items[]=[];
    public user= new User()
    public mensaje= new Mensajes()
    public isLoading = false;
    public loading:any;
    public iduser!:string
    public hoy:string=""
    public colorletra:boolean=false
    public tarjeta=new Tarjetas()

  constructor(
    public itemService:ItemsService,
    public link:Router,
    private alertController: AlertController,
    public userService:UserService,
    private loadingController: LoadingController,
  ) {}

  idTarjeta = '1234567812345678';
  esCompartida = true;

 //lista de opciones y opción selecionada
 public listopciones:string[] = ['TARJETA','LISTA'];
 public listaIconos: string[] = [
  'card', 'cash', 'wallet', 'stats-chart', 'business', 'money', 'pin', 'search',
  'add-circle', 'remove-circle', 'add', 'remove', 'checkmark-circle', 'close-circle',
  'arrow-up-circle', 'arrow-down-circle', 'person', 'build', 'home', 'gift'
];

 opcionselecionada: string = this.listopciones[0];

ColorDeLetra(){
  this.item.colorLetra==="white"? this.item.colorLetra="black":this.item.colorLetra="white"
}

EstadoHistorial(){
  this.item.estadohistorial= !this.item.estadohistorial
  console.log("Estado: "+this.item.estadohistorial)
}

 getGradientColor(){
  const lighterColor = tinycolor(this.item.ColorFondo).lighten(30).toString(); // 20% más claro
  document.documentElement.style.setProperty('--color1',this.item.ColorFondo!);
  document.documentElement.style.setProperty('--color2', lighterColor);
}

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }

async ngOnInit(){
  if(await this.userService.Verificar()){
    this.item.colorLetra="white"
    this.item.ColorFondo="#027abb"
    this.item.icono="card"
    this.item.estadohistorial=false
    this.getGradientColor()
    const fecha= new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
    const ano = fecha.getFullYear();
    this.hoy = dia+"/"+mes+"/"+ano;

   // await Preferences.set({ key: 'ultimaActividad', value: fecha.toString() });
    const { value } = await Preferences.get({ key: 'token' });
    if(value){
      this.userService.Quien(value).then((data)=>{
        this.iduser=data.data
        this.userService.InfoUser(this.iduser).then((res:User)=>{
          this.user=res
        })
        this.itemService.allitems(data.data).then(async (res)=>{
          this.items=res
        })
      })
    }
    
  const tourHecho = localStorage.getItem('tourNuevaTarjeta');
    if (!tourHecho) {
      this.iniciarTour();
    }
  }
}

RecibirTarjeta(x:Tarjetas){
  this.tarjeta=x
}

async Guardar(){

  this.loading = await this.loadingController.create({
    message: 'Cargando...',
  });

  await this.loading.present();
  this.isLoading = true;
    this.item.estado=false;
    this.item.favorito=false;
    this.item.total=0;
    this.item.userId=this.iduser
    this.item.fecha=this.hoy
    this.item.Idtarjeta=this.tarjeta.id!
    this.item.NombreTarjeta=this.tarjeta.nombreCSS!
    console.log(this.item)
    if(this.item.icono && this.item.itemname!="" || this.item.itemname!=null){
      
      if(!this.item.estadohistorial){
        this.item.diahistorial=0
      }

      if(this.Duplicado()){
            this.presentAlert("Ese nombre ya existe, intenta con uno diferente.");
            this.loading.dismiss();
            this.isLoading = false;
      }else{
        this.itemService.Create(this.item).then((res)=>{
          if(res.status===200){
            this.loading.dismiss();
            this.isLoading = false;
            this.presentAlert("Guardado correctamente");
            this.item = new Items()
            this.ngOnInit()
          }else{
            this.loading.dismiss();
            this.isLoading = false;
            this.presentAlert("Debes agregar un nombre");
          }
        })
      }
    }else{
      this.loading.dismiss();
      this.isLoading = false;
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
  }

//Verifica que no haya dos items iguales
Duplicado(){
 let duplicado=false

  this.items.forEach(item => {
    if(item.itemname==this.item.itemname){
        duplicado=true
    }
  });

  return duplicado;
}

//tour o guia
iniciarTour() {
  introJs()
    .setOptions({
      steps: [
        {
          element: '#nombreTarjeta',
          intro: 'Escribe aquí el nombre de tu nueva tarjeta.'
        },
        {
          element: '#icono',
          intro: 'Selecciona el ícono que mejor represente el propósito de tu tarjeta.'
        },
        {
          element: '#colorLetra',
          intro: 'Elige si quieres que el texto de tu tarjeta sea blanco o negro.'
        },
        {
          element: '#Historial',
          intro: 'Activa esta opción si deseas que el historial de la tarjeta se reinicie automáticamente cada primer día del mes.'
        },
        {
          element: '#colorTarjeta',
          intro: 'Selecciona el color de fondo que más te guste para tu tarjeta.'
        },
        {
          element: '#ListaOpciones',
          intro: 'Aquí puedes ver algunas plantillas de tarjetas que puedes usar como base.'
        },
        {
          element: '#Personalizacion',
          intro: 'Visualiza cómo se verá tu tarjeta con las opciones que vas eligiendo.'
        },
        {
          element: '#Guarde',
          intro: 'Cuando termines, haz clic aquí para guardar tu nueva tarjeta.'
        }
      ],
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Terminar',
    })
     .oncomplete(() => {
      // Guardar en localStorage que el tour fue completado
      localStorage.setItem('tourNuevaTarjeta', 'true');
    })
    .start();
}

}
