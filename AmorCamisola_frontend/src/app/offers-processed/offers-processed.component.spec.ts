import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersProcessedComponent } from './offers-processed.component';

describe('OffersProcessedComponent', () => {
  let component: OffersProcessedComponent;
  let fixture: ComponentFixture<OffersProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
