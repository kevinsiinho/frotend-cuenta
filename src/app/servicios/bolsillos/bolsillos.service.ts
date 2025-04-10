import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Bolsillo } from 'src/app/clases/Items/bolsillo';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BolsillosService {

  public bolsillo= new Bolsillo();
  public bolsillos:Bolsillo[]=[];

  public url = environment.url;

  constructor() { }

  async Create(bolsillo:Bolsillo){

    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/bolsillos',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data: bolsillo
      };
    const response: HttpResponse = await CapacitorHttp.post(options);
    return response
  };

  async allbolsillo(id:string){
      const { value } = await Preferences.get({ key: 'token' });
      const options = {
        url: this.url+'/bolsillos?filter=%7B%0A%20%20%0A%20%20%22where%22%3A%20%7B%0A%20%20%20%20%22idItem%22%3A%22'+id+'%22%0A%20%20%7D%0A%7D',
        headers: { "Content-Type": "application/json",
        "Authorization": 'Bearer ' + value
        },
      };

 const response: HttpResponse = await CapacitorHttp.get(options);
   return response.data;
}

  async GetItem(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/bolsillos/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);

     return response.data
  }

  async Update(bolsillo:Bolsillo){
    const { value } = await Preferences.get({ key: 'token' });
    const bolsillo2 = { ...bolsillo };
    delete bolsillo2.depositos;

    const options = {
      url: this.url+'/bolsillos/'+bolsillo.id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data:bolsillo2
    };
  const response: HttpResponse = await CapacitorHttp.put(options);

        return response.status;
  }

  async Delete(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/bolsillos/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };
}
