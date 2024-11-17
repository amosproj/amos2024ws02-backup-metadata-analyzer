import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindTestDataComponent } from './find-test-data.component';
import { BASE_URL } from '../../../shared/types/configuration';
import { HttpClient } from '@angular/common/http';
import { ClarityModule } from '@clr/angular';

describe('FindTestDataComponent', () => {
  let component: FindTestDataComponent;
  let fixture: ComponentFixture<FindTestDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FindTestDataComponent],
      providers: [
        { provide: BASE_URL, useValue: 'test' },
        {
          provide: HttpClient,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
      imports: [ClarityModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FindTestDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct selector', () => {
    const element = fixture.debugElement.nativeElement;
    expect(element.tagName.toLowerCase()).toBe('app-find-test-data');
  });

  it('should have associated template file', () => {
    const template = (component as any).templateUrl;
    expect(template).toBe('./find-test-data.component.html');
  });

  it('should have associated style file', () => {
    const style = (component as any).styleUrl;
    expect(style).toBe('./find-test-data.component.css');
  });

  it('should be defined after initialization', () => {
    expect(fixture).toBeDefined();
    expect(component).toBeDefined();
  });

  it('should render in the DOM', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled).toBeTruthy();
  });
});
