import { TestBed } from '@angular/core/testing';

import { PacksService } from './packs.service';

describe('PacksService', () => {
  let service: PacksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
