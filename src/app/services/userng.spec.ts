import { TestBed } from '@angular/core/testing';

import { Userng } from './userng';

describe('Userng', () => {
  let service: Userng;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Userng);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
