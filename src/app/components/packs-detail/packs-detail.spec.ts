import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacksDetail } from './packs-detail';

describe('PacksDetail', () => {
  let component: PacksDetail;
  let fixture: ComponentFixture<PacksDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacksDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacksDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
