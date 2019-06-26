import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

import { SocketService, SensorsData } from './../../services/socket.service';
import { SignalsService } from './../../services/signals.service';
import { LineChartSettings } from './../../services/chart.service';

export enum ExperimentStatus {
    init = 0, started = 1, completed = 2
}

@Component({
    selector: 'app-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.css']
})
export class ExperimentComponent implements OnInit {
    status: ExperimentStatus = 0;
    selected_period_min = 1;
    OnMessage$: Observable<SensorsData> = null;
    constructor(private socketservice: SocketService, private signalsService: SignalsService) {
    }
    OnMsgSubscription: Subscription = null;
    OnMinTimer = interval(60000);
    OnMinTimerSubscription: Subscription = null;
    public ChartFile: LineChartSettings = new LineChartSettings();
    @ViewChild("writing", { read: BaseChartDirective }) chartW: BaseChartDirective;

    startExperiment() {
        this.beginWrite();
    }

    stopExperiment() {
        this.endWrite();
    }

    ngOnInit() {

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
    public updateWChartData() {
        this.signalsService.GetDataFromResultFile().subscribe(x => {
            //temperature, rotationrate, load, frictionforce
            this.ChartFile.lineChartData[0].data = x.temperature;
            this.ChartFile.lineChartData[1].data = x.RPM;
            this.ChartFile.lineChartData[2].data = x.load;
            this.ChartFile.lineChartData[3].data = x.friction;
            this.ChartFile.lineChartLabels = x.time.map(this.secondsToSting);
        });
        this.chartW.update();
    }

    beginWrite() {
        console.log("Nachat zapis!")
        this.signalsService.beginWrite().subscribe(
            resOk => {
                this.InitTimer(this.selected_period_min);
                this.status = ExperimentStatus.started;
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
                this.status = ExperimentStatus.completed;
                this.updateWChartData();
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
        this.selected_period_min = 0;
        let p = +period_min;
        if (p > 0) {
            this.selected_period_min = p;
        }
        this.InitTimer(this.selected_period_min);
    }
    resfreshChart() {
        this.updateWChartData();
    }

}