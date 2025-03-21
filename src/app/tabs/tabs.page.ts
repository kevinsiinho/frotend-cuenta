import { Component, OnInit } from '@angular/core';
import { User } from '../clases/user/user';
import { UserService } from '../servicios/user/user.service';
import { Preferences } from '@capacitor/preferences';
import { ConfiguracionesService } from '../servicios/configuraciones/configuraciones.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public configuracioneService:ConfiguracionesService){}

  async onTabChange() {
    this.configuracioneService.UltimaVez()
  }


}
