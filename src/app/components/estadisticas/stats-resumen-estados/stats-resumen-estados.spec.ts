import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsResumenEstados } from './stats-resumen-estados';

describe('StatsResumenEstados', () => {
  let component: StatsResumenEstados;
  let fixture: ComponentFixture<StatsResumenEstados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsResumenEstados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsResumenEstados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
