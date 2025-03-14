
import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  public url = environment.url

  constructor( private alertController: AlertController) { }

  async presentAlert(msn: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: '' + msn,
      buttons: ['ACEPTAR'],
    });
    await alert.present();
  }

  async enviarCorreo(destinatario: string, codigo: number, nombre: string) {
    const cuerpo = `
      <p>Señor (a): ${nombre}</p>
      <p>Apreciado (a) Usuario,</p>
      <p>Atentamente nos permitimos comunicarle que el código que haz solicitado es el siguiente:</p>
      <ul>
        <li>Código: ${codigo} </li>
      </ul>
      <p>Respetado usuario, este correo ha sido generado por un sistema de envío; por favor NO responda al mismo ya que no podrá ser gestionado.</p>
      <p>Le recordamos que los canales de atención son los siguientes:</p>
      <ul>
        <li>CORREO DE ATENCIÓN  Softk0131@hotmail.com</li>
      </ul>
    `;

    const email = {
      destinatario: destinatario,
      asunto: 'SoftK. Codigo de seguridad',
      cuerpo: cuerpo,
      isHtml: true
    };
    // Envía el correo electrónico utilizando el complemento EmailComposer
    const options = {
      url: this.url+'/send-email',
      headers: { "Content-Type": "application/json" },
      data: email
      };

    const response: HttpResponse = await CapacitorHttp.post(options);
  }
}
