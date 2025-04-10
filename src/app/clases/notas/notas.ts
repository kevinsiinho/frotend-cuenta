import { Compartir } from "../compartir/compartir";
import { ItemsNotas } from "./items";

export class Notas {
  id?:string;
  titulo!: string;
  favorito!: boolean;
  compartir:Compartir[]=[]
  items?:ItemsNotas[]=[]
  texto?:string
  userId!: string
  creado?:Date
  updated?:Date
  reciente?:Date
  tipo!:string
  setValues(item:any){
    this.id=item.id;
    this.titulo=item.titulo;
    this.favorito=item.favorito;
    this.compartir=item.compartir;
    this.items=item.items
    this.userId= item.userId;
    this.updated=item.updated
    this.reciente=item.reciente
    this.tipo=item.tipo
  }
}
