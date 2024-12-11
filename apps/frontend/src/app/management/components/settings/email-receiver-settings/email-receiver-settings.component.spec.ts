import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailReceiverSettingsComponent } from './email-receiver-settings.component';

describe('EmailReceiverSettingsComponent', () => {
  let component: EmailReceiverSettingsComponent;
  let fixture: ComponentFixture<EmailReceiverSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailReceiverSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailReceiverSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
