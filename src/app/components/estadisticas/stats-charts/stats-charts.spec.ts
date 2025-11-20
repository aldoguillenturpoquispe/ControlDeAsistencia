import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCharts } from './stats-charts';

describe('StatsCharts', () => {
  let component: StatsCharts;
  let fixture: ComponentFixture<StatsCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsCharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
