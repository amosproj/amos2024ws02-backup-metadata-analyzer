import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface Data {
  text: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class TestUploadServiceService {
  public uploadNewID: string = '';
  constructor(private readonly http: HttpClient) {}

  upload(input: string): Observable<string> {
    const payload = { text: input };

    return this.http.post<Data>('http://localhost:3000/api/demo', payload).pipe(
      map((response) => {
        return response.id;
      })
    );
  }

  // bc0126ea-525f-4525-abd9-609e41ae16ec
  getData(id: string): Observable<Data> {
    return this.http.get<Data>(`http://localhost:3000/api/demo/${id}`).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
