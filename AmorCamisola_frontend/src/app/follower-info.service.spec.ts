import { TestBed } from '@angular/core/testing';

import { FollowerInfoService } from './follower-info.service';

describe('FollowerInfoService', () => {
  let service: FollowerInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FollowerInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
