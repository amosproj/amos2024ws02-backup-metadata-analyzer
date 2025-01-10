import { Route } from '@angular/router';
import { TestUploadComponent } from './test-upload/component/test-upload/test-upload.component';
import { FindTestDataComponent } from './test-upload/component/find-test-data/find-test-data.component';
import { OverviewPageComponent } from './backups-overview-page/component/overview-page.component';
import { EmailReceiverSettingsComponent } from './management/components/settings/email-receiver-settings/email-receiver-settings.component';
import { BackupStatisticsPageComponent } from './backup-statistics-page/component/backup-statistics-page.component';
import { UserManualComponent } from './management/components/user-manual/user-manual/user-manual.component';

export const appRoutes: Route[] = [
  { path: 'upload', component: TestUploadComponent },
  { path: 'findData', component: FindTestDataComponent },
  { path: 'email-receiver', component: EmailReceiverSettingsComponent},
  { path: 'backup-statistics', component: BackupStatisticsPageComponent },
  { path: 'user-manual', component: UserManualComponent },
  { path: '', component: OverviewPageComponent },

];
