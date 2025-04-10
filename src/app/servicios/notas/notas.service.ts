import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Notas } from 'src/app/clases/notas/notas';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class NotasService {

  public item= new Notas();
  public notas:Notas[]=[];
  public url = environment.url;

  constructor() { }

  async Create(nota:Notas){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/notas',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data: nota
      };
    const response: HttpResponse = await CapacitorHttp.post(options);
    return response
  };

  async allnotas(id:string){
    const { value } = await Preferences.get({ key: 'token' });
    this.notas=[]
    const options = {
      url: this.url+'/notas?filter=%7B%0A%20%20%0A%20%20%22where%22%3A%20%7B%0A%20%20%20%20%22userId%22%3A%22'+id+'%22%0A%20%20%7D%0A%7D',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
   return response.data;
  }

  async compartidos(id:string){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/notas?filter=%7B%0A%20%20%0A%20%20%20%20%22where%22%3A%20%7B%0A%20%20%20%20%20%20%22compartir.iduser%22%3A%20%22'+id+'%22%0A%20%20%20%20%7D%0A%20%20%7D',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
    return response;
  }


  async GetItem(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/notas/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
  return response.data
  }

  async Update(nota:Notas){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/notas/'+nota.id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data:nota
    };
  const response: HttpResponse = await CapacitorHttp.put(options);
      return response.status;
  }


  async Delete(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/notas/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };

}
