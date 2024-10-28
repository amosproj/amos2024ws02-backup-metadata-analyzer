import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestUploadServiceService } from '../../service/test-upload-service.service';

@Component({
  selector: 'app-find-test-data',
  templateUrl: './find-test-data.component.html',
  styleUrl: './find-test-data.component.css',
})
export class FindTestDataComponent {
  idInput: string = '996fc1ec-946c-47bd-83be-d0b112a90a41';
  data: string | undefined;
  id: string | undefined;

  constructor(
    private http: HttpClient,
    private readonly testUploadService: TestUploadServiceService
  ) {}

  onSubmit(): void {
    this.testUploadService.getData(this.idInput).subscribe({
      next: (response) => (
        (this.data = response.text), (this.id = response.id)
      ),
      error: (error) => console.error('Error fetching hello world:', error),
    });
  }
}
