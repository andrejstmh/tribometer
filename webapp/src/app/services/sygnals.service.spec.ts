import { TestBed } from '@angular/core/testing';

import { SignalsService } from './signals.service';

describe('SignalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SignalsService = TestBed.get(SignalsService);
    expect(service).toBeTruthy();
  });
});
