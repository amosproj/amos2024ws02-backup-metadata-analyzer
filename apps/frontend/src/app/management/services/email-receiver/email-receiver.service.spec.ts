import { TestBed } from '@angular/core/testing';

import { EmailReceiverService } from './email-receiver.service';

describe('EmailReceiverService', () => {
  let service: EmailReceiverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailReceiverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
