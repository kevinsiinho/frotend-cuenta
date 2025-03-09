import { Compartir } from "../compartir/compartir";
import { Tarjetas } from "./tarjetas";

export class Items {
    id?:string;
    itemname!: string;
    total!: number;
    estado!: boolean;
    favorito!: boolean;
    tarjetas:Tarjetas[]=[];
    compartir:Compartir[]=[]
    userId!: string
    fecha?:string
    updated?:Date
    reciente?:Date
    icono!:string
    colorLetra?:string
    Idtarjeta!:string
    NombreTarjeta!:string
    ColorFondo?:string
    setValues(item:any){
      this.id=item.id;
      this.itemname=item.itemname;
      this.total=item.total;
      this.estado=item.estado;
      this.favorito=item.favorito;
      this.tarjetas=item.tarjetas;
      this.compartir=item.compartir;
      this.userId= item.userId;
      this.fecha=item.fecha
      this.updated=item.updated
      this.reciente=item.reciente
      this.colorLetra=item.colorLetra
      this.icono=item.icono
      this.Idtarjeta=item.Idtarjeta
      this.NombreTarjeta=item.NombreTarjeta
      this.ColorFondo=item.ColorFondo

    }
}
