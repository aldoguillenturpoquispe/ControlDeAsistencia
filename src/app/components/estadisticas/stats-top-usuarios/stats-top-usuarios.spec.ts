import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsTopUsuarios } from './stats-top-usuarios';

describe('StatsTopUsuarios', () => {
  let component: StatsTopUsuarios;
  let fixture: ComponentFixture<StatsTopUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsTopUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsTopUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
