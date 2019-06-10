import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalibrCurveComponent } from './calibr-curve.component';

describe('CalibrCurveComponent', () => {
  let component: CalibrCurveComponent;
  let fixture: ComponentFixture<CalibrCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalibrCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalibrCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
