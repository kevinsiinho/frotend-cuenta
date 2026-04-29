import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, IonModal, LoadingController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { Depositos } from 'src/app/clases/Items/depositos';
import { Items } from 'src/app/clases/Items/items';
import { UserService } from 'src/app/servicios/user/user.service';
import html2canvas from 'html2canvas';
import { Preferences } from '@capacitor/preferences';
import { Compartir } from 'src/app/clases/compartir/compartir';
import { User } from 'src/app/clases/user/user';
import { ItemReorderEventDetail } from '@ionic/angular';
import { ItemsService } from 'src/app/servicios/items/items.service';
import { BolsillosService } from 'src/app/servicios/bolsillos/bolsillos.service';
import { Bolsillo } from 'src/app/clases/Items/bolsillo';
import { DepositosService } from 'src/app/servicios/depositos/depositos.service';
import { HistorialMes } from 'src/app/clases/Items/historial-mes';
import introJs from 'intro.js';

@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.page.html',
  styleUrls: ['./tarjeta.page.scss'],
})



export class TarjetaPage implements OnInit {

  public cardStates: boolean[] = [false, false];
  public id!:string;
  public item= new Items();
  public items:Items[]=[];
  public bolsilloEditar=new Bolsillo();
  public user = new User()
  public deposito= new Depositos()
  public depositos:Depositos[]=[];
  public depositos2:Depositos[]=[];
  public alertInputs2:any[]=[];
  public bolsillos:Bolsillo[]=[]
  public bolsillo= new Bolsillo()
  public compartir=new Compartir()
  public compartirUno=new Compartir()
  public isLoading = true;
  public loading:any;
  public itemsSubscription= new Subscription()
  public totalTemp:string=""
  public colorFav!:string;
  public creador!:boolean
  public EstadoEditar!:string
  public idchat:string=""
  openModal = false;
  openModalEditar = false;
  openModal2 = false;
  openModalDeposito = false;
  isModalOpen = false;
  public btnEliminar=true;
  public isDisabled = true;
  /** Preferencia por dispositivo: ocultar en la lista los bolsillos con `ocultarBolsillo === true`. */
  public ocultarBolsillosInactivosEnLista = false;
  public selectedBolsillo: Bolsillo | null = null;
  public positivo:number=0
  public positivos:number=0
  public negativos:number=0
  public negativo:number=0
  public Totalresultado:number=0
  public posicion!:Number
  nombreMeses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

convertirMesANumero(nombre: string): number {
  return this.nombreMeses.indexOf(nombre);
}

convertirNumeroAMes(numero: number): string {
  return this.nombreMeses[numero];
}

  /** trackBy para la lista de bolsillos: evita que los botones/popovers dejen de funcionar al re-renderizar. */
  trackByBolsilloId(_index: number, bolsillo: Bolsillo): string {
    return bolsillo.id ?? `${_index}`;
  }

  /** Incluido en ingresos/gastos/total de la tarjeta si no está desactivado. */
  /** Bolsillo contable y editable: `ocultarBolsillo` en BD no es true. */
  bolsilloActivo(b: Bolsillo | undefined | null): boolean {
    if (!b) return false;
    return b.ocultarBolsillo !== true;
  }

  /**
   * Oculta en la lista los bolsillos desactivados (`ocultarBolsillo`) si la preferencia local está activa.
   * En modo reordenar (`!isDisabled`) se muestran todos para poder moverlos.
   */
  mostrarBolsilloEnLista(b: Bolsillo): boolean {
    if (this.bolsilloActivo(b)) return true;
    if (!this.isDisabled) return true;
    return this.ocultarBolsillosInactivosEnLista !== true;
  }

  private ocultarBolsillosListaPrefsKey(): string {
    return `ocultarBolsInactivosLista_${this.id}`;
  }

  /**
   * Qué período cerraría el historial automático según la fecha (días 1–14 → 2.ª del mes anterior; día 15+ → 1.ª del mes actual).
   */
  private resolverPeriodoSegunCalendario(hoy: Date): {
    nombreCompleto: string;
    anioAProcesar: number;
    mesAProcesar: number;
    periodoAProcesar: string;
  } {
    const diaActual = hoy.getDate();
    let mesAProcesar: number;
    let anioAProcesar: number;
    let periodoAProcesar: string;

    if (diaActual >= 1 && diaActual <= 14) {
      mesAProcesar = hoy.getMonth() - 1;
      anioAProcesar = hoy.getFullYear();
      if (mesAProcesar < 0) {
        mesAProcesar = 11;
        anioAProcesar -= 1;
      }
      periodoAProcesar = 'segunda';
    } else {
      mesAProcesar = hoy.getMonth();
      anioAProcesar = hoy.getFullYear();
      periodoAProcesar = 'primera';
    }

    const nombreMes = this.convertirNumeroAMes(mesAProcesar);
    const nombreCompleto = `${nombreMes}-${periodoAProcesar}`;
    return { nombreCompleto, anioAProcesar, mesAProcesar, periodoAProcesar };
  }

