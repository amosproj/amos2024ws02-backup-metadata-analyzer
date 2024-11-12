import { Component } from '@angular/core';
import { TestUploadServiceService } from '../../service/test-upload-service.service';
import { Observable } from 'rxjs';
import { Backup } from '../../../shared/types/backup';

@Component({
  selector: 'app-find-test-data',
  templateUrl: './find-test-data.component.html',
  styleUrl: './find-test-data.component.css',
})
export class FindTestDataComponent {
  backup$: Observable<Backup> | undefined;

  idInput: string = '';

  constructor(
    private readonly testUploadService: TestUploadServiceService
  ) {}

  onSubmit(): void {
    this.backup$ = this.testUploadService.getData(this.idInput);
  }
}
