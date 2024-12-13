import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { ConfirmDialogComponent } from '../component/confirm-dialog/confirm-dialog.component';
import { ConfirmationOptions } from '../../../types/confirmationOptions';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private modalComponentRef: ComponentRef<ConfirmDialogComponent> | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  confirm(options: ConfirmationOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalComponentRef = this.createComponent(ConfirmDialogComponent);
      Object.assign(this.modalComponentRef.instance, {
        isOpen: true,
        ...options,
        onConfirm: () => {
          resolve(true);
          this.removeComponent();
        },
        onCancel: () => {
          resolve(false);
          this.removeComponent();
        },
      });
    });
  }

  private createComponent<T>(component: Type<T>): ComponentRef<T> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0];
    document.body.appendChild(domElem);

    return componentRef;
  }

  private removeComponent(): void {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }
  }

  async handleConfirmation(
    options: ConfirmationOptions,
    onConfirm: () => void,
    onCancel?: () => void
  ): Promise<void> {
    try {
      const result = await this.confirm(options);

      if (result) {
        await onConfirm();
      } else if (onCancel) {
        await onCancel();
      }
    } catch (error) {
      console.error('Error in confirmation flow:', error);
    }
  }
}
