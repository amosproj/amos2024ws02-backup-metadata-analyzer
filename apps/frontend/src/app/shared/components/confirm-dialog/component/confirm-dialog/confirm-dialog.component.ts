import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonClass = 'btn btn-primary';
  @Input() onConfirm: () => void = () => {};
  @Input() onCancel: () => void = () => {};

  confirm() {
    if (this.onConfirm) {
      this.onConfirm();
    }
    this.isOpen = false;
  }

  cancel() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.isOpen = false;
  }
}
