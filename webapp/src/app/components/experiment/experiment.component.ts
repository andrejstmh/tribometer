import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

import { SocketService,  } from './../../services/socket.service';
import { SensorsData, ExperimentStatus, ObjHelper, trState, trTotalState, trResultFileData } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';


@Component({
    selector: 'app-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.css']
})
export class ExperimentComponent implements OnInit, OnDestroy {
    totState: Observable<trTotalState> = null;
    selected_period_min = 1;
    OnMessage$: Observable<SensorsData> = null;
    constructor(
        private socketservice: SocketService,
        private signalsService: SignalsService,
        private chartService: ChartService
    ) {
    }
    OnMsgSubscription: Subscription = null;
    OnMinTimer = interval(60000);
    OnMinTimerSubscription: Subscription = null;
    public ChartFile: LineChartSettings = new LineChartSettings();
    @ViewChild("writing", { read: BaseChartDirective }) chartW: BaseChartDirective;

    currentData: SensorsData = null;
    OnChDCh: Subscription = null;
    subsArr: Subscription[] = [];
    ngOnInit() {
        this.signalsService.GetTotalState();
        this.totState = this.signalsService.totalstate$.asObservable();
        this.subsArr.push( this.chartService.onChartDataChanged$.subscribe(
            reOk => {
                this.currentData = reOk;
            },
            resErr => { },
            () => { }
        ));
        this.subsArr.push(this.chartService.expFileData$.subscribe(
            resOk => { this.updateChartLines(resOk);},
            resErr => { },
            () => { }
        ));
        if (this.signalsService.totalstate$.value) {
            if (this.signalsService.totalstate$.value.state.status == 2) {
                this.InitTimer(this.chartService.expFileDataRefreshPeriodMin);
            }
        }
    }
    ngOnDestroy() {
        this.subsArr.forEach(it => { if (it) { it.unsubscribe(); } });
    }
    printNumVal(v: any) {
        return ObjHelper.printNumVal(v);
    }

    updateChartLines(x: trResultFileData) {
        if (x) {
            //temperature, rotationrate, load, frictionforce
            this.ChartFile.lineChartData[0].data = this.removeNaN(x.temperature);
            this.ChartFile.lineChartData[1].data = this.removeNaN(x.RPM);
            this.ChartFile.lineChartData[2].data = this.removeNaN(x.load);
            this.ChartFile.lineChartData[3].data = this.removeNaN(x.friction);
            this.ChartFile.lineChartLabels = x.time.map(this.secondsToSting);
            if (this.chartW) {
                console.log("this.chartW.update()");
                this.chartW.update();
            }
        }
    }

    startExperiment() {
        this.beginWrite();
    }

    stopExperiment() {
        this.endWrite();
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
        if (this.OnMinTimerSubscription) {
            this.OnMinTimerSubscription.unsubscribe();
            this.OnMinTimerSubscription = null;
        }
    }
    InitTimer(period: number) {
        this.UnsubscribeTimer();
        if (period > 0) {
            this.OnMinTimer = interval(period * 60000);
            this.OnMinTimerSubscription = this.OnMinTimer.subscribe(x => {
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
