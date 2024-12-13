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

  const mockEmailService = {
    getAllEmailReceiver: vi.fn(),
    deleteEmail: vi.fn(),
    updateEmailReceiver: vi.fn(),
  };

  const mockConfirmDialogService = {
    handleConfirmation: vi.fn(),
  };

  beforeEach(() => {
    emailService = mockEmailService as any;
    confirmDialogService = mockConfirmDialogService as any;
    component = new EmailReceiverSettingsComponent(
      new FormBuilder(),
      emailService,
      confirmDialogService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadEmailReceiver', () => {
    it('should load emails successfully', () => {
      const mockEmails = [{ id: 1, mail: 'test@example.com' }];
      mockEmailService.getAllEmailReceiver.mockReturnValue(of(mockEmails));

      component.loadEmailReceiver();

      expect(component.isLoading).toBe(false);
      (component as any).emailsSubject$.subscribe((emails: EmailType) => {
        expect(emails).toEqual(mockEmails);
      });
    });

    it('should handle error when loading emails', () => {
      mockEmailService.getAllEmailReceiver.mockReturnValue(
        throwError(() => new Error())
      );

      component.loadEmailReceiver();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('removeEmail', () => {
    it('should not proceed if no emails to remove', () => {
      component.removeEmail([]);
      expect(
        mockConfirmDialogService.handleConfirmation
      ).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog and delete emails when confirmed', () => {
      const emailsToRemove: EmailType[] = [
        { id: '1', mail: 'test@example.com' },
      ];
      mockEmailService.deleteEmail.mockReturnValue(of({}));
      mockConfirmDialogService.handleConfirmation.mockImplementation(
        (config, callback) => callback()
      );

      component.removeEmail(emailsToRemove);

      expect(mockConfirmDialogService.handleConfirmation).toHaveBeenCalled();
      expect(mockEmailService.deleteEmail).toHaveBeenCalledWith('1');
    });
  });

  describe('saveChanges', () => {
    it('should create new email when form is valid', () => {
      const newEmail = { mail: 'new@example.com' };
      const createdEmail = { id: 1, mail: 'new@example.com' };
      component.emailForm.controls['email'].setValue('new@example.com');
      mockEmailService.updateEmailReceiver.mockReturnValue(of(createdEmail));

      component.saveChanges();

      expect(mockEmailService.updateEmailReceiver).toHaveBeenCalledWith(
        newEmail
      );
      (component as any).emailsSubject$.subscribe((emails: EmailType) => {
        expect(emails).toContain(createdEmail);
      });
    });

    it('should handle duplicate email error', () => {
      component.emailForm.controls['email'].setValue('existing@example.com');
      mockEmailService.updateEmailReceiver.mockReturnValue(
        throwError(() => ({ status: 409 }))
      );

      component.saveChanges();

      expect(component.modalError).toBe('This email already exists');
    });
  });

  describe('resetForm', () => {
    it('should reset form and clear modal state', () => {
      component.emailForm.controls['email'].setValue('test@example.com');
      component.showEmailModal = true;
      component.modalError = 'Some error';
      component.isLoading = true;

      component.resetForm();

      expect(component.emailForm.controls['email'].value).toBeNull();
      expect(component.showEmailModal).toBe(false);
      expect(component.modalError).toBe('');
      expect(component.isLoading).toBe(false);
    });
  });
});
