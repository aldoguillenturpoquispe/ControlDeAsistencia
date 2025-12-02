import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaDeleteModal } from './asistencia-delete-modal';

describe('AsistenciaDeleteModal', () => {
  let component: AsistenciaDeleteModal;
  let fixture: ComponentFixture<AsistenciaDeleteModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaDeleteModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaDeleteModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
