import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Notas } from 'src/app/clases/notas/notas';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UserService } from 'src/app/servicios/user/user.service';
import { User } from 'src/app/clases/user/user';
import { AlertController, IonModal } from '@ionic/angular';
import { Router } from '@angular/router';
import { ItemsNotas } from 'src/app/clases/notas/items';
import { NotasService } from 'src/app/servicios/notas/notas.service';


@Component({
  selector: 'app-notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss'],
})
export class NotasComponent {

  @Input() notas: Notas[] = [];
  public nota= new Notas()
  public UpdateList= new Notas()
  public UpdateNote= new Notas()
  public items:ItemsNotas[]=[]
  public item= new ItemsNotas()
  public Acitem= new ItemsNotas()
  @Input() user = new User()
  isModalOpen = false;
  isModalOpen2 = false;
  private cambiosTextoMap = new Map<string, Subject<any>>();
  public tipo!:string
  public Lactualizar:boolean=false
  public Lregistrar:boolean=false
  public Nactualizar:boolean=false
  public Nregistrar:boolean=false
  private timeoutGuardar: any;

//modal ItemsNotas o lista
  setOpen(isOpen: boolean,tipo:string) {
    this.isModalOpen = isOpen;
    this.nota.tipo=tipo
    this.Lregistrar=true
    this.Lactualizar=false
  }

  setOpen2(isOpen2: boolean) {
    this.isModalOpen2 = isOpen2;
    this.nota.userId=this.user.id!
    this.Nregistrar=true
    this.Nactualizar=false
  }

  constructor(
    public notaServices:NotasService,
    public userService:UserService,
    public link:Router,
    private alertController: AlertController,
  ) {}

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }

guardarNota() {
  clearTimeout(this.timeoutGuardar); // Borra el temporizador anterior
  this.timeoutGuardar = setTimeout(() => {
    if(this.nota.texto!.length>0 && this.nota.id==undefined){

      this.nota.tipo="nota"
      this.nota.userId=this.user.id!
      this.nota.creado= new Date()
      if(this.nota.titulo=="" || this.nota.titulo==null || this.nota.titulo==undefined){
        this.nota.titulo="Sin título"
      }
      this.notaServices.Create(this.nota).then((res)=>{
        if(res.status==200){
          this.nota.id=res.data.id
          this.Nregistrar=false
          this.Nactualizar=true
          this.UpdateNote=res.data
        }
      })

    }else if(this.UpdateNote.id!=undefined){
      this.UpdateNote.reciente= new Date()
      this.notaServices.Update(this.UpdateNote).then((res)=>{
        if(res!==204){
          this.presentAlert("Error en el servidor")
        }
      })
    }
  }, 1000); // Espera 1 segundo antes de guardar
}

VerNota(isOpen2: boolean,nota:Notas) {
  this.isModalOpen2 = isOpen2;
  this.Nregistrar=false
  this.Nactualizar=true
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
  this.Lactualizar=true
  this.Lregistrar=false
  this.UpdateList=nota
}

agregarItem() {
  this.item.estado=false
  this.nota.userId=this.user.id!
  this.nota.creado= new Date()
  if(this.nota.tipo=="lista"){
    if(this.nota.id==undefined){
      this.nota.items!.push(this.item)
      if(this.nota.titulo=="" || this.nota.titulo==null ){
          this.presentAlert("El título es obligatorio.")
        }else{
          if(this.item.texto!=""){
          this.item=new ItemsNotas()
          this.notaServices.Create(this.nota).then((res)=>{
            if(res.status==200){
              this.notas.push(res.data)
              this.UpdateList=res.data
              this.Lregistrar=false
              this.Lactualizar=true
              this.item=new ItemsNotas()
            }
          })
        }
      }
    }
}

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

async ngOnChanges(changes: SimpleChanges) {
  this.nota.userId=this.user.id!
  this.notas
  if (changes['notas'] && changes['notas'].currentValue) {
      console.log('Notas:', changes['notas'].currentValue);
      }
  }
}
