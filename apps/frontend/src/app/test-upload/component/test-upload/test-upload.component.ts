import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestUploadService } from '../../service/test-upload-service.service';

@Component({
  selector: 'app-test-upload',
  templateUrl: './test-upload.component.html',
  styleUrl: './test-upload.component.css',
})
export class TestUploadComponent {
  textInput: string = '';
  uploadID: string = '';

  constructor(private readonly testUploadService: TestUploadService) {}

  onSubmit(): void {
    this.testUploadService
      .upload(this.textInput)
      .subscribe((response) => (this.uploadID = response));
  }
}
