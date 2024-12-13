import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogComponent } from '../component/confirm-dialog/confirm-dialog.component';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
} from '@angular/core';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let componentFactoryResolver: ComponentFactoryResolver;
  let appRef: ApplicationRef;
  let injector: Injector;
  let mockComponentRef: Partial<ComponentRef<ConfirmDialogComponent>>;

  beforeEach(() => {
    mockComponentRef = {
      instance: {
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        confirmButtonClass: '',
        onConfirm: function (): void {
          throw new Error('Function not implemented.');
        },
        onCancel: function (): void {
          throw new Error('Function not implemented.');
        },
        confirm: function (): void {
          throw new Error('Function not implemented.');
        },
        cancel: function (): void {
          throw new Error('Function not implemented.');
        },
      },
      hostView: {
        detectChanges: vi.fn(),
        markForCheck: vi.fn(),
        detach: vi.fn(),
        destroy: vi.fn(),
        destroyed: false,
        onDestroy: function (callback: Function): void {
          throw new Error('Function not implemented.');
        },
        checkNoChanges: function (): void {
          throw new Error('Function not implemented.');
        },
        reattach: function (): void {
          throw new Error('Function not implemented.');
        },
      },
      destroy: vi.fn(),
    };

    componentFactoryResolver = {
      resolveComponentFactory: vi.fn().mockReturnValue({
        create: vi.fn().mockReturnValue(mockComponentRef),
      }),
    } as any;

    appRef = {
      attachView: vi.fn(),
      detachView: vi.fn(),
    } as any;

    injector = {} as Injector;

    service = new ConfirmDialogService(
      componentFactoryResolver,
      appRef,
      injector
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('confirm', () => {
    it('should create and show confirmation dialog', async () => {
      const confirmPromise = service.confirm({ title: 'Test Title' });

      expect(
        componentFactoryResolver.resolveComponentFactory
      ).toHaveBeenCalledWith(ConfirmDialogComponent);
      expect(appRef.attachView).toHaveBeenCalled();
      expect(mockComponentRef.instance).toHaveProperty('isOpen', true);
      expect(mockComponentRef.instance).toHaveProperty('title', 'Test Title');

      // Simulate confirmation
      (mockComponentRef.instance as any).onConfirm();
      const result = await confirmPromise;
      expect(result).toBe(true);
    });

    it('should handle cancellation', async () => {
      const confirmPromise = service.confirm();

      // Simulate cancellation
      (mockComponentRef.instance as any).onCancel();
      const result = await confirmPromise;
      expect(result).toBe(false);
    });
  });

  describe('handleConfirmation', () => {
    it('should execute onConfirm callback when confirmed', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const options = { title: 'Test' };

      const confirmSpy = vi.spyOn(service, 'confirm').mockResolvedValue(true);

      await service.handleConfirmation(options, onConfirm, onCancel);

      expect(confirmSpy).toHaveBeenCalledWith(options);
      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should execute onCancel callback when cancelled', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const options = { title: 'Test' };

      const confirmSpy = vi.spyOn(service, 'confirm').mockResolvedValue(false);

      await service.handleConfirmation(options, onConfirm, onCancel);

      expect(confirmSpy).toHaveBeenCalledWith(options);
      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const onConfirm = vi.fn();
      const error = new Error('Test error');
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.spyOn(service, 'confirm').mockRejectedValue(error);

      await service.handleConfirmation({}, onConfirm);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in confirmation flow:',
        error
      );
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
