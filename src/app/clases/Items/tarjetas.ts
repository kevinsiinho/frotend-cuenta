import { Depositos } from "./depositos";

export class Tarjetas {
  id?:string
  posicion!:number
  nombre!:string;
  subtotal!:number;
  color!:string;
  depositos?:Depositos[]=[];
  Vinicial?:boolean=false
  Valor?:number
  creado?:Date
  idItem?:string
  idCreador?:string
  estado?:string
  setValues(item:any){
    this.id=item.id
    this.posicion=item.posicion
    this.nombre=item.nombre;
    this.subtotal=item.subtotal;
    this.color=item.color;
    this.Vinicial=item.Vinicial;
    this.Valor=item.Valor
    this.creado=item.creado
    this.idItem=item.idItem
    this.idCreador=item.idCreador
    this.estado=item.estado
    this.Vinicial=item.Vinicial
  }
}

