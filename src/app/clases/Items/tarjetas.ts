import { Depositos } from "./depositos";

export class Tarjetas {
  nombre!:string;
  subtotal!:number;
  color!:string;
  depositos?:Depositos[]=[];
  Vinicial?:boolean=false
  Valor?:number
  setValues(item:any){
    this.nombre=item.nombre;
    this.subtotal=item.subtotal;
    this.depositos=item.depositos;
    this.color=item.color;
    this.Vinicial=item.Vinicial;
    this.Valor=item.Valor
  }

}

