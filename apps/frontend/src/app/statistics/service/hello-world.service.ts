import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelloWorldService {
  constructor(
    //@Inject(APP_CONFIG) private readonly config: Configuration,
    private readonly http: HttpClient
  ) {}

  getHelloWorld(): Observable<string> {
    return this.http
      .get<{ message: string }>(`http://localhost:3000/api/data`)
      .pipe(map((response) => response.message));
  }
}
