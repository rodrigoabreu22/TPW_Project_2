import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersAcceptedComponent } from './offers-accepted.component';

describe('OffersAcceptedComponent', () => {
  let component: OffersAcceptedComponent;
  let fixture: ComponentFixture<OffersAcceptedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersAcceptedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersAcceptedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
