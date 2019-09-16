import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, interval, combineLatest, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SensorsData, ExperimentStatus, ObjHelper, trState, trTotalState, trResultFileData } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';
import { ChartSettingsDialogComponent } from './../controls/chart-settings-dialog/chart-settings-dialog.component';
import { AttensionDialogComponent } from './../controls/attension-dialog/attension-dialog.component';

export class trLocalProgram {
    constructor(
        public time: number,
        public load: number,
        public RPM: number,
        public Tmax: number,
        public Fmax: number,
        public current: boolean) {

    }
} 

@Component({
    selector: 'app-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.css']
})
export class ExperimentComponent implements OnInit, OnDestroy {
    totState: Observable<trTotalState> = null;
    currentData: Observable<SensorsData> = null;
    subsArr: Subscription[] = [];
    OnGetFileData_Timer = interval(60000);
    OnFileData_TimerSubscription: Subscription = null;
    latestProgram$: Observable<trLocalProgram[]> = null;
    public ChartFile: LineChartSettings = null; 
    @ViewChild("writing", { read: BaseChartDirective, static: true }) chartW: BaseChartDirective;

    constructor(
        public signalsService: SignalsService,
        private chartService: ChartService,
        public dialog: MatDialog
    ) {
        this.ChartFile = new LineChartSettings(chartService.chartAxesSettings.ExpChatr);
    }
    
    ngOnInit() {
        this.signalsService.GetTotalState();
        this.currentData = this.chartService.onChartDataChanged$.asObservable()
        //this.subsArr.push( this.chartService.onChartDataChanged$.subscribe(
        //    reOk => {
        //        this.currentData = reOk;
        //    },
        //    resErr => { },
        //    () => { }
        //));
        this.subsArr.push(this.chartService.expFileData$.subscribe(
            resOk => {
                this.updateChartLines(resOk);
            },
            resErr => { },
            () => { }
        ));
        if (this.signalsService.lastState$.value) {
            if (this.signalsService.lastState$.value.status == 2) {
                this.InitTimer(this.chartService.expFileDataRefreshPeriodMin);
            }
        }
        this.latestProgram$ = combineLatest(
            this.chartService.onChartDataChanged$,
            this.signalsService.lastState$,
            this.signalsService.settings$).pipe(
                flatMap(([curdata, st, sett]) => {
                    let p = sett.program;
                    let tt = 0;
                    let pnew: trLocalProgram[] = []
                    let d = 0;
                    for (let pit of sett.program) {
                        d = pit.duration * 60
                        let pitn = new trLocalProgram(d,
                            //st.loadRegAuto ? pit.load : NaN, st.rpmRegAuto ? pit.RPM : NaN,
                            pit.load, pit.RPM,
                            pit.Tmax, pit.Fmax,
                            (st.status == ExperimentStatus.started)&&(curdata.db[0] >= tt) && (curdata.db[0] < tt + d));
                        tt = tt + d;
                        pitn.time = tt;
                        pnew.push(pitn);
                    }
                    return of(pnew);
                }),
        );
    }
    ngOnDestroy() {
        this.subsArr.forEach(it => { if (it) { it.unsubscribe(); } });
    }

    showChartSettingsDialog() {
        console.log("START dialog!");
        let ecs = this.chartService.chartAxesSettings.ExpChatr
        const dialogRef = this.dialog.open(ChartSettingsDialogComponent, {
            width: '750px',
            data: {
                t: ecs[0].copy(),
                rpm: ecs[1].copy(),
                load: ecs[2].copy(),
                fr: ecs[3].copy()
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('chart setting dialog: update settings!');
            ecs[0] = result.t;
            ecs[1] = result.rpm;
            ecs[2] = result.load;
            ecs[3] = result.fr;
            this.ChartFile = new LineChartSettings(this.chartService.chartAxesSettings.ExpChatr);
            this.resfreshChart();
        });
    }

    printNumVal(v: any) {
        return ObjHelper.printNumVal(v);
    }

    public secondsToSting(s: number) {
        let t = Math.floor(s / 86400);
        let ds = t > 0 ? (t < 10 ? " " + String(t) : String(t)) : "  ";
        let tt = s % 86400;
        t = Math.floor(tt / 3600);
        let hs = t > 0 ? (t < 10 ? "0" + String(t) : String(t)) : "00";
        tt = tt % 3600;
        t = Math.floor(tt / 60);
        let ms = t > 0 ? (t < 10 ? "0" + String(t) : String(t)) : "00";
        t = tt % 60;
        let ss = t > 0 ? (t < 10 ? "0" + t.toFixed(1) : t.toFixed(1)) : "00.0";
        return `${ds} ${hs}:${ms}:${ss}`;
    }

    updateChartLines(x: trResultFileData) {
        if (x) {
            //temperature, rotationrate, load, frictionforce
            this.ChartFile.lineChartData[0].data = x.temperature;//this.removeNaN(x.temperature);
            this.ChartFile.lineChartData[1].data = x.RPM;//this.removeNaN(x.RPM);
            this.ChartFile.lineChartData[2].data = x.load;//this.removeNaN(x.load);
            this.ChartFile.lineChartData[3].data = x.friction;//this.removeNaN(x.friction);
            this.ChartFile.lineChartLabels = x.time.map(this.secondsToSting);
            if (this.chartW) {
                console.log("this.chartW.update()");
                this.chartW.update();
            }
        }
    }

    startExperiment() {
        let ecs = this.chartService.chartAxesSettings.ExpChatr
        const dialogRef = this.dialog.open(AttensionDialogComponent, {
            width: '750px'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('dialog: beginWrite!');
            this.beginWrite();
            this.resfreshChart();
        });
    }

    stopExperiment() {
        this.endWrite();
    }
    
    public removeNaN(data: number[]) {
        data.forEach(function (item, i) { if (isNaN(item)) data[i] = -1; });
        return data;
    }
    public updateWChartData() {
        this.chartService.getDataFromFile();
    }

    beginWrite() {
        console.log("Nachat zapis!")
        this.signalsService.beginWrite().subscribe(
            resOk => {
                this.InitTimer(this.chartService.expFileDataRefreshPeriodMin);
                this.signalsService.GetTotalState();
            },
            resErr => { },
            () => { }
        );
    }

    endWrite() {
        console.log("Zakoncit zapis!")
        this.UnsubscribeTimer();
        this.signalsService.endWrite().subscribe(
            resOk => {
                this.updateWChartData();
                this.signalsService.GetTotalState();
            },
            resErr => { },
            () => { }
        );
    }
    UnsubscribeTimer() {
        if (this.OnFileData_TimerSubscription) {
            this.OnFileData_TimerSubscription.unsubscribe();
            this.OnFileData_TimerSubscription = null;
        }
    }
    InitTimer(period: number) {
        this.UnsubscribeTimer();
        if (period > 0) {
            this.OnGetFileData_Timer = interval(period * 60000);
            this.OnFileData_TimerSubscription = this.OnGetFileData_Timer.subscribe(x => {
                this.updateWChartData();
            });
        }

    }
    onChangerefreshPeriod(period_min: any) {
        this.chartService.expFileDataRefreshPeriodMin = 0;
        let p = +period_min;
        if (p > 0) {
            this.chartService.expFileDataRefreshPeriodMin = p;
        }
        this.InitTimer(this.chartService.expFileDataRefreshPeriodMin);
    }
    resfreshChart() {
        this.updateWChartData();
    }

}
