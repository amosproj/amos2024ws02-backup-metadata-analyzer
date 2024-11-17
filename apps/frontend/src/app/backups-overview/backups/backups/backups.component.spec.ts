import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackupsComponent } from './backups.component';
import { BackupService } from '../../service/backup-service.service';
import { CUSTOM_ELEMENTS_SCHEMA, InjectionToken } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock baseURL or provide a real one
export const baseURL = new InjectionToken<string>('baseURL');

// Mock the `am5` library
const mockAm5 = {
  Root: {
    new: jest.fn().mockReturnValue({
      setThemes: jest.fn(),
      dispose: jest.fn(),
    }),
  },
};

describe('BackupsComponent', () => {
  let component: BackupsComponent;
  let fixture: ComponentFixture<BackupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackupsComponent],
      imports: [HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        BackupService,
        {
          provide: baseURL,
          useValue: 'http://mock-base-url.com',
        },
      ],
    }).compileComponents();

    // Assign the mock `am5` to the global scope≈
    (window as any).am5 = mockAm5;
    beforeEach(() => {
      fixture = TestBed.createComponent(BackupsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize am5 root on component creation', () => {
      expect(mockAm5.Root.new).toHaveBeenCalled();
    });
    // Add more test cases as needed
  });
});
