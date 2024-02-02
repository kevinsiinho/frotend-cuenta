export class User {
  public id?:string
  public name!:String
  public nickname!:String
  public email!:String
  public password:String=""

  SetValues(item:any){
    this.id=item.id
    this.name=item.nombre
    this.nickname=item.apellidos
    this.email=item.email
    this.password=item.password
  }
}
