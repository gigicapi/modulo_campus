import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinorenneComponent } from './minorenne.component';

describe('MinorenneComponent', () => {
  let component: MinorenneComponent;
  let fixture: ComponentFixture<MinorenneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinorenneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinorenneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
