import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { AlertController, LoadingController } from '@ionic/angular';
import { Login } from 'src/app/clases/login/login';
import { User } from 'src/app/clases/user/user';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  public url = environment.url
  public users:User[]=[];
  public user= new User()
  constructor(
    public link:Router,
    private alertController: AlertController,
    ) { }

    async presentAlert(msn:String) {

      const alert = await this.alertController.create({
        header: 'Mensaje',
        message: ''+msn,
        buttons: ['ACEPTAR'],
      });
      await alert.present();
    }

/*
  async alluser():Promise<any>{
    this.users=[]
    const options = {
      url: this.url+'/signup'
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
    console.log(response.data)
        response.data.forEach((item:any)=> {
          this.user=new User();
          this.user.SetValues(item)
          this.users.push(this.user)
        });
        return this.users
  }
*/

async Login(login:Login){
    const options = {
      url: this.url+'/users/login/',
      headers: { "Content-Type": "application/json" },
      data: login
    };

  const response: HttpResponse = await CapacitorHttp.post(options);
   return response
  }

  async Quien(token:string){
    const options = {
      url: this.url+'/whoAmI',
      headers: { "Content-Type": "application/json",
                  "Authorization": 'Bearer ' + token
               }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
   return response
  }

  async Create(user:User){
    const options = {
      url: this.url+'/signup',
      headers: { "Content-Type": "application/json" },
      data: user
      };
    const response: HttpResponse = await CapacitorHttp.post(options);
    return response
  };

  async Update(user:User){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/user/'+user.id,
      headers: { "Content-Type": "application/json"
      },
      data:user
    };
  const response: HttpResponse = await CapacitorHttp.put(options);
        return response.status;
  }

  async UpdatePassword(id:string, password:string){

    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/user/'+id+"/password",
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data:{password:password}
    };
        const response: HttpResponse = await CapacitorHttp.put(options);
        return response.status;
  }

  async DeleteUser(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/user/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };

  async DeletePassword(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/user/credenciales/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };

  async InfoUser(id:string){
    const options = {
      url: this.url+'/whoAmI/'+id,
      headers: { "Content-Type": "application/json"
      }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
  return response.data
  }

  //mejorar esto
  async Verificar(){
    const { value } = await Preferences.get({ key: 'token' });

   try {
    const options = {
      url: this.url+'/whoAmI',
      headers: { "Content-Type": "application/json",
                  "Authorization": 'Bearer ' + value
               }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);

  if(response.status===401){
    this.link.navigate(['login'])
    return false
  }else{
    let valor=false
    return  this.InfoUser(response.data).then((user)=>{
      if(user.estado=="Activo"){
        valor=true
      }else if(user.estado=="verificar"){
        this.link.navigate(['/codigo/'+user.id])
      }else{
        this.link.navigate(['login'])
        valor= false
      }
      return valor
    })


  }

   } catch (error) {
    this.link.navigate(['login'])
    this.presentAlert("Error en el servidor intenta más tarde")
    return false
   }

};

    async buscar(event:string){
      const query = event;
      //event.target.value
      const { value } = await Preferences.get({ key: 'token' });
      const options = {
        url: this.url+'/users/search?query='+query,
        headers: { "Content-Type": "application/json",
        "Authorization": 'Bearer ' + value
        }
      };

    const response: HttpResponse = await CapacitorHttp.get(options);
    return response.data
    }
}
