import { TestBed } from '@angular/core/testing';

import { VocabularyQualityCheckService } from './vocabulary-quality-check.service';

describe('VocabularyQualityCheckService', () => {
  let service: VocabularyQualityCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VocabularyQualityCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
