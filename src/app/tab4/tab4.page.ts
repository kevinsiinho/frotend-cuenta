import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  constructor(
    public link:Router,
  ) { }

  ngOnInit() {
    console.log("poner observables")
  }

  Ruta(id:string){
    this.link.navigate(['notificaciones/',id])
  }

}
