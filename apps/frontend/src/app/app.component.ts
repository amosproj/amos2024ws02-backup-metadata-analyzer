import { Component, ViewChild } from '@angular/core';
import { NotificationSettingsComponent } from './management/components/settings/notification-settings/notification-settings.component';
import { AnalyzerService } from './shared/services/analyzer-service/analyzer-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'metadata-analyzer-frontend';
  @ViewChild(NotificationSettingsComponent)
  private notificationSettings!: NotificationSettingsComponent;

  isRefreshing = false;

  constructor(private readonly analyzerService: AnalyzerService) {}

  openNotificationSettingsModal() {
    this.notificationSettings.open();
  }

  /**
   * Refresh the data and spin until it is done.
   */
  refresh() {
    this.isRefreshing = true;
    this.analyzerService.refresh().subscribe({
      next: () => {
        console.log('Refresh initiated');
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error('Failed to refresh', error);
        this.isRefreshing = false;
      },
    });
  }
}
