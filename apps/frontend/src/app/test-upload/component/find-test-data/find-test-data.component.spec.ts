import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BASE_URL } from '../../../shared/types/configuration';
import { FindTestDataComponent } from './find-test-data.component';
import { TestUploadServiceService } from '../../service/test-upload-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClarityModule } from '@clr/angular';

describe('FindTestDataComponent', () => {
  let component: FindTestDataComponent;
  let fixture: ComponentFixture<FindTestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FindTestDataComponent],
      imports: [HttpClientTestingModule, ClarityModule],
      providers: [
        {provide: BASE_URL, useValue: TestUploadServiceService},
        TestUploadServiceService
      ]
      
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
