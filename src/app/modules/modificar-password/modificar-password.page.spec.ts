import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarPasswordPage } from './modificar-password.page';

describe('ModificarPasswordPage', () => {
  let component: ModificarPasswordPage;
  let fixture: ComponentFixture<ModificarPasswordPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ModificarPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
