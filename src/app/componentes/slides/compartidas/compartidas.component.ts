import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Items } from 'src/app/clases/Items/items';
import tinycolor from 'tinycolor2';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';
import { UserService } from 'src/app/servicios/user/user.service';
import { Notas } from 'src/app/clases/notas/notas';
import { debounceTime, Subject } from 'rxjs';
import { ItemsNotas } from 'src/app/clases/notas/items';
import { NotasService } from 'src/app/servicios/notas/notas.service';
import { AlertController } from '@ionic/angular';

register();
@Component({
  selector: 'app-compartidas',
  templateUrl: './compartidas.component.html',
  styleUrls: ['./compartidas.component.scss'],
})
export class CompartidasComponent   {

    @Input() items2: Items[] = [];
    items:Items[]=[]
    isModalOpen = false;
    isModalOpen2 = false;
    public UpdateList= new Notas()
    public UpdateNote= new Notas()
    private cambiosTextoMap = new Map<string, Subject<any>>();
    private timeoutGuardar: any;
    public Acitem= new ItemsNotas()
    public Notasitems= new ItemsNotas()
    public notaitem= new ItemsNotas()
    public nota= new Notas()
    @Input() notas: Notas[] = [];

    @ViewChild ( 'swiper' )
  swiperRef : ElementRef | undefined ;
  swiper?: Swiper ;

  constructor(
    public userService:UserService,
    public link:Router,
    public notaServices:NotasService,
    public alertController: AlertController
) { }



setOpen(isOpen: boolean,tipo:string) {
  this.isModalOpen = isOpen;
}

setOpen2(isOpen2: boolean) {
  this.isModalOpen2 = isOpen2;
  console.log("Creando una nota")
}

async presentAlert(msn:String) {
  const alert = await this.alertController.create({
    header: 'Mensaje',
    message: ''+msn,
    buttons: ['OK'],
  });
  await alert.present();
}


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
         }
      }
  }

  Ruta(id:string){
    this.link.navigate(['/tabs/tab2/tarjeta/',id])
  }

   formatNumberMil(value: number | undefined | null): string {
    if (typeof value !== 'number') return '0';
    return value.toLocaleString();
  }


   guardarNota() {
     clearTimeout(this.timeoutGuardar); // Borra el temporizador anterior
     this.timeoutGuardar = setTimeout(() => {
       if(this.nota.texto!.length>0){
         this.UpdateNote.reciente= new Date()
         this.notaServices.Update(this.UpdateNote).then((res)=>{
           if(res!==204){
             console.log("Error en el servidor")
           }
         })
       }
     }, 1000); // Espera 1 segundo antes de guardar
   }

 VerNota(isOpen2: boolean,nota:Notas) {
   this.isModalOpen2 = isOpen2;
   this.UpdateNote=nota
   clearTimeout(this.timeoutGuardar); // Borra el temporizador anterior

   this.timeoutGuardar = setTimeout(() => {
       this.UpdateNote.reciente= new Date()
       if(this.UpdateNote.titulo=="" || this.UpdateNote.titulo==null || this.UpdateNote.titulo==undefined){
         this.UpdateNote.titulo="Sin título"
       }

       this.notaServices.Update(this.UpdateNote).then((res)=>{
         if(res!==204){
           console.log("Error en el servidor")
         }
       })
   }, 1000); // Espera 1.5 segundo antes de guardar
   console.log(this.UpdateNote)
 }

 Verlista(isOpen: boolean,nota:Notas){
   this.isModalOpen = isOpen;
   this.UpdateList=nota
 }

 ActualizarItem() {
   this.UpdateList.reciente= new Date()
     if(this.UpdateList.tipo=="lista"){
       this.Acitem.estado=false
       if(this.UpdateList.titulo=="" || this.UpdateList.titulo==null ){
         this.presentAlert("El título es obligatorio.")
       }else{
         if(this.Acitem.texto=="" || this.Acitem.texto==undefined){

         }else{
           this.UpdateList.items!.push(this.Acitem)
            //Actualizar la listas
             this.notaServices.Update(this.UpdateList).then((res)=>{
               if(res===204){
               this.Acitem=new ItemsNotas()
               }
             })

         }
     }
     }
   }

   // Método que se ejecuta cuando cambia el texto de un item
   actualizarItemConRetraso(item: any) {
     if (!this.cambiosTextoMap.has(item.id)) {
       this.cambiosTextoMap.set(item.id, new Subject<any>());
       this.cambiosTextoMap.get(item.id)!.pipe(debounceTime(1000)).subscribe((itemActualizado) => {
         this.notaServices.Update(this.UpdateList).then((res)=>{
           if(res!==204){

           }
         })
       });
     }
     this.cambiosTextoMap.get(item.id)!.next(item);
   }

 Eliminar(id:string){
   this.notaServices.Delete(id).then((res)=>{
     if(res==204){
     this.notas = this.notas.filter(nota => nota.id !== id);
     }
   })

 }

 EliminarItem(index: number) {
   this.UpdateList.items!.splice(index, 1);
   this.cambiosTextoMap.delete(index.toString());
   this.notaServices.Update(this.UpdateList).then((res)=>{
     if(res!==204){

     }
   })
 }

 CambioEstado(index:number,estado:boolean){
   this.UpdateList.items!.forEach((item:ItemsNotas,i) => {
       if(i===index){
         this.UpdateList.items![i].estado=estado
         this.notaServices.Update(this.UpdateList)
       }
   });
 }


 LinkCompartir(id:string){
   console.log("compartir"+id)
   this.link.navigate(['compartir/',id])
 }

}
