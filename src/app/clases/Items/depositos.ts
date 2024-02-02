export class Depositos {
  valor!:number;
  fecha!:string;
  setValues(item:any){
    this.valor=item.valor;
    this.fecha=item.fecha;
  }
}
