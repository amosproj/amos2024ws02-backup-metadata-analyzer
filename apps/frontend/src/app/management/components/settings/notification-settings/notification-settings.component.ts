import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  BehaviorSubject,
  finalize,
  forkJoin,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { NotificationSettings } from 'apps/frontend/src/app/shared/types/notifications';

/* interface NotificationSettingsFormGroup {
  creationDateAlert: FormControl<boolean | null>;
  sizeAlert: FormControl<boolean | null>;
  alertEmails: FormControl<boolean | null>;
} */

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.css',
})
export class NotificationSettingsComponent {
  isLoading = false;
  isSaving = false;
  isOpen = false;
  settingsForm: FormGroup;

  private notificationSubject$ = new BehaviorSubject<NotificationSettings[]>(
    []
  );
  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: NotificationService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      notifications: this.fb.array([]),
    });
  }
  get notificationControls(): FormArray {
    return this.settingsForm.get('notifications') as FormArray;
  }

  ngOnInit(): void {
    this.loadNotificationSettings();
  }

  open() {
    this.isOpen = true;
    //this.loadSettings();
  }

  loadNotificationSettings(): void {
    this.isLoading = true;
    this.settingsService
      .getNotificationSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.notificationSubject$.next(settings);
          this.initForm(settings);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  initForm(settings: NotificationSettings[]): void {
    const notificationArray = this.fb.array(
      settings.map((notification) =>
        this.fb.group({
          id: [notification.id],
          name: [notification.name],
          severity: [notification.severity],
          user_active: [notification.user_active],
          master_active: [notification.master_active],
        })
      )
    );
    this.settingsForm.setControl('notifications', notificationArray);
  }

  close() {
    this.isOpen = false;
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.isLoading = true;
      const notifications = this.notificationControls
        .value as NotificationSettings[];

      const updateRequests = notifications.map((notification) =>
        this.settingsService.updateNotificationSettings(notification)
      );

      forkJoin(updateRequests).subscribe({
        next: (updatedSettings) => {
          this.notificationSubject$.next(updatedSettings);
          this.isLoading = false;
          this.isOpen = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }
}
