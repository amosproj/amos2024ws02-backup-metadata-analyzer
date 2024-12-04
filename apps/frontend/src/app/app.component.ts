import { Component, ViewChild } from '@angular/core';
import { map } from 'rxjs';
import { NotificationSettingsComponent } from './management/components/settings/notification-settings/notification-settings.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'metadata-analyzer-frontend';
  @ViewChild(NotificationSettingsComponent)
  private notificationSettings!: NotificationSettingsComponent;
 

  constructor() {}

  openNotificationSettingsModal() {
    this.notificationSettings.open();
  }


}
