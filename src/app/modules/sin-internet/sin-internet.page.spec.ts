import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SinInternetPage } from './sin-internet.page';

describe('SinInternetPage', () => {
  let component: SinInternetPage;
  let fixture: ComponentFixture<SinInternetPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SinInternetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
