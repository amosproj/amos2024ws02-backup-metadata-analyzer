import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUploadComponent } from './test-upload.component';
import { HttpClient } from '@angular/common/http';
import { TestUploadService } from '../../service/test-upload-service.service';
import { BASE_URL } from '../../../shared/types/configuration';

describe('TestUploadComponent', () => {
  let component: TestUploadComponent;
  let fixture: ComponentFixture<TestUploadComponent>;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestUploadComponent],
      imports: [HttpClientTestingModule], //TODO: deprecated
      providers: [TestUploadService, { provide: BASE_URL, useValue: 'test' }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestUploadComponent);
    component = fixture.componentInstance;
    httpClient = TestBed.inject(HttpClient);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject HttpClient', () => {
    expect(httpClient).toBeTruthy();
  });

  it('should have HttpClient as a dependency', () => {
    const httpClientDependency = TestBed.inject(HttpClient);
    expect(httpClientDependency instanceof HttpClient).toBeTruthy();
  });

  it('should maintain HttpClient instance across tests', () => {
    const firstInstance = TestBed.inject(HttpClient);
    const secondInstance = TestBed.inject(HttpClient);
    expect(firstInstance).toBe(secondInstance);
  });
});
