import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailReceiverSettingsComponent } from './email-receiver-settings.component';
import { FormBuilder } from '@angular/forms';
import { EmailReceiverService } from '../../../services/email-receiver/email-receiver.service';
import { ConfirmDialogService } from 'apps/frontend/src/app/shared/components/confirm-dialog/service/confirm-dialog.service';
import { of, throwError } from 'rxjs';
import { EmailType } from 'apps/frontend/src/app/shared/types/email';

describe('EmailReceiverSettingsComponent', () => {
  let component: EmailReceiverSettingsComponent;
  let emailService: EmailReceiverService;
  let confirmDialogService: ConfirmDialogService;

  const mockEmails: EmailType[] = [
    { id: '1', mail: 'test1@example.com' },
    { id: '2', mail: 'test2@example.com' },
  ];

  beforeEach(() => {
    emailService = {
      getAllEmailReceiver: vi.fn().mockReturnValue(of(mockEmails)),
      deleteEmail: vi.fn().mockReturnValue(of({})),
      updateEmailReceiver: vi.fn(),
    } as any;

    confirmDialogService = {
      handleConfirmation: vi.fn().mockImplementation((options, onConfirm) => {
        onConfirm();
        return Promise.resolve();
      }),
    } as any;

    component = new EmailReceiverSettingsComponent(
      new FormBuilder(),
      emailService,
      confirmDialogService
    );

    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadEmailReceiver', () => {
    it('should load emails successfully', () => {
      component.loadEmailReceiver();

      expect(component.isLoading).toBe(false);
      expect(emailService.getAllEmailReceiver).toHaveBeenCalled();

      component['emailsSubject$'].subscribe((emails) => {
        expect(emails).toEqual(mockEmails);
      });
    });

    it('should handle error when loading emails', () => {
      emailService.getAllEmailReceiver = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('Failed to load')));

      component.loadEmailReceiver();

      expect(component.isLoading).toBe(false);
      expect(emailService.getAllEmailReceiver).toHaveBeenCalled();
    });
  });

  describe('removeEmail', () => {
    it('should not proceed if no emails to remove', async () => {
      await component.removeEmail([]);

      expect(confirmDialogService.handleConfirmation).not.toHaveBeenCalled();
      expect(emailService.deleteEmail).not.toHaveBeenCalled();
    });

    it('should delete emails when confirmed', async () => {
      const emailsToRemove = [mockEmails[0]];

      await component.removeEmail(emailsToRemove);

      expect(confirmDialogService.handleConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Delete Email Recipients',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }),
        expect.any(Function)
      );
      expect(emailService.deleteEmail).toHaveBeenCalledWith('1');
    });

    it('should handle cancel confirmation', async () => {
      confirmDialogService.handleConfirmation = vi
        .fn()
        .mockImplementation((options, onConfirm, onCancel) => {
          if (onCancel) onCancel();
          return Promise.resolve();
        });

      await component.removeEmail([mockEmails[0]]);

      expect(emailService.deleteEmail).not.toHaveBeenCalled();
    });

    it('should handle error during deletion', async () => {
      emailService.deleteEmail = vi
        .fn()
        .mockReturnValue(throwError(() => new Error('Delete failed')));

      await component.removeEmail([mockEmails[0]]);

      expect(component.isLoading).toBe(false);
    });
  });

  describe('saveChanges', () => {
    it('should not save when form is invalid', () => {
      component.emailForm.controls['email'].setValue('');

      component.saveChanges();

      expect(emailService.updateEmailReceiver).not.toHaveBeenCalled();
    });

    it('should create new email when form is valid', () => {
      const newEmail = { mail: 'new@example.com' };
      const createdEmail = { id: '3', mail: 'new@example.com' };

      emailService.updateEmailReceiver = vi
        .fn()
        .mockReturnValue(of(createdEmail));
      component.emailForm.controls['email'].setValue('new@example.com');

      component.saveChanges();

      expect(emailService.updateEmailReceiver).toHaveBeenCalledWith(newEmail);
      expect(component.showEmailModal).toBe(false);
      expect(component.isLoading).toBe(false);
    });

    it('should handle duplicate email error', () => {
      emailService.updateEmailReceiver = vi
        .fn()
        .mockReturnValue(throwError(() => ({ status: 409 })));
      component.emailForm.controls['email'].setValue('existing@example.com');

      component.saveChanges();

      expect(component.modalError).toBe('This email already exists');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('resetForm', () => {
    it('should reset form and modal state', () => {
      // Setup form with values
      component.emailForm.controls['email'].setValue('test@example.com');
      component.showEmailModal = true;
      component.modalError = 'Some error';
      component.isLoading = true;

      // Reset form
      component.resetForm();

      // Verify reset state
      expect(component.emailForm.get('email')?.value).toBeNull();
      expect(component.showEmailModal).toBe(false);
      expect(component.modalError).toBe('');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete subjects', () => {
      const destroySpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
