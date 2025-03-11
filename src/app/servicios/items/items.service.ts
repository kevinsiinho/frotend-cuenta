import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Observable, Subject } from 'rxjs';
import { Items } from 'src/app/clases/Items/items';
import { Tarjetas } from 'src/app/clases/Items/tarjetas';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  public item= new Items();
  public items:Items[]=[];
  public url = environment.url;
  public items$= new Subject<Items[]>();
  public item$= new Subject <Items>();

  allItems$():Observable<Items[]>{
    return this.items$.asObservable();
  }
  getItems$():Observable<Items>{
    return this.item$.asObservable();
  }
  constructor() { }

  async Create(item:Items){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/items',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data: item
      };
    const response: HttpResponse = await CapacitorHttp.post(options);
    return response
  };

  async allitems(id:string){
    const { value } = await Preferences.get({ key: 'token' });
    this.items=[]
    const options = {
      url: this.url+'/items?filter=%7B%0A%20%20%0A%20%20%22where%22%3A%20%7B%0A%20%20%20%20%22userId%22%3A%22'+id+'%22%0A%20%20%7D%0A%7D',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
        response.data.forEach((item:any)=> {
          this.item=new Items();
          this.item.setValues(item)
          this.items.push(this.item)
        });
        this.items$.next(this.items)
        return this.items;
  }


/*Codigo temporal borrar luego de una vez*/
  async all(){
    const { value } = await Preferences.get({ key: 'token' });
    this.items=[]
    const options = {
      url: this.url+'/items',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
  response.data.forEach((element:Items) => {

    if(element.NombreTarjeta=="" || element.NombreTarjeta==null || element.NombreTarjeta==undefined){
      element.tarjetas.forEach((tarjeta:Tarjetas) => {
        tarjeta.color="#1E88E5"
      });
      element.colorLetra="white"
      element.ColorFondo="#1E88E5"
      element.icono="card"
      element.NombreTarjeta="principal-dinamica"
      element.Idtarjeta="67bfd3c2f9827620d8f22395"
      console.log(element)

    }
    this.Update(element)
  });

  }
  async compartidos(id:string){
    const { value } = await Preferences.get({ key: 'token' });
    this.items=[]
    const options = {
      url: this.url+'/items?filter=%7B%0A%20%20%0A%20%20%20%20%22where%22%3A%20%7B%0A%20%20%20%20%20%20%22compartir.iduser%22%3A%20%22'+id+'%22%0A%20%20%20%20%7D%0A%20%20%7D',
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
    };

  const response: HttpResponse = await CapacitorHttp.get(options);
        response.data.forEach((item:any)=> {
          this.item=new Items();
          this.item.setValues(item)
          this.items.push(this.item)
        });
        this.items$.next(this.items)
        return this.items;
  }


  async GetItem(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/items/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      }
    };

  const response: HttpResponse = await CapacitorHttp.get(options);

          this.item=new Items();
          this.item.setValues(response.data)
        return this.item
  }

  async Update(item:Items){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/items/'+item.id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      data:item
    };
  const response: HttpResponse = await CapacitorHttp.put(options);
         this.item$.next(response.data)
        return response.status;
  }


  async Delete(id:String){
    const { value } = await Preferences.get({ key: 'token' });
    const options = {
      url: this.url+'/items/'+id,
      headers: { "Content-Type": "application/json",
      "Authorization": 'Bearer ' + value
      },
      };
    const response: HttpResponse = await CapacitorHttp.delete(options);
    return response.status
  };

}
