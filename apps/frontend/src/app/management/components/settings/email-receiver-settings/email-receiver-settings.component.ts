import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailType } from 'apps/frontend/src/app/shared/types/email';
import {
  BehaviorSubject,
  from,
  mergeMap,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { EmailReceiverService } from '../../../services/email-receiver/email-receiver.service';
import { CustomEmailFilter } from './emailfilter';

@Component({
  selector: 'app-email-receiver-settings',
  templateUrl: './email-receiver-settings.component.html',
  styleUrl: './email-receiver-settings.component.css',
})
export class EmailReceiverSettingsComponent {
  isLoading = false;
  emailForm: FormGroup;
  showEmailModal = false;
  modalError = '';
  protected readonly selectedEmails: EmailType[] = [];

  protected emailsSubject$ = new BehaviorSubject<EmailType[]>([]);
  private readonly destroy$ = new Subject<void>();

  protected emailFilter: CustomEmailFilter;
  protected emailIdFilter: CustomEmailFilter;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailReceiverService
  ) {
    this.emailFilter = new CustomEmailFilter('mail');
    this.emailIdFilter = new CustomEmailFilter('id');

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.loadEmailReceiver();
  }

  loadEmailReceiver(): void {
    this.isLoading = true;
    this.emailService
      .getAllEmailReceiver()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (emails) => {
          this.emailsSubject$.next(emails);
          this.isLoading = false;
        },

        error: (error) => (this.isLoading = false),
      });
  }

  removeEmail(emailsToRemove: EmailType[]) {
    if (!emailsToRemove.length) return;

    this.isLoading = true;

    // Using forkJoin to handle multiple delete requests
    from(emailsToRemove)
      .pipe(
        mergeMap((email) => this.emailService.deleteEmail(email.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          const currentEmails = this.emailsSubject$.getValue();
          const updatedEmails = currentEmails.filter(
            (email) =>
              !emailsToRemove.some((toRemove) => toRemove.id === email.id)
          );
          this.emailsSubject$.next(updatedEmails);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to delete emails:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.selectedEmails.length = 0; // Clear selection
        },
      });
  }

  saveChanges() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.modalError = '';

      const newEmail: Partial<EmailType> = {
        mail: this.emailForm.get('email')?.value,
      };

      this.emailService
        .updateEmailReceiver(newEmail)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdEmail) => {
            const currentEmails = this.emailsSubject$.getValue();
            this.emailsSubject$.next([...currentEmails, createdEmail]);
            this.emailForm.reset();
            this.showEmailModal = false;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Failed to create email:', error);
            this.modalError =
              error.status === 409
                ? 'This email already exists'
                : 'Failed to create email. Please try again.';
            this.isLoading = false;
          },
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
