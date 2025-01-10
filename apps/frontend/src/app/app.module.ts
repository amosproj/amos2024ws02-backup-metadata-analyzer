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
  bookIcon,
  ClarityIcons,
  cogIcon,
  dataClusterIcon,
  envelopeIcon,
  errorStandardIcon,
  filterIcon,
  helpIcon,
  homeIcon,
  infoStandardIcon,
  lineChartIcon,
  lockIcon,
  plusIcon,
  refreshIcon,
  searchIcon,
  tableIcon,
  tagIcon,
  trashIcon,
  uploadCloudIcon,
  warningStandardIcon,
} from '@cds/core/icon';
import { NgxEchartsModule } from 'ngx-echarts';
import { TestUploadComponent } from './test-upload/component/test-upload/test-upload.component';
import { FindTestDataComponent } from './test-upload/component/find-test-data/find-test-data.component';
import { OverviewPageComponent } from './backups-overview-page/component/overview-page.component';
import { BASE_URL } from './shared/types/configuration';
import { AlertComponent } from './backups-overview-page/component/alert-panel/component/alert.component';
import { NotificationSettingsComponent } from './management/components/settings/notification-settings/notification-settings.component';
import { EmailReceiverSettingsComponent } from './management/components/settings/email-receiver-settings/email-receiver-settings.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/component/confirm-dialog/confirm-dialog.component';
import { DataStoresComponent } from './backups-overview-page/component/data-stores-panel/data-stores.component';
import { InformationPanelComponent } from './backups-overview-page/component/information-panel/information-panel.component';
import { BackupTableComponent } from './backup-statistics-page/component/backup-table/backup-table.component';
import { SidePanelComponent } from './shared/components/filter-side-panel/side-panel.component';
import { BackupStatisticsPageComponent } from './backup-statistics-page/component/backup-statistics-page.component';
import { UserManualComponent } from './management/components/user-manual/user-manual/user-manual.component';
import { AlertPageComponent } from './alert-page/component/alert-page/alert-page.component';

@NgModule({
  declarations: [
    AppComponent,
    TestUploadComponent,
    FindTestDataComponent,
    OverviewPageComponent,
    AlertComponent,
    NotificationSettingsComponent,
    EmailReceiverSettingsComponent,
    ConfirmDialogComponent,
    DataStoresComponent,
    InformationPanelComponent,
    BackupTableComponent,
    SidePanelComponent,
    BackupStatisticsPageComponent,
    UserManualComponent,
    AlertPageComponent,
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
      refreshIcon,
      helpIcon,
      bookIcon,
      lineChartIcon,
      infoStandardIcon
    );
  }
}