  /**
   * Etiqueta y cierre manual «como hoy»: en días 1–14, si la 2.ª del mes anterior ya está en historial,
   * el foco pasa a la 1.ª del mes actual (p. ej. 9 abr → «abril-primera», no «marzo-segunda»).
   * El automático sigue usando `resolverPeriodoSegunCalendario` para no dejar períodos atrasados sin cerrar.
   */
  private resolverPeriodoParaMenuYcierreManual(hoy: Date): {
    nombreCompleto: string;
    anioAProcesar: number;
    mesAProcesar: number;
    periodoAProcesar: string;
  } {
    const dia = hoy.getDate();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();

    if (dia >= 15) {
      const nombrePrimeraMesActual = `${this.convertirNumeroAMes(mes)}-primera`;
      const primeraCerrada = this.periodoYaExisteEnHistorial(nombrePrimeraMesActual, anio);

      if (!primeraCerrada) {
        return {
          nombreCompleto: nombrePrimeraMesActual,
          anioAProcesar: anio,
          mesAProcesar: mes,
          periodoAProcesar: 'primera',
        };
      }

      return {
        nombreCompleto: `${this.convertirNumeroAMes(mes)}-segunda`,
        anioAProcesar: anio,
        mesAProcesar: mes,
        periodoAProcesar: 'segunda',
      };
    }

    let mesAnt = mes - 1;
    let anioAnt = anio;
    if (mesAnt < 0) {
      mesAnt = 11;
      anioAnt -= 1;
    }
    const nombreSegundaAnt = `${this.convertirNumeroAMes(mesAnt)}-segunda`;
    const segundaCerrada = this.periodoYaExisteEnHistorial(nombreSegundaAnt, anioAnt);

    if (!segundaCerrada) {
      return {
        nombreCompleto: nombreSegundaAnt,
        anioAProcesar: anioAnt,
        mesAProcesar: mesAnt,
        periodoAProcesar: 'segunda',
      };
    }

    return {
      nombreCompleto: `${this.convertirNumeroAMes(mes)}-primera`,
      anioAProcesar: anio,
      mesAProcesar: mes,
      periodoAProcesar: 'primera',
    };
  }

  private periodoYaExisteEnHistorial(nombreCompleto: string, anioAProcesar: number): boolean {
    const registroAnual = this.item.historial?.find(h => Number(h.ano) === anioAProcesar);
    return !!registroAnual?.meses?.find(m => m.mes === nombreCompleto);
  }

  private historialPausaPreferencesKey(): string {
    return `historialAutoPausaHasta_${this.id}`;
  }

  /** Pausa general (`general`) o pausa hasta fecha (valor ISO guardado antes). */
  private async historialAutoEstaPausado(): Promise<boolean> {
    const { value } = await Preferences.get({ key: this.historialPausaPreferencesKey() });
    if (!value) return false;
    if (value === 'general') return true;
    const t = new Date(value).getTime();
    return !Number.isNaN(t) && Date.now() < t;
  }

  /** Recalcula totales de la tarjeta solo con saldos iniciales (depósitos ya vacíos en memoria). */
  private recalcularTotalesTarjetaTrasHistorial(): void {
    this.depositos = [];
    this.positivos = 0;
    this.negativos = 0;
    this.item.bolsillos?.forEach(bolsillo => {
      bolsillo.depositos = [];
      bolsillo.subtotal = 0;
      if (!this.bolsilloActivo(bolsillo)) return;
      if (this.bolsilloUsaValorInicial(bolsillo)) {
        const v = Number(bolsillo.valor);
        if (!Number.isNaN(v) && v > 0) this.positivos += v;
        else if (!Number.isNaN(v) && v < 0) this.negativos += v;
      }
    });
    this.Totalresultado = this.positivos + this.negativos;
    this.item.total = this.Totalresultado;
  }

  /**
   * Copia depósitos al historial, borra depósitos en servidor, pone subtotales en 0 y actualiza total de la tarjeta.
   */
  private async ejecutarCierreHistorialInterno(desc: {
    nombreCompleto: string;
    anioAProcesar: number;
    mesAProcesar: number;
  }): Promise<void> {
    if (!this.item.historial) {
      this.item.historial = [];
    }

    let registroAnual = this.item.historial.find(h => Number(h.ano) === desc.anioAProcesar);
    if (!registroAnual) {
      registroAnual = { ano: String(desc.anioAProcesar), meses: [] };
      this.item.historial.push(registroAnual);
    }

    const existente = registroAnual.meses.find(m => m.mes === desc.nombreCompleto);
    if (existente) {
      console.log(`El período ${desc.nombreCompleto} ya existe. No se sobrescribe.`);
      return;
    }

    const mesHistorial = new HistorialMes();
    mesHistorial.mes = desc.nombreCompleto;
    mesHistorial.total = 0;
    mesHistorial.depositos = [];
    registroAnual.meses.push(mesHistorial);

    let total = 0;
    const depositosCopia: Depositos[] = [];
    this.depositos.forEach(element => {
      total += element.valor;
      const copia = new Depositos();
      copia.setValues(element);
      depositosCopia.push(copia);
    });
    mesHistorial.depositos = depositosCopia;
    mesHistorial.total = total;

    console.log(`Guardando historial: ${desc.nombreCompleto}`);

    await this.Update();

    try {
      const promesasLimpieza =
        this.item.bolsillos?.map(async (bolsillo: Bolsillo) => {
          const promesasEliminarDepositos =
            bolsillo.depositos?.map(element => this.depositoServices.Delete(element.id!)) || [];
          await Promise.all(promesasEliminarDepositos);
          bolsillo.subtotal = 0;
          bolsillo.depositos = [];
          return this.bolsilloService.Update(bolsillo);
        }) || [];
      await Promise.all(promesasLimpieza);

      this.recalcularTotalesTarjetaTrasHistorial();
      await this.Update();
      this.cdr.detectChanges();
      console.log('Historial guardado, depósitos limpiados y totales actualizados');
    } catch (error) {
      console.error('Error al limpiar depósitos:', error);
      this.presentAlert('Error al limpiar los depósitos después de guardar el historial');
    }
  }

