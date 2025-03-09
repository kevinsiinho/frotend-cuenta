import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TarjetasPredeterminadasComponent } from './tarjetas-predeterminadas.component';

describe('TarjetasPredeterminadasComponent', () => {
  let component: TarjetasPredeterminadasComponent;
  let fixture: ComponentFixture<TarjetasPredeterminadasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TarjetasPredeterminadasComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetasPredeterminadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
