export class User {
  public id?:string
  public name!:string
  public nickname!:string
  public email!:string
  public password:string=""
  public estado!:string
  public cel!:number
  public codigo?:number
  public ultimaVez?:string
  create?:Date
  updated?:Date
  SetValues(item:any){
    this.id=item.id
    this.name=item.nombre
    this.nickname=item.apellidos
    this.email=item.email
    this.password=item.password
    this.cel=item.cel
    this.estado=item.estado
    this.codigo=item.codigo
    this.ultimaVez=item.ultimaVez
    this.create=item.create
    this.updated=item.updated
  }
}
