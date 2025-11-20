import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaFormModal } from './asistencia-form-modal';

describe('AsistenciaFormModal', () => {
  let component: AsistenciaFormModal;
  let fixture: ComponentFixture<AsistenciaFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
