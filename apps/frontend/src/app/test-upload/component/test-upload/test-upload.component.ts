import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestUploadServiceService } from '../../service/test-upload-service.service';

@Component({
  selector: 'app-test-upload',
  templateUrl: './test-upload.component.html',
  styleUrl: './test-upload.component.css',
})
export class TestUploadComponent {
  textInput: string = '';
  uploadID: string = '';

  constructor(
    private readonly testUploadService: TestUploadServiceService
  ) {}

  onSubmit(): void {}
}
