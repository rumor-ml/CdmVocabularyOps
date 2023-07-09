import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePreviewComponent } from './table-preview.component';

describe('TablePreviewComponent', () => {
  let component: TablePreviewComponent;
  let fixture: ComponentFixture<TablePreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TablePreviewComponent]
    });
    fixture = TestBed.createComponent(TablePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
