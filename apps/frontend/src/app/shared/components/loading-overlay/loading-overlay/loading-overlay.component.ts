import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css'
})
export class LoadingOverlayComponent {
  @Input() isLoading: boolean = false;
  @Input() title = 'Synchronizing Data';
  @Input() subtitle?: string;
}
