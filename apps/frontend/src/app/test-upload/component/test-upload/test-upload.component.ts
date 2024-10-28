import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestUploadServiceService } from '../../service/test-upload-service.service';
import { HelloWorldService } from '../../../statistics/service/hello-world.service';

@Component({
  selector: 'app-test-upload',
  templateUrl: './test-upload.component.html',
  styleUrl: './test-upload.component.css',
})
export class TestUploadComponent {
  textInput: string = '';

  constructor(
    private http: HttpClient,
    private readonly testUploadService: TestUploadServiceService,
    private readonly helloWorldService: HelloWorldService
  ) {}

/*   helloWorld() {
    console.log('Hello WOrld!');
    this.helloWorldService.getHelloWorld().subscribe({
      next: (response) => (this.textarea = response),
      error: (error) => console.error('Error fetching hello world:', error),
    });
  } */

  onSubmit(): void {
    this.testUploadService.upload(this.textInput);
  }
}