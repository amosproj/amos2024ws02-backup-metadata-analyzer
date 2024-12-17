import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;

  beforeEach(() => {
    component = new ConfirmDialogComponent();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.isOpen).toBe(false);
      expect(component.title).toBe('Confirm Action');
      expect(component.message).toBe('Are you sure you want to proceed?');
      expect(component.confirmText).toBe('Confirm');
      expect(component.cancelText).toBe('Cancel');
      expect(component.confirmButtonClass).toBe('btn btn-primary');
      expect(component.onConfirm).toBeDefined();
      expect(component.onCancel).toBeDefined();
    });

    it('should have default no-op functions for onConfirm and onCancel', () => {
      expect(() => component.onConfirm()).not.toThrow();
      expect(() => component.onCancel()).not.toThrow();
    });
  });

  describe('confirm action', () => {
    it('should call onConfirm and close dialog when confirm is called', () => {
      const mockOnConfirm = vi.fn();
      component.isOpen = true;
      component.onConfirm = mockOnConfirm;

      component.confirm();

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(component.isOpen).toBe(false);
    });

    it('should handle undefined onConfirm without error', () => {
      component.isOpen = true;
      component.onConfirm = undefined as any;

      expect(() => component.confirm()).not.toThrow();
      expect(component.isOpen).toBe(false);
    });
  });

  describe('cancel action', () => {
    it('should call onCancel and close dialog when cancel is called', () => {
      const mockOnCancel = vi.fn();
      component.isOpen = true;
      component.onCancel = mockOnCancel;

      component.cancel();

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(component.isOpen).toBe(false);
    });

    it('should handle undefined onCancel without error', () => {
      component.isOpen = true;
      component.onCancel = undefined as any;

      expect(() => component.cancel()).not.toThrow();
      expect(component.isOpen).toBe(false);
    });
  });

  describe('input properties', () => {
    it('should accept custom button class', () => {
      const customClass = 'btn btn-danger';
      component.confirmButtonClass = customClass;
      expect(component.confirmButtonClass).toBe(customClass);
    });

    it('should accept custom title and message', () => {
      const customTitle = 'Delete Item';
      const customMessage = 'Do you want to delete this item?';

      component.title = customTitle;
      component.message = customMessage;

      expect(component.title).toBe(customTitle);
      expect(component.message).toBe(customMessage);
    });

    it('should accept custom button text', () => {
      const customConfirmText = 'Delete';
      const customCancelText = 'Keep';

      component.confirmText = customConfirmText;
      component.cancelText = customCancelText;

      expect(component.confirmText).toBe(customConfirmText);
      expect(component.cancelText).toBe(customCancelText);
    });

    it('should handle empty string inputs', () => {
      component.title = '';
      component.message = '';
      component.confirmText = '';
      component.cancelText = '';
      component.confirmButtonClass = '';

      expect(component.title).toBe('');
      expect(component.message).toBe('');
      expect(component.confirmText).toBe('');
      expect(component.cancelText).toBe('');
      expect(component.confirmButtonClass).toBe('');
    });
  });

  describe('dialog state', () => {
    it('should toggle isOpen state', () => {
      expect(component.isOpen).toBe(false);

      component.isOpen = true;
      expect(component.isOpen).toBe(true);

      component.isOpen = false;
      expect(component.isOpen).toBe(false);
    });

    it('should close dialog after confirm regardless of callback execution', () => {
      component.isOpen = true;

      component.confirm();
      expect(component.isOpen).toBe(false);
    });

    it('should close dialog after cancel regardless of callback execution', () => {
      component.isOpen = true;
      component.cancel();
      expect(component.isOpen).toBe(false);
    });
  });
});
