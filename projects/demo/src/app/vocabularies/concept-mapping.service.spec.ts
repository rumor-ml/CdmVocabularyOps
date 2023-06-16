import { TestBed } from '@angular/core/testing';

import { ConceptMappingService } from './concept-mapping.service';

describe('ConceptMappingService', () => {
  let service: ConceptMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConceptMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
