import { TestBed } from '@angular/core/testing';

import { SourceDbService } from './source-db.service';

describe('SourceDbService', () => {
  let service: SourceDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SourceDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
