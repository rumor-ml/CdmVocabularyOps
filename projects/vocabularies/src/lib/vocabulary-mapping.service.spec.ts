import { TestBed } from '@angular/core/testing';

import { VocabularyMappingService } from './vocabulary-mapping.service';

describe('MappingService', () => {
  let service: VocabularyMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VocabularyMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
