import { TestBed } from '@angular/core/testing';

import { VocabulariesService } from './vocabularies.service';

describe('VocabulariesService', () => {
  let service: VocabulariesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VocabulariesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
