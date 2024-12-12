import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailReceiverSettingsComponent } from './email-receiver-settings.component';
import { EmailReceiverService } from '../../../services/email-receiver/email-receiver.service';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('EmailReceiverSettingsComponent', () => {
  let component: EmailReceiverSettingsComponent;
  let emailServiceMock: any;

  const mockEmails = [
    { id: 1, mail: 'test1@example.com' },
    { id: 2, mail: 'test2@example.com' },
  ];

  beforeEach(() => {
    emailServiceMock = {
      getAllEmailReceiver: vi.fn().mockReturnValue(of(mockEmails)),
      deleteEmail: vi.fn().mockReturnValue(of({})),
      updateEmailReceiver: vi
        .fn()
        .mockReturnValue(of({ id: 3, mail: 'new@example.com' })),
    };

    component = new EmailReceiverSettingsComponent(
      new FormBuilder(),
      emailServiceMock
    );
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load email receivers on init', () => {
    component.ngOnInit();
    expect(emailServiceMock.getAllEmailReceiver).toHaveBeenCalled();
    expect(component['emailsSubject$'].getValue()).toEqual(mockEmails);
  });

  it('should handle error when loading emails', () => {
    emailServiceMock.getAllEmailReceiver = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Failed to load')));
    component.ngOnInit();
    expect(component.isLoading).toBeFalsy();
  });

  it('should remove selected emails', () => {
    const emailsToRemove = [
      { ...mockEmails[0], id: mockEmails[0].id.toString() },
    ];
    component['emailsSubject$'].next(
      mockEmails.map((email) => ({ ...email, id: email.id.toString() }))
    );

    component.removeEmail(emailsToRemove);

    expect(emailServiceMock.deleteEmail).toHaveBeenCalledWith(
      emailsToRemove[0].id
    );
    expect(component['emailsSubject$'].getValue()).toEqual([
      { ...mockEmails[1], id: mockEmails[1].id.toString() },
    ]);
  });
  it('should handle error when removing emails', () => {
    emailServiceMock.deleteEmail = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Failed to delete')));

    const consoleSpy = vi.spyOn(console, 'error');
    component.removeEmail([
      { ...mockEmails[0], id: mockEmails[0].id.toString() },
    ]);

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
  });
  it('should save new email when form is valid', () => {
    const newEmail = 'new@example.com';
    component.emailForm.patchValue({ email: newEmail });

    component.saveChanges();

    expect(emailServiceMock.updateEmailReceiver).toHaveBeenCalledWith({
      mail: newEmail,
    });
    expect(component.showEmailModal).toBeFalsy();
  });

  it('should handle duplicate email error', () => {
    emailServiceMock.updateEmailReceiver = vi
      .fn()
      .mockReturnValue(throwError(() => ({ status: 409 })));

    component.emailForm.patchValue({ email: 'duplicate@example.com' });
    component.saveChanges();

    expect(component.modalError).toBe('This email already exists');
  });

  it('should handle generic error when saving email', () => {
    emailServiceMock.updateEmailReceiver = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Failed to save')));

    component.emailForm.patchValue({ email: 'test@example.com' });
    component.saveChanges();

    expect(component.modalError).toBe(
      'Failed to create email. Please try again.'
    );
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = vi.spyOn(component['destroy$'], 'next');
    const completeSpy = vi.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
