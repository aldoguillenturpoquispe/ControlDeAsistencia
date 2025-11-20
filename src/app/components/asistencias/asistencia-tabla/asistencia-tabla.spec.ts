import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaTabla } from './asistencia-tabla';

describe('AsistenciaTabla', () => {
  let component: AsistenciaTabla;
  let fixture: ComponentFixture<AsistenciaTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaTabla]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaTabla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
