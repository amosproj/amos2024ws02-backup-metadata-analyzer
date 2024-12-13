import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogComponent } from '../component/confirm-dialog/confirm-dialog.component';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injector,
  EmbeddedViewRef,
} from '@angular/core';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let componentFactoryResolver: ComponentFactoryResolver;
  let appRef: ApplicationRef;
  let injector: Injector;
  let mockComponentRef: Partial<ComponentRef<ConfirmDialogComponent>>;
  let mockHostView: Partial<EmbeddedViewRef<any>>;

  beforeEach(() => {
    // Setup mock host view
    mockHostView = {
      detectChanges: vi.fn(),
      markForCheck: vi.fn(),
      detach: vi.fn(),
      destroy: vi.fn(),
      destroyed: false,
      rootNodes: [document.createElement('div')],
    } as Partial<EmbeddedViewRef<any>>;

    // Setup mock component reference
    mockComponentRef = {
      instance: {
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        confirmButtonClass: '',
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        confirm: function (): void {
          throw new Error('Function not implemented.');
        },
        cancel: function (): void {
          throw new Error('Function not implemented.');
        },
      },
      hostView: mockHostView as any,
      destroy: vi.fn(),
    };

    // Setup service dependencies
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

    // Create service
    service = new ConfirmDialogService(
      componentFactoryResolver,
      appRef,
      injector
    );

    // Mock document.body.appendChild
    vi.spyOn(document.body, 'appendChild').mockImplementation(
      () => null as any
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null modalComponentRef', () => {
      expect(service['modalComponentRef']).toBeNull();
    });
  });

  describe('confirm', () => {
    it('should create and show confirmation dialog with default options', async () => {
      const confirmPromise = service.confirm();

      expect(
        componentFactoryResolver.resolveComponentFactory
      ).toHaveBeenCalledWith(ConfirmDialogComponent);
      expect(appRef.attachView).toHaveBeenCalledWith(mockHostView);
      expect(mockComponentRef.instance?.isOpen).toBe(true);
    });

    it('should create dialog with custom options', async () => {
      const options = {
        title: 'Custom Title',
        message: 'Custom Message',
        confirmText: 'Yes',
        cancelText: 'No',
        confirmButtonClass: 'btn-danger',
      };

      const confirmPromise = service.confirm(options);

      expect(mockComponentRef.instance?.title).toBe(options.title);
      expect(mockComponentRef.instance?.message).toBe(options.message);
      expect(mockComponentRef.instance?.confirmText).toBe(options.confirmText);
      expect(mockComponentRef.instance?.cancelText).toBe(options.cancelText);
      expect(mockComponentRef.instance?.confirmButtonClass).toBe(
        options.confirmButtonClass
      );
    });
    it('should resolve true and remove component on confirm', async () => {
      const confirmPromise = service.confirm();

      // Simulate confirmation
      const { onConfirm } = mockComponentRef.instance as ConfirmDialogComponent;
      onConfirm();

      const result = await confirmPromise;
      expect(result).toBe(true);
      expect(appRef.detachView).toHaveBeenCalledWith(mockHostView);
      expect(mockComponentRef.destroy).toHaveBeenCalled();
    });

    it('should resolve false and remove component on cancel', async () => {
      const confirmPromise = service.confirm();

      // Simulate cancellation
      const { onCancel } = mockComponentRef.instance as ConfirmDialogComponent;
      (onCancel as Function)();

      const result = await confirmPromise;
      expect(result).toBe(false);
      expect(appRef.detachView).toHaveBeenCalledWith(mockHostView);
      expect(mockComponentRef.destroy).toHaveBeenCalled();
    });
  });

  describe('handleConfirmation', () => {
    it('should execute onConfirm callback when confirmed', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const options = { title: 'Test' };

      vi.spyOn(service, 'confirm').mockResolvedValue(true);

      await service.handleConfirmation(options, onConfirm, onCancel);

      expect(onConfirm).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should execute onCancel callback when cancelled', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const options = { title: 'Test' };

      vi.spyOn(service, 'confirm').mockResolvedValue(false);

      await service.handleConfirmation(options, onConfirm, onCancel);

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });

    it('should not call onCancel if not provided and cancelled', async () => {
      const onConfirm = vi.fn();
      vi.spyOn(service, 'confirm').mockResolvedValue(false);

      await service.handleConfirmation({}, onConfirm);

      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should handle errors in confirmation flow', async () => {
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

    it('should handle errors in onConfirm callback', async () => {
      const error = new Error('Confirm error');
      const onConfirm = vi.fn().mockRejectedValue(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.spyOn(service, 'confirm').mockResolvedValue(true);

      await service.handleConfirmation({}, onConfirm);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in confirmation flow:',
        error
      );
    });
  });

  describe('component lifecycle', () => {
    it('should properly clean up when removing component', () => {
      service['modalComponentRef'] =
        mockComponentRef as ComponentRef<ConfirmDialogComponent>;

      service['removeComponent']();

      expect(appRef.detachView).toHaveBeenCalledWith(mockHostView);
      expect(mockComponentRef.destroy).toHaveBeenCalled();
      expect(service['modalComponentRef']).toBeNull();
    });

    it('should handle removeComponent when modalComponentRef is null', () => {
      service['modalComponentRef'] = null;

      expect(() => service['removeComponent']()).not.toThrow();
      expect(appRef.detachView).not.toHaveBeenCalled();
    });
  });
});
