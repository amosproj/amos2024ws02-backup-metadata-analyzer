import { Component } from '@angular/core';
import { HelloWorldService } from './statistics/service/hello-world.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'metadata-analyzer-frontend';
 

  constructor() {}


}
