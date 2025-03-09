import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Tarjetas } from 'src/app/clases/tarjetas/tarjetas';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {
  public tarjeta= new Tarjetas();
  public tarjetas:Tarjetas[]=[];
  public url = environment.url;

  constructor() { }

  async allTarjetas(){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/diseno-tarjetas',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

    const response: HttpResponse = await CapacitorHttp.get(options);
    return response.data
  }

  async GetItem(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/diseno-tarjetas'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      }
    };

    const response: HttpResponse = await CapacitorHttp.get(options);
    return response.data
  }
}