  /** Cierre automático al abrir la tarjeta (respeta pausa). */
  async verificarYCompletarHistorial() {
    if (!this.item.estadohistorial) return;
    if (await this.historialAutoEstaPausado()) {
      console.log('Historial automático en pausa hasta la fecha programada en el dispositivo');
      return;
    }

    const desc = this.resolverPeriodoSegunCalendario(new Date());
    if (this.periodoYaExisteEnHistorial(desc.nombreCompleto, desc.anioAProcesar)) return;
    if (this.depositos.length === 0) return;

    await this.ejecutarCierreHistorialInterno(desc);
  }

  async manualCierreHistorialPeriodo(desc: {
    nombreCompleto: string;
    anioAProcesar: number;
    mesAProcesar: number;
  }): Promise<void> {
    if (!this.item.estadohistorial) return;
    if (this.periodoYaExisteEnHistorial(desc.nombreCompleto, desc.anioAProcesar)) {
      await this.presentAlert(`El período «${desc.nombreCompleto}» ya está en el historial. No se repite el cierre.`);
      return;
    }
    if (this.depositos.length === 0) {
      await this.presentAlert('No hay depósitos para cerrar en este período.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Cerrando período...' });
    await loading.present();
    try {
      await this.ejecutarCierreHistorialInterno(desc);
      await this.presentAlert(
        `Período «${desc.nombreCompleto}» guardado en el historial. Los depósitos actuales se vaciaron y los totales quedaron solo con saldo inicial.`
      );
    } catch {
      await this.presentAlert('No se pudo completar el cierre. Revisa la conexión e inténtalo de nuevo.');
    } finally {
      loading.dismiss();
    }
  }

  async openHistorialQuincenaMenu(): Promise<void> {
    if (!this.item.estadohistorial || !this.creador) return;

    const pausado = await this.historialAutoEstaPausado();
    const { value: pausaVal } = await Preferences.get({ key: this.historialPausaPreferencesKey() });
    let pausaTxt = 'Automático activo';
    if (pausado) {
      if (pausaVal === 'general') {
        pausaTxt = 'Automático en pausa';
      } else if (pausaVal) {
        const t = new Date(pausaVal).getTime();
        pausaTxt =
          !Number.isNaN(t) && Date.now() < t
            ? `Automático en pausa hasta ${new Date(pausaVal).toLocaleString()}`
            : 'Automático en pausa';
      }
    }

    const descManual = this.resolverPeriodoParaMenuYcierreManual(new Date());
    const subHeader = `${pausaTxt} · Cierre sugerido: «${descManual.nombreCompleto}»`;

    const sheet = await this.actionSheetController.create({
      header: 'Historial quincenal',
      subHeader,
      buttons: [
        {
          text: `Cerrar «${descManual.nombreCompleto}»`,
          icon: 'calendar-outline',
          handler: () => {
            void this.manualCierreHistorialPeriodo(descManual);
          },
        },
        {
          text: 'Pausar automático',
          icon: 'pause-outline',
          handler: async () => {
            await Preferences.set({
              key: this.historialPausaPreferencesKey(),
              value: 'general',
            });
            await this.presentAlert(
              'El cierre automático queda en pausa hasta que pulses Reanudar. Puedes usar el cierre sugerido del menú cuando quieras.'
            );
          },
        },
        {
          text: 'Reanudar automático',
          icon: 'play-outline',
          handler: async () => {
            await Preferences.remove({ key: this.historialPausaPreferencesKey() });
            await this.presentAlert('Cierre automático reanudado.');
          },
        },
        { text: 'Cancelar', role: 'cancel', icon: 'close-outline' },
      ],
    });
    await sheet.present();
  }
  
  public alertInputs3:any[]= [
    {
      name: 'name',
      type: 'text',
      placeholder: 'Ingrese el nuevo nombre',
    },
  ];

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    this.Compartir()
  }

  regresar(){
    this.link.navigate(['tabs/tab2'])
  }

  @ViewChild('capturableArea') capturableArea!: ElementRef;

  constructor(
    private router:ActivatedRoute,
    public itemService:ItemsService,
    private alertController: AlertController,
    public userService:UserService,
    public link:Router,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private bolsilloService: BolsillosService,
    private depositoServices:DepositosService,
    private cdr: ChangeDetectorRef
  ) { }

