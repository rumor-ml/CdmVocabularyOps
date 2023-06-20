import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturesComponent } from './fixtures.component';

describe('FixturesComponent', () => {
  let component: FixturesComponent;
  let fixture: ComponentFixture<FixturesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FixturesComponent]
    });
    fixture = TestBed.createComponent(FixturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
