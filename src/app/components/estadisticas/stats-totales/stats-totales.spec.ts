import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTotales } from './stats-totales';

describe('StatsTotales', () => {
  let component: StatsTotales;
  let fixture: ComponentFixture<StatsTotales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsTotales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsTotales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
