import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartSearchComponent } from './smart-search.component';

describe('SmartSearchComponent', () => {
  let component: SmartSearchComponent;
  let fixture: ComponentFixture<SmartSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SmartSearchComponent]
    });
    fixture = TestBed.createComponent(SmartSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
