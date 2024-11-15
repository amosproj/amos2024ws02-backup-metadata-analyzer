import { Component } from '@angular/core';
import {
  Data,
  TestUploadService,
} from '../../service/test-upload-service.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-find-test-data',
  templateUrl: './find-test-data.component.html',
  styleUrl: './find-test-data.component.css',
})
export class FindTestDataComponent {
  data: Data | undefined;

  idInput: string = '';

  constructor(private readonly testUploadService: TestUploadService) {}

  async onSubmit(): Promise<void> {
    this.data = await firstValueFrom(
      this.testUploadService.getData(this.idInput)
    );
  }
}