//tour o guia
iniciarTour() {
  introJs()
    .setOptions({
      steps: [
        {
          element: '.favorito',
          intro: 'Puedes selecionar la tarjeta como favorita'
        },
        {
          element: '#estadoTarjeta',
          intro: 'Aquí puedes activar o desactivar la tarjeta'
        },
        {
          element: '#popover-button2',
          intro: 'Más opciones de configuraciones'
        }
      ],
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Terminar',
    })
     .oncomplete(() => {
      // Guardar en localStorage que el tour fue completado
      localStorage.setItem('tourConfigTarjeta', 'true');
    })
    .start();
}
iniciarTour2() {
  introJs()
    .setOptions({
      steps: [
        {
          element: '#configbolsillo',
          intro: 'Aquí puedes acceder a más opciones para personalizar el bolsillo.'
        },
        {
          element: '#ver',
          intro: 'Haz clic aquí para ver la lista de depósitos de este bolsillo.'
        },
        {
          element: '#verinfo',
          intro: 'Al seleccionar un depósito, podrás ver información detallada del mismo.'
        },
        {
          element: '.list-btns',
          intro: 'Estos dos botones te permiten guardar un depósito como ingreso (positivo) o gasto (negativo).'
        },
        {
          element: '#capture',
          intro: 'Este botón te permite guardar una captura con el historial de depósitos del bolsillo seleccionado.'
        }
      ],
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      doneLabel: 'Terminar',
    })
    .onbeforechange((targetElement) => {
      // Si estamos en el paso donde se necesita mostrar el contenido oculto
      if (targetElement.id === 'ver') {
        this.show(0)
      }
      return true
    })
    .oncomplete(() => {
      localStorage.setItem('tourbolsillo', 'true');
    })
    .start();
}

 handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
  const DeIndex = ev.detail.from;
  const AIndex = ev.detail.to;

  const movedItem = this.item.bolsillos?.splice(DeIndex, 1)[0];
  this.item.bolsillos?.splice(AIndex, 0, movedItem!);

  // ✅ Actualiza la posición
  this.item.bolsillos?.forEach((bolsillo, index) => {
    bolsillo.posicion = index + 1;
  });

  ev.detail.complete();

}

  toggleReorder() {
    if (!this.masDeUnBolsillo) {
      return;
    }
    this.isDisabled = !this.isDisabled;
    if (this.isDisabled) {
      this.item.bolsillos!.forEach(element => {
        this.bolsilloService.Update(element)
      });
    }
  }

  public async presentActionSheetEliminar(bolsillo:Bolsillo,deposito:Depositos) {

    const actionSheet = await this.actionSheetController.create({
      header: 'Información del deposito',
      cssClass: 'informacion-action-sheet',
      buttons: [
        {
          text: 'Creado por: '+deposito.email,
        },
        {
          text: 'Fecha: '+deposito.fecha,
        },
        {
          text: 'Valor: $'+deposito.valor,
        },
        {
          text: deposito.comentario,
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.AlertEliminar(bolsillo,deposito)
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  public getBtnEliminar(bolsillo:Bolsillo, deposito:Depositos) {
    return [
      {
        text: 'No',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Sí',
        handler: () => {
          this.EliminarDeposito(bolsillo,deposito);
        }
      }
    ];
  }

  async AlertEliminar(bolsillo:Bolsillo, deposito:Depositos) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      buttons: this.getBtnEliminar(bolsillo,deposito),
    });

    await alert.present();
  }

  async presentAlert(msn:String) {

    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: ''+msn,
      buttons: ['OK'],
    });
    await alert.present();
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.ngOnInit()
      event.target.complete();
    }, 2000);
  }

  async ngOnInit() {
     this.bolsillo.color="#027abb"
     this.bolsilloEditar.color="#027abb"
    this.loading = await this.loadingController.create({ message: '' });
    await this.loading.present();

    if (await this.userService.Verificar()) {
      const ahora = new Date();
      await Preferences.set({ key: 'ultimaActividad', value: ahora.toString() });

      const { value: token } = await Preferences.get({ key: 'token' });
      if (token) {
        const data = await this.userService.Quien(token);
        this.user = await this.userService.InfoUser(data.data);
      }

      this.id = this.router.snapshot.paramMap.get('id')!;
      this.item = await this.itemService.GetItem(this.id);

      const { value: ocLista } = await Preferences.get({ key: this.ocultarBolsillosListaPrefsKey() });
      this.ocultarBolsillosInactivosEnLista = ocLista === 'true' || ocLista === '1';

      // Asegurar que el estado esté definido (false = activado por defecto)
      if (this.item.estado === undefined || this.item.estado === null) {
        this.item.estado = false; // false = activado, true = desactivado
      }

      await this.CompartidoUNO();
      if (this.item.estadohistorial) {
        this.bolsillo.Vinicial = true;
        this.bolsilloEditar.Vinicial = true;
      } else {
        this.bolsillo.Vinicial = false;
        this.bolsilloEditar.Vinicial = false;
      }
      this.item.bolsillos = await this.bolsilloService.allbolsillo(this.id);
      
      this.item.bolsillos!.sort((a, b) => {
        return a.posicion - b.posicion;
      });

      const todosLosDepositos = await this.depositoServices.alldepositos(this.id);
      this.depositos = todosLosDepositos;

      this.aplicarTotalesTarjeta();
      const { value: orden } = await Preferences.get({ key: 'TarjetaOrden' });
      if (orden) {
        this.Ordenar(orden);
      }

      // Mantener cardStates con el mismo número de bolsillos para que los botones no fallen
      this.cardStates = this.item.bolsillos!.map(() => false);
      if (!this.masDeUnBolsillo) {
        this.isDisabled = true;
      }

      this.alertInputs2 = [
        {
          name: 'itemname',
          placeholder: "Escribe aquí",
          type: 'text',
        }
      ];

      this.ActualizarUltimaVez();
      await this.verificarYCompletarHistorial();
      this.loading.dismiss();
      this.isLoading = false;
         
    const tourHecho1 = localStorage.getItem('tourConfigTarjeta');
      if (!tourHecho1) {
        this.iniciarTour();
      }
      const tourHecho2 = localStorage.getItem('tourbolsillo');
      if (this.item.bolsillos!.length>0 && !tourHecho2) {
        this.iniciarTour2();
      }
    }else{
      this.loading.dismiss();
      this.isLoading = false;  
    }
  }

