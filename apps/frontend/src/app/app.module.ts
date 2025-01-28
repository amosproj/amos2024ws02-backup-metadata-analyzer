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
  barsIcon,
  bellIcon,
  bookIcon,
  ClarityIcons,
  cogIcon,
  dataClusterIcon,
  envelopeIcon,
  errorStandardIcon,
  filterIcon,
  helpIcon,
  historyIcon,
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
import { FactsPanelComponent } from './backups-overview-page/component/facts-panel/facts-panel.component';
import { UserManualComponent } from './management/components/user-manual/user-manual/user-manual.component';
import { AlertPageComponent } from './alert-page/component/alert-page/alert-page.component';
import { DatePipe } from '@angular/common';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay/loading-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
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
    FactsPanelComponent,
    UserManualComponent,
    AlertPageComponent,
    LoadingOverlayComponent,
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
  providers: [{ provide: BASE_URL, useValue: 'http://localhost:3000/api' }, DatePipe],
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
      infoStandardIcon,
      barsIcon,
      historyIcon
    );
  }
}
