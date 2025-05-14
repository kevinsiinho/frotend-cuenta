import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Depositos } from 'src/app/clases/Items/depositos';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DepositosService {

  public deposito= new Depositos();
  public depositos:Depositos[]=[];

  public url = environment.url;

  constructor() { }

  async Create(deposito:Depositos){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/depositos',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data: deposito
      };
    const response: HttpResponse = await CapacitorHttp.post(options);
    return response
  };


  async alldepositos(id:string){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/depositos?filter=%7B%0A%20%20%0A%20%20%22where%22%3A%20%7B%0A%20%20%20%20%22idItem%22%3A%22'+id+'%22%0A%20%20%7D%0A%7D',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

const response: HttpResponse = await CapacitorHttp.get(options);
 return response.data;
}

  async alldepositosIDBolsillo(id:string){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/depositos?filter=%7B%0A%20%20%0A%20%20%22where%22%3A%20%7B%0A%20%20%20%20%22idBolsillo%22%3A%22'+id+'%22%0A%20%20%7D%0A%7D',
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
      url: this.url+'/depositos/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);

     return response.data
  }

  async Update(deposito:Depositos){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/items/'+deposito.id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data:deposito
    };
  const response: HttpResponse = await CapacitorHttp.put(options);

        return response.status;
  }

  async Delete(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/depositos/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };
}