ActualizarUltimaVez(){
  this.item.reciente= new Date()
  this.Update()
}

  /** Ingresos, gastos y total de la tarjeta solo con bolsillos activos. */
  aplicarTotalesTarjeta(): void {
    this.item.bolsillos?.forEach(bolsillo => {
      bolsillo.depositos = this.depositos.filter(dep => dep.idBolsillo === bolsillo.id);
    });
    this.positivos = 0;
    this.negativos = 0;
    this.depositos.forEach(deposito => {
      const b = this.item.bolsillos?.find(x => x.id === deposito.idBolsillo);
      if (!this.bolsilloActivo(b)) return;
      if (deposito.valor > 0) this.positivos += deposito.valor;
      else if (deposito.valor < 0) this.negativos += deposito.valor;
    });
    this.item.bolsillos?.forEach(bolsillo => {
      if (!this.bolsilloActivo(bolsillo)) return;
      if (this.bolsilloUsaValorInicial(bolsillo)) {
        const v = Number(bolsillo.valor);
        if (v > 0) this.positivos += v;
        else if (v < 0) this.negativos += v;
      }
    });
    this.Totalresultado = this.positivos + this.negativos;
    this.item.total = this.Totalresultado;
  }

  /** Actualiza totales tras un depósito sin llamar Verificar() ni recargar (evita logout). */
  refreshTotalsAfterDeposit(): void {
    this.aplicarTotalesTarjeta();
    this.Update();
  }

  async toggleOcultarBolsillosInactivos(): Promise<void> {
    this.ocultarBolsillosInactivosEnLista = !this.ocultarBolsillosInactivosEnLista;
    await Preferences.set({
      key: this.ocultarBolsillosListaPrefsKey(),
      value: this.ocultarBolsillosInactivosEnLista ? 'true' : 'false',
    });
    this.cdr.detectChanges();
  }

  async toggleBolsilloActivo(b: Bolsillo): Promise<void> {
    const prevOcultar = b.ocultarBolsillo === true;
    const eraActivo = this.bolsilloActivo(b);
    b.ocultarBolsillo = eraActivo ? true : false;
    try {
      const res = await this.bolsilloService.Update(b);
      if (res === 204) {
        this.aplicarTotalesTarjeta();
        await this.Update();
        this.cdr.detectChanges();
      } else {
        b.ocultarBolsillo = prevOcultar;
        await this.presentAlert('No se pudo actualizar el bolsillo.');
      }
    } catch {
      b.ocultarBolsillo = prevOcultar;
      await this.presentAlert('Error al actualizar el bolsillo.');
    }
  }

  async CompartidoUNO(){
    const { value } = await Preferences.get({ key: 'token' });
    if(value)
    this.userService.Quien(value).then((res)=>{
       if(res.data===this.item.userId){
          this.creador=true
       }else{
        this.item.compartir.forEach(element => {
          if(res.data===element.iduser){
            this.compartirUno=element
          }
        });
       }

    })
  }

  formatNumberMil(value: number | string | undefined | null): string {
    if (value == null || value === '') return '0';
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(n)) return '0';
    return n.toLocaleString();
  }

  /**
   * Tarjeta con historial exige saldo inicial en el formulario, pero el toggle Vinicial puede quedar en false
   * y guardarse solo `valor`. Sin esto la tarjeta usa la vista Ingresos/Egresos (solo depósitos) y el total sale $0.
   */
  bolsilloUsaValorInicial(b: Bolsillo): boolean {
    if (b.Vinicial === true) return true;
    if (!this.item.estadohistorial || b.valor == null) return false;
    const v = Number(b.valor);
    return !Number.isNaN(v) && v !== 0;
  }

  totalInicialMasDepositos(b: Bolsillo): number {
    const v = Number(b.valor ?? 0);
    const s = Number(b.subtotal ?? 0);
    return (Number.isNaN(v) ? 0 : v) + (Number.isNaN(s) ? 0 : s);
  }

  get masDeUnBolsillo(): boolean {
    return (this.item.bolsillos?.length ?? 0) > 1;
  }

  /** Monto de saldo inicial del bolsillo (campo `valor` en API). */
  private saldoInicialOrdenNum(b: Bolsillo): number {
    const v = Number(b.valor ?? 0);
    return Number.isNaN(v) ? 0 : v;
  }

  /** Suma de movimientos en depósitos (usa la lista cargada si existe; si no, `subtotal`). */
  private sumaDepositosOrdenNum(b: Bolsillo): number {
    if (b.depositos != null && b.depositos.length > 0) {
      let t = 0;
      for (const d of b.depositos) {
        const v = Number(d.valor ?? 0);
        if (!Number.isNaN(v)) t += v;
      }
      return t;
    }
    const s = Number(b.subtotal ?? 0);
    return Number.isNaN(s) ? 0 : s;
  }

  /** Saldo total coherente con depósitos en memoria + saldo inicial. */
  private saldoParaOrden(b: Bolsillo): number {
    return this.saldoInicialOrdenNum(b) + this.sumaDepositosOrdenNum(b);
  }

/*
Resultado(x:number): string {
  let Tvalor=0
  let Result=0
  let positivos=0
  let negativos=0
  this.bolsillos.forEach((bolsillo,index) =>{
    if(x===index){
      if(bolsillo.Vinicial){
        bolsillo.depositos!.forEach(depositos => {
          Tvalor=Tvalor+depositos.valor
        });
        Result=bolsillo.valor!+Tvalor
      }else{
        bolsillo.depositos!.forEach(depositos => {
          if(depositos.valor>0){
            positivos=positivos+depositos.valor
          }else{
            negativos=negativos+depositos.valor
          }
        });
        Result=positivos+negativos
      }
    }
  });
  return String(Result)
}
*/

Positivo(bolsillo:Bolsillo): string {
  let positivos=0
        bolsillo.depositos?.forEach(deposito => {
          if(deposito.valor>0){
            positivos=positivos+deposito.valor
          }
        });
  return this.formatNumberMil(positivos)
}

Negativo(bolsillo:Bolsillo): string {
  let negativos=0
  bolsillo.depositos?.forEach(depositos => {
    if(depositos.valor<0){
      negativos=negativos+depositos.valor
    }
  });
  return this.formatNumberMil(negativos)
}

