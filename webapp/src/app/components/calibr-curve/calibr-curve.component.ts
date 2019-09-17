import { Component, OnInit, OnDestroy } from '@angular/core';

import { CalibrationCurve, trTotalState, ObjHelper } from './../../models/message.model';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { SignalsService } from './../../services/signals.service';
import { ChartService } from './../../services/chart.service';

class CurveRow {
    constructor(public x: number = 0, public y: number = 0, public Nr: number = null) { }
}

class CurveInfo {
    constructor(public name?: string, public path?: string, public title?: string[]) { }
}

class CurrentData {
    constructor(public avgVoltage?: number, public avgForce?: number,
        public currVoltage?: number, public currForce?: number) { }
    
}

@Component({
    selector: 'app-calibr-curve',
    templateUrl: './calibr-curve.component.html',
    styleUrls: ['./calibr-curve.component.css']
})
export class CalibrCurveComponent implements OnInit, OnDestroy {
    selectedCurve: CurveInfo = null;
    CCurves = [
        new CurveInfo("Friction force calibration curve", "clbr_fr", ["Voltage, V", "Force, N"]),
        new CurveInfo("Load calibration curve", "clbr_load", ["Voltage, V", "Load, N"])
    ]
    currentData: CurrentData = new CurrentData(NaN, NaN, NaN, NaN);
    data$: BehaviorSubject<CurveRow[]> = new BehaviorSubject<CurveRow[]>([]);
    editCurve: boolean = false;
    selectedRow: CurveRow = new CurveRow();
    prevData: CurveRow[] = [];
    OnChDCh: Subscription = null;
    CcurvData: CalibrationCurve = null;

    constructor(
        private sygnalServ: SignalsService,
        private chartService: ChartService
    ) {
        this.selectedCurve = this.CCurves[0];
    }
    
    ngOnInit() {
        this.onSelect(this.CCurves[0]);
        this.OnChDCh = this.chartService.onChartDataChanged$.subscribe(
            reOk => {
                if (reOk) {
                    //load, fr
                    // time, load, fr
                    if (this.selectedCurve == this.CCurves[0]) {
                        // friction
                        this.currentData = new CurrentData(reOk.avb[1], reOk.adb[2], reOk.vb[1], reOk.db[2]);
                    } else {
                        //load
                        this.currentData = new CurrentData(reOk.avb[0], reOk.adb[1], reOk.vb[0], reOk.db[1]);
                    }
                    
                    
                }
                //console.log("update trib-control");
            },
            resErr => { },
            () => { }
        );
    }
    ngOnDestroy() {
        if (this.OnChDCh) { this.OnChDCh.unsubscribe(); } 
    }
    printNumVal(v: any) {
        return ObjHelper.printNumVal(v);
    }
    drawChart(cc: CalibrationCurve) {
    }

    onSelect(curve1) {
        if (this.selectedCurve) {
            let curve = this.selectedCurve;
            //console.log("onSelect");
            //this.selectedCurve = curve;
            //this.CurveTable = null;
            //this.CcurvData = null;
            //this.tableSettings.columns[0].title = curve.title[0];
            //this.tableSettings.columns[1].title = curve.title[1];
            this.sygnalServ.GetCalibrationCurve(curve.path).subscribe(cc => {
                //console.log("GetCalibrationCurve");
                //this.CcurvData = cc;
                //this.CurveTable = [];
                let res: CurveRow[] = [];
                for (var i = 0; i < cc.x.length; i++) {
                    res.push(new CurveRow(cc.x[i], cc.y[i], i));
                    //this.CurveTable.push({ x: cc.x[i], y: cc.y[i], select: true });
                }
                this.data$.next(res);
                //this.drawChart(cc);
            });
        }
    }


    CreateNewItem(Nr?: number) {
        if (Nr === undefined) {
            return new CurveRow(0, 0, null);
        } else {
            return new CurveRow(0, 0, Nr);
        }
    }

    EditClic() {
        this.editCurve = !this.editCurve;
        if (this.editCurve) {
            let res = this.data$.value;
            res.forEach((r, i) => { r.Nr = i; });
            this.prevData = []
            res.forEach(r => { this.prevData.push(new CurveRow(r.x, r.y, r.Nr)); })
            this.selectedRow = res[0];
        } else {
            this.CancelEdit();
        }
    }

    onSelectRow(r: any) {
        if (this.editCurve) {
            this.selectedRow = r;
        }
    }

    DeleteRow() {
        if (this.selectedRow.Nr != null) {
            let res = this.data$.value;
            if (res.length > 1) {
                //res.bazesCena.content = res.bazesCena.content.filter(it => it["Nr"] !== this.selectedRow.Nr)
                res.splice(this.selectedRow.Nr, 1);
                res.forEach((r, i) => { r.Nr = i; });
                this.selectedRow = this.CreateNewItem(null);//{ name: null, val: null, Nr: null };
                this.data$.next(res);
            }
        }
    }

    InsertItem(before: boolean) {
        let nr: number = this.selectedRow.Nr;
        let res = this.data$.value;
        let newItem = this.CreateNewItem();
        if (nr != null) {
            if (before) {
                res.splice(nr, 0, newItem);
            } else {
                res.splice(nr + 1, 0, newItem);
                nr = nr + 1;
            }
        } else {
            if (before) {
                res.unshift(newItem);
                nr = 0;
            } else {
                res.push(newItem);
                nr = res.length - 1;
            }

        }
        res.forEach((r, i) => { r.Nr = i; });
        this.selectedRow = res[nr];
        this.data$.next(res);

    }

    InserRowBefore() {
        this.InsertItem(true);
    }

    InserRowAfter() {
        this.InsertItem(false);
    }

    MoveItem(up: boolean) {
        let nr: number = this.selectedRow.Nr;
        let res = this.data$.value;
        let moved: boolean = false;
        if (nr != null) {
            if (up) {
                if (nr > 0) {
                    let it = res[nr];
                    res[nr] = res[nr - 1];
                    nr = nr - 1;
                    res[nr] = it;
                    moved = true;
                }
            } else {
                if (nr < res.length - 1) {
                    let it = res[nr];
                    res[nr] = res[nr + 1];
                    nr = nr + 1;
                    res[nr] = it;
                    moved = true;
                }
            }
            if (moved) {
                res.forEach((r, i) => { r.Nr = i; });
                this.selectedRow = res[nr];
                this.data$.next(res);
            }
        }
    }

    MoveUp() {
        this.MoveItem(true);
    }

    MoveDown() {
        this.MoveItem(false);
    }

    SaveData() {
        let res = this.data$.value;
        let cd = new CalibrationCurve();
        res.forEach(it => { cd.x.push(it.x); cd.y.push(it.y); })
        this.sygnalServ.EditCalibrationCurve(this.selectedCurve.path, cd).subscribe(
            resOk => { this.prevData = res; this.CancelEdit(); },
            resErr => { },
            () => { }
        );
    }

    CancelEdit() {
        this.editCurve = false;
        this.selectedRow = this.CreateNewItem(null);
        let res: CurveRow[] = [];
        this.prevData.forEach(r => { res.push(new CurveRow(r.x, r.y, r.Nr)); });
        this.data$.next(res);
    }
}
