import { Route } from '@angular/router';
import { TestUploadComponent } from './test-upload/component/test-upload/test-upload.component';
import { FindTestDataComponent } from './test-upload/component/find-test-data/find-test-data.component';

export const appRoutes: Route[] = [
  { path: 'upload', component: TestUploadComponent },
  { path: 'findData', component: FindTestDataComponent },
];
