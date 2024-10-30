import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindTestDataComponent } from './find-test-data.component';

describe('FindTestDataComponent', () => {
  let component: FindTestDataComponent;
  let fixture: ComponentFixture<FindTestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FindTestDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindTestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
