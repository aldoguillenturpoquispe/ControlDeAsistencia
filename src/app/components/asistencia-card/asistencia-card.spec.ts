import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaCard } from './asistencia-card';

describe('AsistenciaCard', () => {
  let component: AsistenciaCard;
  let fixture: ComponentFixture<AsistenciaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
