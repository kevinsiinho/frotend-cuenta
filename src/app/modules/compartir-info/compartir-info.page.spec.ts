import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompartirInfoPage } from './compartir-info.page';

describe('CompartirInfoPage', () => {
  let component: CompartirInfoPage;
  let fixture: ComponentFixture<CompartirInfoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CompartirInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
