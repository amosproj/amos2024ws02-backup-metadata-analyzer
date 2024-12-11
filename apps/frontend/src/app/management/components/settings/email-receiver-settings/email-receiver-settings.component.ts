import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailType } from 'apps/frontend/src/app/shared/types/email';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
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

  addEmail() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      const newEmail = {
        email: this.emailForm.get('email')?.value,
      };

      const currentEmails = this.emailsSubject$.getValue();

      this.emailForm.reset();
      this.showEmailModal = false;
    }
  }

  removeEmail(emailToRemove: EmailType[]) {
    // implement forkjion ... 
    //this.emailService.deleteEmail(emailToRemove);
  }

  saveChanges() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
