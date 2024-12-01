import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { NotificationSettings } from 'apps/frontend/src/app/shared/types/notifications';

interface NotificationSettingsFormGroup {
  creationDateAlert: FormControl<boolean | null>;
  sizeAlert: FormControl<boolean | null>;
  alertEmails: FormControl<boolean | null>;
}

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrl: './notification-settings.component.css',
})
export class NotificationSettingsComponent {
  isLoading = false;
  isSaving = false;
  isOpen = false;

  private notificationSubject$ = new Subject<void>();
  readonly settings$: Observable<NotificationSettings>;
  private desttroy$ = new Subject<void>();

  readonly settingsForm: FormGroup<NotificationSettingsFormGroup>;

  constructor(private settingsService: NotificationService) {
    this.settingsForm = new FormGroup<NotificationSettingsFormGroup>({
      creationDateAlert: new FormControl(false, Validators.required),
      sizeAlert: new FormControl(false, Validators.required),
      alertEmails: new FormControl(false, Validators.required),
    });

    // Initialisiere das Observable
    this.settings$ = this.settingsService.getNotificationSettings().pipe(
      map(settings => ({
          creationDateAlert: settings.creationDateAlert ?? true,
          sizeAlert: settings.sizeAlert ?? true,
          alertEmails: settings.alertEmails ?? true
      })),
      tap(normalizedSettings => {
          this.settingsForm.patchValue(normalizedSettings, { emitEvent: true });
      })
    );
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.settingsService
      .getNotificationSettings()
      .pipe(takeUntil(this.desttroy$))
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (updatedSettings) => {
          console.log(updatedSettings);
          this.close();
        },
        error: (error) => {
          console.error('Fehler beim Speichern:', error);
          //  Fehlerbehandlung
        },
      });
  }

  open() {
    this.isOpen = true;
    //this.loadSettings();
  }

  private loadSettings() {}

  close() {
    this.isOpen = false;
  }

  save() {
    if (this.settingsForm.valid) {
        this.isSaving = true;
        const settings = this.settingsForm.value;
        //this.settingsService.updateNotificationSettings(this.settingsForm.value)
        this.close();
    }
}
}
