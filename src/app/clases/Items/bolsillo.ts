import { Depositos } from "./depositos";

export class Bolsillo {
    id?:string
    posicion!:number
    nombre!:string;
    subtotal!:number;
    color!:string;
    Vinicial?:boolean=false
    valor?:number
    creado?:Date
    idItem!:string
    idCreador!:string
    estado?:string
    depositos?:Depositos[]
    setValues(item:any){
      this.id=item.id
      this.posicion=item.posicion
      this.nombre=item.nombre;
      this.subtotal=item.subtotal;
      this.color=item.color;
      this.Vinicial=item.Vinicial;
      this.valor=item.valor
      this.creado=item.creado
      this.idItem=item.idItem
      this.idCreador=item.idCreador
      this.estado=item.estado
      this.Vinicial=item.Vinicial
      this.depositos=item.depositos
    }
}
