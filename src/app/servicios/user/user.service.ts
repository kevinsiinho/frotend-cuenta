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

  async alluser():Promise<any>{
    this.users=[]
    const options = {
      url: this.url+'/users',
    };

  const response: HttpResponse = await CapacitorHttp.get(options);

        return response.data
  }


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
    const { value } = await Preferences.get({ key: 'token' });
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

async Verificar() {
  const { value } = await Preferences.get({ key: 'token' });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("timeout"));
    }, 60000); // 60,000 milisegundos = 1 minuto
  });

  const requestPromise = (async () => {
    const options = {
      url: this.url + '/whoAmI',
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + value
      }
    };

    const response: HttpResponse = await CapacitorHttp.get(options);

    if (response.status === 401) {
      this.presentAlert("La sesión ha expirado, intenta iniciar sesión nuevamente");
      this.link.navigate(['login']);
      return false;
    } else {
      const user = await this.InfoUser(response.data);
      if (user.estado === "Activo") {
        return true;
      } else if (user.estado === "verificar") {
        this.link.navigate(['/codigo/' + user.id]);
        return false;
      } else {
        this.link.navigate(['login']);
        return false;
      }
    }
  })();
try {
  return await Promise.race([requestPromise, timeoutPromise]);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage === "timeout") {
    this.presentAlert("Tiempo de espera agotado. Intenta iniciar sesión nuevamente.");
  } else {
    this.presentAlert("Error en el servidor. Intenta más tarde.");
  }

  this.link.navigate(['login']);
  return false;
  }
}

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
    return response.data}
}
