import { TestBed } from '@angular/core/testing';

import { SygnalsService } from './sygnals.service';

describe('SygnalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SygnalsService = TestBed.get(SygnalsService);
    expect(service).toBeTruthy();
  });
});
