import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import {
  ClarityIcons,
  errorStandardIcon,
  homeIcon,
  searchIcon,
  tableIcon,
  uploadCloudIcon,
  warningStandardIcon,
  cogIcon,
  bellIcon,
  angleIcon,
  tagIcon,
  dataClusterIcon,
  filterIcon,
} from '@cds/core/icon';
import { NgxEchartsModule } from 'ngx-echarts';
import { TestUploadComponent } from './test-upload/component/test-upload/test-upload.component';
import { FindTestDataComponent } from './test-upload/component/find-test-data/find-test-data.component';
import { BackupsComponent } from './backups-overview/backups/backups/backups.component';
import { BASE_URL } from './shared/types/configuration';
import { AlertComponent } from './alert/component/alert.component';
import { NotificationSettingsComponent } from './management/components/settings/notification-settings/notification-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    TestUploadComponent,
    FindTestDataComponent,
    BackupsComponent,
    AlertComponent,
    NotificationSettingsComponent,
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
      filterIcon
    );
  }
}
