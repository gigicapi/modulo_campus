import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleReservationComponent } from './multiple-reservation.component';

describe('MultipleReservationComponent', () => {
  let component: MultipleReservationComponent;
  let fixture: ComponentFixture<MultipleReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleReservationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
