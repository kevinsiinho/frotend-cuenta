export class Depositos {
  valor!:number;
  fecha!:string;
  comentario?:string
  email?:string
  setValues(item:any){
    this.valor=item.valor;
    this.fecha=item.fecha;
    this.comentario=item.comentario;
    this.email=item.email
  }
}
