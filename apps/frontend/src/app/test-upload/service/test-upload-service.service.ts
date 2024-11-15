import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BASE_URL } from '../../shared/types/configuration';

export interface Data {
  text: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class TestUploadService {

  constructor(
    @Inject(BASE_URL) private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  upload(input: string): Observable<string> {
    const payload = { text: input };

    return this.http.post<Data>(`${this.baseUrl}/demo`, payload).pipe(
      map((response) => {
        return response.id;
      })
    );
  }

  getData(id: string): Observable<Data> {
    return this.http.get<Data>(`${this.baseUrl}/demo/${id}`);
  }
}