total(){
 /* this.positivo=0
  this.negativo=0
  this.Totalresultado=0
  console.log(this.item.total)
  this.item.total=0
  this.item.bolsillos!.forEach((bolsillo) =>{
      if(bolsillo.Vinicial){
        bolsillo.depositos!.forEach(depositos => {
          if(depositos.valor<0){
            this.negativo=this.negativo+depositos.valor
          }else{
            this.positivo=this.positivo+depositos.valor
          }
        });
        this.positivo=this.positivo+bolsillo.valor!
      }else{
        bolsillo.depositos!.forEach(deposito => {
          if(deposito.valor<0){
            this.negativo=this.negativo+deposito.valor
          }else{
            this.positivo=this.positivo+deposito.valor
          }
        });
      }
  });
  this.Totalresultado=this.positivo+(this.negativo)
  this.item.total=this.Totalresultado
  console.log(this.Totalresultado)
  this.Update()
  */
}

Favorito(){
  if(this.item.favorito==true){
    this.item.favorito=false
  }else if(this.item.favorito==false){
    this.item.favorito=true
  }else{
    this.item.favorito=false
  }
  this.Update()
}

EditarNombreTarjeta() {
this.link.navigate(['/editar-tarjeta/',this.id])

}

async EditarBolsillo(bolsillo:Bolsillo) {
  this.bolsilloEditar=bolsillo
  await this.modalEditar.present();
}

  /** Abre el menú de opciones del bolsillo por código (evita que el popover por trigger falle). */
  async openBolsilloMenu(bolsillo: Bolsillo, index: number): Promise<void> {
    if (this.item.estado) return;
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones del bolsillo',
      cssClass: 'bolsillo-menu-actions',
      buttons: [
        {
          text: 'Editar bolsillo',
          icon: 'create-outline',
          handler: () => this.EditarBolsillo(bolsillo),
        },
        {
          text: this.bolsilloActivo(bolsillo) ? 'Desactivar bolsillo' : 'Activar bolsillo',
          icon: this.bolsilloActivo(bolsillo) ? 'eye-off-outline' : 'eye-outline',
          handler: () => {
            void this.toggleBolsilloActivo(bolsillo);
          },
        },
        {
          text: 'Eliminar depósitos',
          icon: 'trash-outline',
          handler: () => this.EliminarDepositos(bolsillo.id!),
        },
        {
          text: 'Eliminar bolsillo',
          icon: 'close-circle-outline',
          role: 'destructive',
          handler: () => this.EliminarItem(index),
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

confirmEditar() {
  if(this.bolsilloEditar.nombre!="" && this.bolsilloEditar.color!=null){
    if (this.item.estadohistorial) {
      if (this.bolsilloEditar.valor == null || Number(this.bolsilloEditar.valor) < 1) {
        this.presentAlert("Ingresa el saldo inicial");
        return;
      }
      this.bolsilloEditar.Vinicial = true;
    } else {
      this.bolsilloEditar.Vinicial = Boolean(this.bolsilloEditar.Vinicial);
      if (this.bolsilloEditar.Vinicial && (this.bolsilloEditar.valor == null || Number(this.bolsilloEditar.valor) < 1)) {
        this.presentAlert("Ingresa el saldo inicial");
        return;
      }
    }
    this.bolsilloService.Update(this.bolsilloEditar).then((res)=>{
      if(res===204){
        this.modalEditar.dismiss('confirm');
        this.bolsilloEditar= new Bolsillo();
        this.total()
        this.ngOnInit()
      }else{
        this.presentAlert("Error, intenta nuevamente");
      }
    })
  } else {
    this.presentAlert("Error, verifica los datos e intenta nuevamente");
  }
}

async EliminarDepositos(id:string){

  this.item.bolsillos!.forEach(async (bolsillo:Bolsillo) => {
     
    if(id===bolsillo.id){
          
      if(bolsillo.depositos!.length>0){
          const alert = await this.alertController.create({
            header: 'Vaciar depositos',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
              },
              {
                text: 'Sí',
                handler: async () => {
                  //eliminando todos los depositos
                     await this.loading.present();
                  bolsillo.depositos!.forEach((deposito:Depositos, i) => {
                    this.depositoServices.Delete(deposito.id!)  
                    bolsillo.depositos?.slice(i,1)
                  });
                  this.loading.dismiss();
                  bolsillo.subtotal=0
                      this.bolsilloService.Update(bolsillo).then((res)=>{
                        if(res==204){
                          bolsillo.depositos=[]
                        }
                      })
                  this.total()
                  this.ngOnInit()
                },
              },
            ],
          });

           await alert.present();
        }else{
          this.presentAlert("No hay depositos")
}
    }
  });

  
}

show(x:number):void{
    this.cardStates[x] = !this.cardStates[x];
  }

 Update(){
     this.itemService.Update(this.item).then((res)=>{
      if(res===204){
        this.itemsSubscription=this.itemService.getItems$().subscribe()
      }else{
        this.presentAlert("Error, intenta nuevamente");
      }
    })
  }

  async EliminarItem(x: number) {
    const alert = await this.alertController.create({
      header: 'Eliminar',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: () => {
            this.item.bolsillos?.forEach((bolsillo, i) => {
              if (x == i) {
                bolsillo.depositos?.forEach(element => {
                  this.depositoServices.Delete(element.id!)
                });

                this.bolsilloService.Delete(bolsillo.id!).then((res) => {
                  if (res == 204) {
                    this.item.bolsillos?.splice(x, 1);

                  } else {
                    this.presentAlert("Error en el servidor, intenta más tarde.");
                  }
                  alert.dismiss();
                });
              }
            });
            this.total();
            this.ngOnInit()
            return false;
          },
        },
      ],
    });
    await alert.present();
  }

