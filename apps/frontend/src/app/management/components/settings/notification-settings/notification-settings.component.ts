import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, forkJoin, Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../services/alert-notification/notification.service';
import { AlertType } from '../../../../shared/types/alertType';
import { AlertServiceService } from '../../../../shared/services/alert-service/alert-service.service';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.css',
})
export class NotificationSettingsComponent implements OnDestroy, OnInit {
  isLoading = false;
  isSaving = false;
  isOpen = false;
  settingsForm: FormGroup;

  private notificationSubject$ = new BehaviorSubject<AlertType[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: NotificationService,
    private alertService: AlertServiceService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      notifications: this.fb.array([]),
    });
  }
  /**
   * Get the notification controls from the form array
   */
  get notificationControls(): FormArray {
    return this.settingsForm.get('notifications') as FormArray;
  }

  ngOnInit(): void {
    this.loadNotificationSettings();
  }

  open() {
    this.isOpen = true;
  }
  /**
   * Load notification settings
   */
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
  /**
   * Initialize the form with the notification settings
   * @param settings includes the notification settings for each AlertType
   */
  initForm(settings: AlertType[]): void {
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
  /**
   * Save the notification settings
   * Use forkJoin to update all settings at once
   */
  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.isLoading = true;
      const notifications = this.notificationControls.value as AlertType[];

      const updateRequests = notifications.map((notification) =>
        this.settingsService.updateNotificationSettings(notification)
      );

      forkJoin(updateRequests)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedSettings) => {
            this.notificationSubject$.next(updatedSettings);
            this.isLoading = false;
            this.isOpen = false;
            this.alertService.refresh();
          },
          error: () => {
            this.isLoading = false;
          },
        });
    }
  }

  close() {
    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this.isOpen = false;
    this.destroy$.next();
    this.destroy$.complete();
  }
}
