import { TestBed } from '@angular/core/testing';

import { AuxiliaryService } from './auxiliary.service';

describe('AuxiliaryService', () => {
  let service: AuxiliaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuxiliaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
