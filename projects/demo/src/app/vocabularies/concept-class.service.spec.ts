import { TestBed } from '@angular/core/testing';

import { ConceptClassService } from './concept-class.service';

describe('ConceptClassService', () => {
  let service: ConceptClassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConceptClassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
