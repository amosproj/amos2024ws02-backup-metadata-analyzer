import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUploadComponent } from './test-upload.component';

describe('TestUploadComponent', () => {
  let component: TestUploadComponent;
  let fixture: ComponentFixture<TestUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
