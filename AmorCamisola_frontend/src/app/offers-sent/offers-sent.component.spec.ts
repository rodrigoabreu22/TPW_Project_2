import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersSentComponent } from './offers-sent.component';

describe('OffersSentComponent', () => {
  let component: OffersSentComponent;
  let fixture: ComponentFixture<OffersSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersSentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
