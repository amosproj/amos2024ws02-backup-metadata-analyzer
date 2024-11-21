import { Component } from '@angular/core';
import { AlertServiceService } from '../service/alert-service.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  constructor(private readonly alertService: AlertServiceService) {}
}
