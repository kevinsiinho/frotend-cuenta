import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Observable, Subject } from 'rxjs';
import { Items } from 'src/app/clases/Items/items';
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
    return response.status
  };

  async allitems(){
    const { value } = await Preferences.get({ key: 'token' });
    this.items=[]
    const options = {
      url: this.url+'/items',
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