async EliminarCompartida(id:string){
  const alert = await this.alertController.create({
    header: 'Eliminar',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Quitar',
        handler: () => {
          this.item.compartir.forEach((data,index)=>{
            if(data.iduser===id){
              this.item.compartir.splice(index,1)
              this.Update()
              this.regresar()
              return
            }
          })
        },
      },
    ],
  });
  await alert.present();
}

async EliminarTarjeta(){
  const alert = await this.alertController.create({
    header: 'Eliminar tarjeta',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Confirmar',
        handler: () => {

          this.item.bolsillos?.forEach(bolsillo => {
            if(bolsillo.depositos?.length==undefined){
              bolsillo.depositos=[]
            }
            bolsillo.depositos?.forEach(deposito => {
                this.depositoServices.Delete(deposito.id!)
            });
            this.bolsilloService.Delete(bolsillo.id!)
          });

          this.itemService.Delete(this.id).then((data)=>{
           if(data==204){

            this.regresar()
           }else{
            this.presentAlert("Error, intenta nuevamente");
           }

          })
        },
      },
    ],
  });
  await alert.present();
}

EliminarDeposito(bolsillo:Bolsillo,deposito:Depositos){
    bolsillo.subtotal=0
     this.depositoServices.Delete(deposito.id!).then((res)=>{
      if(res==204){
        bolsillo.depositos?.forEach((element,x) => {
          if(element.id==deposito.id){
            bolsillo.depositos?.splice(x,1)
            bolsillo.depositos!.forEach((deposito) => {
              bolsillo.subtotal=bolsillo.subtotal+deposito.valor
            });

            this.bolsilloService.Update(bolsillo)
            this.ngOnInit()
          }
        });
      }
    })

}

Compartir(){
 this.link.navigate(['compartir/',this.id])
}

RutaHistorial(){
 this.link.navigate(['tarjeta/historial',this.id])
}

  depositar(bolsillo:Bolsillo,tipo:string,){
    const fecha= new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses empiezan desde 0, por lo que sumamos 1
    const ano = fecha.getFullYear();
    this.deposito.fecha = dia+"/"+mes+"/"+ano;
    this.deposito.email=this.user.email
    this.deposito.creado= new Date ()
    this.deposito.idBolsillo=bolsillo.id
    this.deposito.idItem=this.item.id
    if(!bolsillo.depositos || bolsillo.depositos.length<0){
      bolsillo.depositos=[]
    }
    bolsillo.depositos!.push(this.deposito)
    bolsillo.subtotal=0
    if(this.deposito.valor!=null){

      if(tipo==="restar"){
        this.deposito.valor=this.deposito.valor*-1;
      }
      this.depositoServices.Create(this.deposito).then((res)=>{
        if(res.status==200){

          bolsillo.depositos!.forEach((deposito) => {
            bolsillo.subtotal=bolsillo.subtotal+deposito.valor
          });
        }
        this.bolsilloService.Update(bolsillo).then(() => {
          this.total();
          // Actualizar totales sin volver a llamar Verificar() (evita logout)
          this.refreshTotalsAfterDeposit();
          this.deposito = new Depositos();
        })
      })

      //this.NewNotification("ha añadido un nuevo valor de $"+this.deposito.valor)

    }else{
      this.presentAlert("Debes ingresar un valor.");
    }
  }
  
  public depositoAlertInputs = [
    {
      name: 'valor',
      type: 'number',
      placeholder: 'Valor',
      min: 0.01,
      value: ''
    },
    {
      name: 'comentario',
      type: 'textarea',
      placeholder: 'Comentario (opcional)',
      attributes: {
        maxlength: 60
      },
      value: ''
    }
  ];

  getDepositoAlertButtons(bolsillo: Bolsillo) {
    const buttons: any[] = [
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ];
    
    if (!this.item.estadohistorial) {
      buttons.push({
        text: 'Agregar',
        cssClass: 'alert-button-agregar',
        handler: (data: any) => {
          return this.handleDepositoAlert(data, bolsillo, 'sumar');
        }
      });
    }
    
    buttons.push({
      text: 'Restar',
      cssClass: 'alert-button-restar',
      handler: (data: any) => {
        return this.handleDepositoAlert(data, bolsillo, 'restar');
      }
    });
    
    return buttons;
  }

  handleDepositoAlert(data: any, bolsillo: Bolsillo, tipo: string): boolean {
    const valor = parseFloat(data.valor);
    
    if (!valor || valor <= 0) {
      this.presentAlert("Debes ingresar un valor válido.");
      return false;
    }
    
    // Crear el depósito
    this.deposito = new Depositos();
    this.deposito.valor = valor;
    this.deposito.comentario = data.comentario || '';
    
    // Llamar a la función depositar
    this.depositar(bolsillo, tipo);
    
    return true;
  }

  onDepositoAlertDismiss(event: any, bolsillo: Bolsillo) {
    // Este método se puede usar para limpiar si es necesario
  }

  /** Abre el alert de agregar/restar depósito por código (evita que el trigger por ID falle). */
  async openDepositoAlert(bolsillo: Bolsillo): Promise<void> {
    if (this.item.estado) return;
    if (!this.bolsilloActivo(bolsillo)) {
      await this.presentAlert('Este bolsillo está desactivado. Actívalo desde el menú del bolsillo para agregar o restar depósitos.');
      return;
    }
    const alert = await this.alertController.create({
      header: 'Agregar depósito',
      inputs: this.depositoAlertInputs as any,
      buttons: this.getDepositoAlertButtons(bolsillo),
    });
    await alert.present();
  }

