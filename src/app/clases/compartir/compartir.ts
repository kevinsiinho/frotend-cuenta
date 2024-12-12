export class Compartir {
  public iduser?:string
  public email?:string
  public estado?:boolean
  public nombre?:string
  public visto?:boolean //para notificaciones
  public Estadonotifacion?:boolean
  setValues(item:any){
    this.iduser=item.iduser
    this.email=item.email
    this.estado=item.estado
    this.nombre=item.nombre
    this.visto=item.visto
    this.Estadonotifacion=item.Estadonotifacion
  }
}
