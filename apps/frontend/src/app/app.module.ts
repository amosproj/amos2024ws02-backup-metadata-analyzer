import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import {
  angleIcon,
  bellIcon,
  ClarityIcons,
  cogIcon,
  dataClusterIcon,
  envelopeIcon,
  errorStandardIcon,
  filterIcon, helpIcon,
  homeIcon,
  lockIcon,
  plusIcon,
  searchIcon,
  tableIcon,
  tagIcon,
  trashIcon,
  uploadCloudIcon,
  warningStandardIcon
} from '@cds/core/icon';
import { NgxEchartsModule } from 'ngx-echarts';
import { TestUploadComponent } from './test-upload/component/test-upload/test-upload.component';
import { FindTestDataComponent } from './test-upload/component/find-test-data/find-test-data.component';
import { BackupsComponent } from './backups-overview/component/backups.component';
import { BASE_URL } from './shared/types/configuration';
import { AlertComponent } from './alert/component/alert.component';
import { NotificationSettingsComponent } from './management/components/settings/notification-settings/notification-settings.component';
import { EmailReceiverSettingsComponent } from './management/components/settings/email-receiver-settings/email-receiver-settings.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/component/confirm-dialog/confirm-dialog.component';
import { DataStoresComponent } from './data-stores/component/data-stores.component';
import { InformationPanelComponent } from './backups-overview/component/information-panel/information-panel.component';
import { BackupTableComponent } from './backups-overview/component/backup-table/backup-table.component';
import { SidePanelComponent } from './backups-overview/component/side-panel/side-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    TestUploadComponent,
    FindTestDataComponent,
    BackupsComponent,
    AlertComponent,
    NotificationSettingsComponent,
    EmailReceiverSettingsComponent,
    ConfirmDialogComponent,
    DataStoresComponent,
    InformationPanelComponent,
    BackupTableComponent,
    SidePanelComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClarityModule,
    NgxEchartsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [{ provide: BASE_URL, useValue: 'http://localhost:3000/api' }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor() {
    ClarityIcons.addIcons(
      uploadCloudIcon,
      homeIcon,
      searchIcon,
      tableIcon,
      warningStandardIcon,
      errorStandardIcon,
      cogIcon,
      bellIcon,
      angleIcon,
      tagIcon,
      dataClusterIcon,
      filterIcon,
      envelopeIcon,
      plusIcon,
      lockIcon,
      trashIcon,
      helpIcon
    );
  }
}
