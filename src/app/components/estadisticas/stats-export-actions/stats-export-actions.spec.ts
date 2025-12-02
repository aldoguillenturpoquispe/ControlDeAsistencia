import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsExportActions } from './stats-export-actions';

describe('StatsExportActions', () => {
  let component: StatsExportActions;
  let fixture: ComponentFixture<StatsExportActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsExportActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsExportActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
