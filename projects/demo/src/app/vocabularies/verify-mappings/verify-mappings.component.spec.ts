import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyMappingsComponent } from './verify-mappings.component';

describe('VerifyMappingsComponent', () => {
  let component: VerifyMappingsComponent;
  let fixture: ComponentFixture<VerifyMappingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ VerifyMappingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
