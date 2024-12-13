import { Depositos } from "./depositos";

export class Tarjetas {
  posicion!:number
  nombre!:string;
  subtotal!:number;
  color!:string;
  depositos?:Depositos[]=[];
  Vinicial?:boolean=false
  Valor?:number
  setValues(item:any){
    this.posicion=item.posicion
    this.nombre=item.nombre;
    this.subtotal=item.subtotal;
    this.depositos=item.depositos;
    this.color=item.color;
    this.Vinicial=item.Vinicial;
    this.Valor=item.Valor
  }

}

