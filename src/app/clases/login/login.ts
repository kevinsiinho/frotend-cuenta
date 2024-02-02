export class Login {
  email!:string
  password!:string

  SetValues(item:any){
    this.email=item.email
    this.password=item.password
  }
}
