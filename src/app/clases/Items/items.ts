import { Compartir } from "../compartir/compartir";
import { Bolsillo } from "./bolsillo";
import { Historial } from "./historial";
import { Tarjetas } from "./tarjetas";

export class Items {
    id?:string;
    itemname!: string;
    total!: number;
    estado!: boolean;
    favorito!: boolean;
    tarjetas:Tarjetas[]=[];
    bolsillos?:Bolsillo[]
    compartir:Compartir[]=[]
    historial:Historial[]=[]
    estadohistorial?:boolean
    diahistorial:number=1
    realizado=false
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
      this.bolsillos=item.bolsillos
      this.historial=item.historial
      this.estadohistorial=item.estadohistorial
      this.diahistorial=item.diahistorial
      this.realizado=item.realizado
    }
}
