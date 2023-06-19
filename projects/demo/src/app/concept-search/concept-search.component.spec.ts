import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptSearchComponent } from './concept-search.component';

describe('ConceptSearchComponent', () => {
  let component: ConceptSearchComponent;
  let fixture: ComponentFixture<ConceptSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConceptSearchComponent]
    });
    fixture = TestBed.createComponent(ConceptSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
