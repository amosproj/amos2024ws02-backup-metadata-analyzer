import { Component, ViewChild } from '@angular/core';
import { NotificationSettingsComponent } from './management/components/settings/notification-settings/notification-settings.component';
import { AnalyzerService } from './shared/services/analyzer-service/analyzer-service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'metadata-analyzer-frontend';
  collapsed = true;
  @ViewChild(NotificationSettingsComponent)
  private notificationSettings!: NotificationSettingsComponent;

  isRefreshing = false;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.loadingSubject.asObservable();

  constructor(private readonly analyzerService: AnalyzerService) {}

  openNotificationSettingsModal() {
    this.notificationSettings.open();
  }

  /**
   * Refresh the data and spin until it is done.
   */
  refresh(): void {
    this.isRefreshing = true;
    this.loadingSubject.next(true);
    
    this.analyzerService.refresh().subscribe({
      next: () => {
        console.log('Refresh completed');
        this.isRefreshing = false;
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Failed to refresh', error);
        this.isRefreshing = false;
        this.loadingSubject.next(false);
      },
    });
  }
}