/*Modal añadir tarjeta*/
@ViewChild('modal', { static: false }) modal!: IonModal;
@ViewChild('modalEditar', { static: false }) modalEditar!: IonModal;

initBolsillo() {
  this.bolsillo = new Bolsillo();
  if (this.item.estadohistorial) {
    this.bolsillo.Vinicial = true;
  }
}

async openBolsilloModal() {
  this.bolsillo = new Bolsillo();
  await this.modal.present();
}

cancel() {
  this.modal.dismiss(null, 'cancel');
  this.bolsillo = new Bolsillo();
}

cancel2() {
  this.modalEditar.dismiss(null, 'cancel');
  this.bolsilloEditar = new Bolsillo();
}

Festado(tipo:string){
    tipo=="activar" ?   this.item.estado=false:  this.item.estado=true
    this.Update()
}

FingresarValor(){
  console.log("Valor bolsillo3 ",this.bolsillo.Vinicial)
    if(!this.bolsillo.Vinicial){
      this.bolsillo.Vinicial=true
    }else{
      this.bolsillo.Vinicial=false
    }
    console.log("Valor bolsillo ",this.bolsillo.Vinicial)
  }

FingresarValor2(){
    if(!this.bolsilloEditar.Vinicial){
      this.bolsilloEditar.Vinicial=true
    }else{
      this.bolsilloEditar.Vinicial=false
    }
    console.log("Valor editar"+this.bolsilloEditar.Vinicial)
  }

confirm() {
    if(this.bolsillo.nombre!="" && this.bolsillo.color!=null){
      if (this.item.estadohistorial) {
        if (this.bolsillo.valor == null || Number(this.bolsillo.valor) < 1) {
          this.presentAlert("Ingresa el saldo inicial");
          return;
        }
        this.bolsillo.Vinicial = true;
      } else {
        this.bolsillo.Vinicial = Boolean(this.bolsillo.Vinicial);
        if (this.bolsillo.Vinicial && (this.bolsillo.valor == null || Number(this.bolsillo.valor) < 1)) {
          this.presentAlert("Ingresa el saldo inicial");
          return;
        }
      }
      this.bolsillo.subtotal=0;
      this.bolsillo.ocultarBolsillo = false;
      this.bolsillo.creado=new Date()
      this.bolsillo.idItem=this.item.id!
      this.bolsillo.posicion=this.item.bolsillos!.length+1
      this.item.bolsillos!.push(this.bolsillo);
      this.bolsilloService.Create(this.bolsillo).then((res)=>{
        if(res.status===200){
          this.modal.dismiss('confirm');
          this.bolsillo= new Bolsillo();
          this.ngOnInit()
        }else{
          this.presentAlert("Error, intenta nuevamente");
        }
      })
    }else{
      this.presentAlert("Error, verifica los datos e intenta nuevamente");
    }
}

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    this.bolsillo = new Bolsillo();
    if (ev.detail.role === 'confirm') {
    }
  }

  onWillDismissE(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    this.bolsilloEditar = new Bolsillo();
    if (ev.detail.role === 'confirm') {
    }
  }

async Ordenar(ordenar: string) {
  const list = this.item.bolsillos;
  if (!list?.length) {
    return;
  }

  if (ordenar === 'valor_inicial') {
    ordenar = 'saldo_inicial';
  }
  if (ordenar === 'suma_depositos') {
    ordenar = 'saldo_total';
  }

  await Preferences.set({
    key: 'TarjetaOrden',
    value: ordenar,
  });

  const byNombre = (a: Bolsillo, b: Bolsillo) =>
    (a.nombre ?? '').localeCompare(b.nombre ?? '', undefined, { sensitivity: 'base' });

  if (ordenar === 'nombre') {
    list.sort((a, b) => byNombre(a, b));
  } else if (ordenar === 'favorito') {
    list.sort((a, b) => {
      const inv = byNombre(b, a);
      return inv !== 0 ? inv : byNombre(a, b);
    });
  } else if (ordenar === 'saldo_total') {
    list.sort((a, b) => {
      const d = this.saldoParaOrden(b) - this.saldoParaOrden(a);
      return d !== 0 ? d : byNombre(a, b);
    });
  } else if (ordenar === 'saldo_inicial') {
    list.sort((a, b) => {
      const d = this.saldoInicialOrdenNum(b) - this.saldoInicialOrdenNum(a);
      return d !== 0 ? d : byNombre(a, b);
    });
  }

  list.forEach((b, i) => {
    b.posicion = i + 1;
  });
  list.forEach(b => {
    this.bolsilloService.Update(b);
  });
  this.cdr.detectChanges();
}

/*tomar capture*/
@ViewChild(IonContent, { static: false }) ionContent!: IonContent;
CapturaPantalla(x: number) {
  const itemElementId = 'item-' + x;
  const capturableArea = document.getElementById(itemElementId);

  if (!capturableArea) {
    console.error(`El elemento ${itemElementId} no se encontró en el DOM.`);
    return;
  }

  html2canvas(capturableArea).then(canvas => {
    const imageData = canvas.toDataURL('image/png');

    // Crear un enlace para descargar la imagen
    const downloadLink = document.createElement('a');
    downloadLink.href = imageData;
    downloadLink.download = 'captura_pantalla.png';
    document.body.appendChild(downloadLink);

    // Simular clic en el enlace para iniciar la descarga
    downloadLink.click();

    // Eliminar el enlace después de la descarga
    document.body.removeChild(downloadLink);

    this.presentAlert("Imagen descargada")
  });
}

}
