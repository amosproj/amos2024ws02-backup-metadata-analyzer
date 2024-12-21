import { Route } from '@angular/router';
import { TestUploadComponent } from './test-upload/component/test-upload/test-upload.component';
import { FindTestDataComponent } from './test-upload/component/find-test-data/find-test-data.component';
import { BackupsComponent } from './backups-overview/component/backups.component';
import { EmailReceiverSettingsComponent } from './management/components/settings/email-receiver-settings/email-receiver-settings.component';

export const appRoutes: Route[] = [
  { path: 'upload', component: TestUploadComponent },
  { path: 'findData', component: FindTestDataComponent },
  { path: 'email-receiver', component: EmailReceiverSettingsComponent},
  { path: '', component: BackupsComponent },

];
