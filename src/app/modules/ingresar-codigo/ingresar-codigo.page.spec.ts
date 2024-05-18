import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngresarCodigoPage } from './ingresar-codigo.page';

describe('IngresarCodigoPage', () => {
  let component: IngresarCodigoPage;
  let fixture: ComponentFixture<IngresarCodigoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(IngresarCodigoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
