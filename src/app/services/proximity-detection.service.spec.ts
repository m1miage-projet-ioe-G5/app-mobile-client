import { TestBed } from '@angular/core/testing';

import { ProximityDetectionService } from './proximity-detection.service';

describe('ProximityDetectionService', () => {
  let service: ProximityDetectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProximityDetectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
