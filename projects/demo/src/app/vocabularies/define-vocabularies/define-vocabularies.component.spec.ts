import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineVocabulariesComponent } from './define-vocabularies.component';

describe('DefineVocabulariesComponent', () => {
  let component: DefineVocabulariesComponent;
  let fixture: ComponentFixture<DefineVocabulariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ DefineVocabulariesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefineVocabulariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
