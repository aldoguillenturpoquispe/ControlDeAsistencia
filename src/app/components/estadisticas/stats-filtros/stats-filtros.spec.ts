import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsFiltros } from './stats-filtros';

describe('StatsFiltros', () => {
  let component: StatsFiltros;
  let fixture: ComponentFixture<StatsFiltros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsFiltros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsFiltros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
