import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesTabla } from './reportes-tabla';

describe('ReportesTabla', () => {
  let component: ReportesTabla;
  let fixture: ComponentFixture<ReportesTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesTabla]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesTabla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
