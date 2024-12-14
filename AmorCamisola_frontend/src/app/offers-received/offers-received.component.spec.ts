import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersReceivedComponent } from './offers-received.component';

describe('OffersReceivedComponent', () => {
  let component: OffersReceivedComponent;
  let fixture: ComponentFixture<OffersReceivedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersReceivedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
