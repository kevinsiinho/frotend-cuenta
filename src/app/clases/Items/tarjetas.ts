import { Depositos } from "./depositos";

export class Tarjetas {
  nombre!:string;
  subtotal!:number;
  color!:string;
  depositos?:Depositos[]=[];
  setValues(item:any){
    this.nombre=item.nombre;
    this.subtotal=item.subtotal;
    this.depositos=item.depositos;
    this.color=item.color;
  }

}

