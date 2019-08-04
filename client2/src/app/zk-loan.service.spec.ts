import { TestBed } from '@angular/core/testing';

import { ZkLoanService } from './zk-loan.service';


describe('ZkLoanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZkLoanService = TestBed.get(ZkLoanService);
    expect(service).toBeTruthy();
  });
});
