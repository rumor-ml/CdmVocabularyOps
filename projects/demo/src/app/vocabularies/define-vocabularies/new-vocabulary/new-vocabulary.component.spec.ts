import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVocabularyComponent } from './new-vocabulary.component';

describe('NewVocabularyComponent', () => {
  let component: NewVocabularyComponent;
  let fixture: ComponentFixture<NewVocabularyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NewVocabularyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewVocabularyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
