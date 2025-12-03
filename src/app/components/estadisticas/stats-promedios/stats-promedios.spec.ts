import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPromedios } from './stats-promedios';

describe('StatsPromedios', () => {
  let component: StatsPromedios;
  let fixture: ComponentFixture<StatsPromedios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsPromedios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsPromedios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
