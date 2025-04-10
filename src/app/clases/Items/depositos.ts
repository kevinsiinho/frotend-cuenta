export class Depositos {
  valor!:number;
  fecha?:string;
  comentario?:string
  email?:string
  idBolsillo?:string
  idCreador?:string
  idItem?: string;
  id?:string
  creado?:Date
  estado?:string
  setValues(item:any){
    this.valor=item.valor;
    this.fecha=item.fecha;
    this.comentario=item.comentario;
    this.email=item.email
    this.idBolsillo=item.idBolsillo
    this.idCreador=item.idCreador
    this.id=item.id
    this.creado=item.creado
    this.estado=item.estado
  }
}
