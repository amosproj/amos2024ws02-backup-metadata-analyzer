import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { ApplicationModule, InjectionToken } from '@angular/core';
import { BackupsComponent } from './backups.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BackupService } from '../../service/backup-service.service';
import { BASE_URL } from '../../../shared/types/configuration';
import { HttpClient, HttpHandler } from '@angular/common/http';

// Mock the getContext method for HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    imageSmoothingEnabled: false,
    // Add other properties and methods if needed
  }),
});

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  let fixture: ComponentFixture<BackupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackupsComponent],
      imports: [HttpClientTestingModule, ApplicationModule],
      providers: [
        {provide: BASE_URL, useValue: BackupService},
        BackupService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
