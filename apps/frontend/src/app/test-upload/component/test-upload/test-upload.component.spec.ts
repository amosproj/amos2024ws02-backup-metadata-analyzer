import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUploadComponent } from './test-upload.component';
import { TestUploadServiceService } from '../../service/test-upload-service.service';
import { BASE_URL } from '../../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClarityModule } from '@clr/angular';
import { RouterTestingModule } from '@angular/router/testing';

describe('TestUploadComponent', () => {
  let component: TestUploadComponent;
  let fixture: ComponentFixture<TestUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestUploadComponent],
      imports: [HttpClientTestingModule, ClarityModule, RouterTestingModule],
      providers: [
        {provide: BASE_URL, useValue: TestUploadServiceService},
        TestUploadServiceService
      ]
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
