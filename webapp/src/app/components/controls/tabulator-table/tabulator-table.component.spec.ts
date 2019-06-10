import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabulatorTableComponent } from './tabulator-table.component';

describe('TabulatorTableComponent', () => {
  let component: TabulatorTableComponent;
  let fixture: ComponentFixture<TabulatorTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabulatorTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabulatorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
