import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaggiorenneComponent } from './maggiorenne.component';

describe('MaggiorenneComponent', () => {
  let component: MaggiorenneComponent;
  let fixture: ComponentFixture<MaggiorenneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaggiorenneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaggiorenneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
