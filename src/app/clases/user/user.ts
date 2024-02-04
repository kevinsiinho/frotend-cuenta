export class User {
  public id?:string
  public name!:string
  public nickname!:string
  public email!:string
  public password:string=""
  public estado!:string
  SetValues(item:any){
    this.id=item.id
    this.name=item.nombre
    this.nickname=item.apellidos
    this.email=item.email
    this.password=item.password
    this.estado=item.estado
  }
}
