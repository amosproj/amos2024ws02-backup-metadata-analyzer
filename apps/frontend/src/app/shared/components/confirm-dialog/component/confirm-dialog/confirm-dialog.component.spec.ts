import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;

  beforeEach(() => {
    component = new ConfirmDialogComponent();
  });

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
  });

  it('should call onConfirm and close dialog when confirm is called', () => {
    const mockOnConfirm = vi.fn();
    component.isOpen = true;
    component.onConfirm = mockOnConfirm;

    component.confirm();

    expect(mockOnConfirm).toHaveBeenCalled();
    expect(component.isOpen).toBe(false);
  });

  it('should call onCancel and close dialog when cancel is called', () => {
    const mockOnCancel = vi.fn();
    component.isOpen = true;
    component.onCancel = mockOnCancel;

    component.cancel();

    expect(mockOnCancel).toHaveBeenCalled();
    expect(component.isOpen).toBe(false);
  });

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
});