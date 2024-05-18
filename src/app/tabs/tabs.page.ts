import { Component, OnInit } from '@angular/core';
import { User } from '../clases/user/user';
import { UserService } from '../servicios/user/user.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
}
