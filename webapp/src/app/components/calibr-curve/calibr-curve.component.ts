import { Component, OnInit } from '@angular/core';

import { SygnalsService, CalibrationCurve, trTotalState } from './../../services/sygnals.service';
import { Observable, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-calibr-curve',
  templateUrl: './calibr-curve.component.html',
  styleUrls: ['./calibr-curve.component.css']
})
export class CalibrCurveComponent implements OnInit {
  selectedCurve = null;
  CCurves = [
    { name: "Friction force calibration curve", path: "clbr_fr", title: ["Voltage, V", "Force, N"] },
    { name: "Load calibration curve", path: "clbr_load", title: ["Voltage, V", "Force, N"] }
    //{ name: "RPM calibration curve", path: "clbr_rpm", title: ["Voltage, V", "RPM"] }
  ]
  CcurvData: CalibrationCurve = null;
  status$: BehaviorSubject<trTotalState> = null;
  constructor(private sygnalServ: SygnalsService) {
    this.status$ = this.sygnalServ.totalstate$;
    this.selectedCurve = this.CCurves[0];
  }
  CurveTable = [{ x: 1, y: 2, select: false }, { x: 2, y: 5, select: false }, { x: 3, y: 10 }, { x: 4, y: 20, select: false }]
  tableSettings: any = {
    layout: "fitColumns",
    columns: [
      { title: "x", field: "x", headerSort: false, width:100, editor: "input", validator: ["min:-1E5", "max:1E5", "numeric"] },
      { title: "y", field: "y", headerSort: false, width:100,editor: "input", validator: ["min:-1E5", "max:1E5", "numeric"] },
      { select: "select", field: "select", headerSort: false, width: 50,align: "center", editor: true, formatter: "tickCross"}
      ],
    validationFailed: function (cell, value, validators) {
      //cell - cell component for the edited cell
      //value - the value that failed validation
      //validatiors - an array of validator objects that failed

      //take action on validation fail
      },
  }
  ngOnInit() {
    this.onSelect(this.CCurves[0]);
  }

  drawChart(cc: CalibrationCurve) {
    //var plt = Bokeh.Plotting;

    //// set up some data
    //var M = 100;
    //var xx = [];
    //var yy = [];
    //var colors = [];
    //var radii = [];
    //for (var y = 0; y <= M; y += 4) {
    //  for (var x = 0; x <= M; x += 4) {
    //    xx.push(x);
    //    yy.push(y);
    //    colors.push(plt.color(50 + 2 * x, 30 + 2 * y, 150));
    //    radii.push(Math.random() * 0.4 + 1.7)
    //  }
    //}

    //// create a data source
    //var source = new Bokeh.ColumnDataSource({
    //  data: { x: xx, y: yy, radius: radii, colors: colors }
    //});

    //// make the plot and add some tools
    //var tools = "pan,crosshair,wheel_zoom,box_zoom,reset";//,save";
    //var p = plt.figure({ title: "Colorful Scatter", tools: tools });

    //// call the circle glyph method to add some circle glyphs
    //var circles = p.circle({ field: "x" }, { field: "y" }, {
    //  source: source,
    //  radius: radii,
    //  fill_color: colors,
    //  fill_alpha: 0.6,
    //  line_color: null
    //});

    //// show the plot
    //plt.show(p);
  }

  onSelect(curve) {
    if (curve) {
      console.log("onSelect");
      this.selectedCurve = curve;
      this.CurveTable = null;
      this.CcurvData = null;
      this.tableSettings.columns[0].title = curve.title[0];
      this.tableSettings.columns[1].title = curve.title[1];
      this.sygnalServ.GetCalibrationCurve(curve.path).subscribe(cc => {
        console.log("GetCalibrationCurve");
        this.CcurvData = cc;
        this.CurveTable = [];
        for (var i = 0; i < cc.x.length; i++) {
          this.CurveTable.push({ x: cc.x[i], y: cc.y[i], select: true });
        }
        this.drawChart(cc);
      });
    }
  }
  onSave() {
    //this.sygnalServ.EditCalibrationCurve(this.selectedCurve.path,)
  }
  onAppendRow() {
    //this.sygnalServ.EditCalibrationCurve(this.selectedCurve.path,)
  }
  onDeleteRow() {
    //this.sygnalServ.EditCalibrationCurve(this.selectedCurve.path,)
  }
  onRestore() {
    //this.sygnalServ.EditCalibrationCurve(this.selectedCurve.path,)
  }
}
