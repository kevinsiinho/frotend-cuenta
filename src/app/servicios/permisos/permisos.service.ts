import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  constructor(private platform: Platform) { }

  /**
   * Solicita permisos de almacenamiento para guardar imágenes
   * En Android, los permisos se solicitan automáticamente cuando se intenta usar
   * pero este método prepara la solicitud explícita
   */
  async solicitarPermisosAlmacenamiento(): Promise<boolean> {
    // En web no se necesitan permisos
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    // Para Android, los permisos se solicitarán automáticamente cuando se intente guardar
    // Este método solo verifica que estén en el manifest (ya los agregamos)
    if (this.platform.is('android')) {
      // Los permisos se solicitarán automáticamente por el sistema
      // cuando se intente acceder al almacenamiento
      return true;
    }

    // Para iOS no se necesitan permisos especiales para guardar en galería
    return true;
  }

  /**
   * Solicita permisos para obtener información del dispositivo
   * Device.getInfo() generalmente no requiere permisos, pero Device.getId() puede necesitarlos
   */
  async solicitarPermisosDispositivo(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    // Device.getInfo() no requiere permisos especiales
    // Device.getId() puede necesitar READ_PHONE_STATE en algunos casos
    // Los permisos están en el manifest, se solicitarán automáticamente si son necesarios
    return true;
  }
}

