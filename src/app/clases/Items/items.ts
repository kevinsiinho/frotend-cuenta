import { Compartir } from "../compartir/compartir";
import { Tarjetas } from "./tarjetas";

export class Items {
    id?:string;
    itemname!: string;
    total!: number;
    color!: string;
    estado!: boolean;
    favorito!: boolean;
    tarjetas:Tarjetas[]=[];
    compartir:Compartir[]=[]
    userId!: string
    fecha?:string
    create?:Date
    updated?:Date
    setValues(item:any){
      this.id=item.id;
      this.itemname=item.itemname;
      this.total=item.total;
      this.color=item.color;
      this.estado=item.estado;
      this.favorito=item.favorito;
      this.tarjetas=item.tarjetas;
      this.compartir=item.compartir;
      this.userId= item.userId;
      this.fecha=item.fecha
      this.create=item.create
      this.updated=item.updated
    }
}
