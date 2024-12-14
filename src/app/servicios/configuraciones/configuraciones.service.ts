import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { InfoDevice } from 'src/app/clases/device/device';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {

public InfoCel=new InfoDevice()
public url = environment.url

constructor() { }

  async getDeviceInfo() {
    this.InfoCel = await Device.getInfo(); // Obtiene información básica del dispositivo
    const deviceIdResponse = await Device.getId(); // Devuelve un objeto
    this.InfoCel.id = deviceIdResponse.identifier; // Extrae la propiedad `identifier`
    console.log(this.InfoCel)

    return this.InfoCel
  }

  async Create(infoDevice:InfoDevice){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/devices',
      headers: {
         "Content-Type": "application/json",
         "Authorization": 'Bearer ' + value,
      },
      data: infoDevice
      };
    const response: HttpResponse = await CapacitorHttp.post(options);
    return response
  };

  async Update(infoDevice:InfoDevice){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/devices/'+infoDevice.id,
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + value,
      },
      data:infoDevice
    };
  const response: HttpResponse = await CapacitorHttp.put(options);
        return response.status;
  }

  async Delete(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/devices/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };

  async Get(id: string) {
    try {
      const { value } = await Preferences.get({ key: 'token' });
      const options = {
        url: this.url + '/devices/' + id,
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + value,
        },
      };

      const response: HttpResponse = await CapacitorHttp.get(options)
       // Revisar manualmente si la respuesta contiene un error
        if (response.data && response.data.error) {
          const error = response.data.error;
          if (error.statusCode === 404) {
            return 0; // Devuelve 0 si el código de estado es 404
          }
          // Si no es un error esperado, lanzar el error
          throw new Error(error.message || 'Error desconocido');
        }
      return response.data;


    } catch (error) {
      console.log(error)
      throw error;
    }
  }

   async Gets(id:string){
      const { value } = await Preferences.get({ key: 'token' });
      const options = {
        url: this.url+'/devices?filter=%7B%0A%20%20%0A%20%20%22where%22%3A%20%7B%0A%20%20%20%20%22IdUser%22%3A%22'+id+'%22%0A%20%20%7D%0A%7D',
        headers: { "Content-Type": "application/json",
        "Authorization": 'Bearer ' + value
        },
      };

    const response: HttpResponse = await CapacitorHttp.get(options);
    return response.data;
  }

}
