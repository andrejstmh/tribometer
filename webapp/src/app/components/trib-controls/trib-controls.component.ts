import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subscription, interval ,of} from 'rxjs';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

import { SocketService, SensorsData } from './../../services/socket.service';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';


@Component({
  selector: 'app-contols',
	templateUrl: './trib-controls.component.html',
	styleUrls: ['./trib-controls.component.css']
})
export class TribControlsComponent implements OnInit, OnDestroy {
    currentData: SensorsData = null;
    constructor(
        private chartService:ChartService,
        private socketservice: SocketService,
        private signalsService: SignalsService) {
        this.ChartListen = this.chartService.ChartListen;
    }
    rpmVal: number = 0;
    public ChartListen: LineChartSettings =null;
    //public ChartFile: LineChartSettings = new LineChartSettings();
    //@ViewChild(BaseChartDirective) chart: BaseChartDirective;

    @ViewChild("listen", { read: BaseChartDirective }) chart: BaseChartDirective;
    //@ViewChild("writing", { read: BaseChartDirective }) chartW: BaseChartDirective;

    OnChDCh: Subscription = null;

    ngOnInit() {
        this.OnChDCh = this.chartService.onChartDataChanged.subscribe(
            reOk => {
                this.currentData = reOk;
                this.chart.update();
                console.log("update trib-control");
            },
            resErr => { },
            () => { }
        )
    }
    ngOnDestroy() {
        if (this.OnChDCh) { this.OnChDCh.unsubscribe(); } 
    }

    printNumVal(v: number) {
        return isNaN(v) ? "-" : v.toFixed(2)
    }
    //public updateChartData(x: SensorsData): void {
    //    if (x) {
    //        let jj = this.ChartListen.lineChartData[0].data.length - 1;
    //        for (let j = 0; j < jj; j++) {
    //        this.ChartListen.lineChartData[0].data[j] = this.ChartListen.lineChartData[0].data[j + 1];
    //        this.ChartListen.lineChartData[1].data[j] = this.ChartListen.lineChartData[1].data[j + 1];
    //        this.ChartListen.lineChartData[2].data[j] = this.ChartListen.lineChartData[2].data[j + 1];
    //        this.ChartListen.lineChartData[3].data[j] = this.ChartListen.lineChartData[3].data[j + 1];
    //        }
    //        this.ChartListen.lineChartData[0].data[jj] = x.temperature;
    //        this.ChartListen.lineChartData[1].data[jj] = x.rotationrate;
    //        this.ChartListen.lineChartData[2].data[jj] = x.load;
    //        this.ChartListen.lineChartData[3].data[jj] = x.frictionforce;
    //        this.chart.update();
    //    }
    //}


    public secondsToSting(s: number) {
    let t = Math.floor(s / 86400);
    let ds = t > 0 ? (t < 10 ? " " + String(t) : String(t)) : "  ";
    let tt = s % 86400;
    t = Math.floor(tt / 3600);
    let hs = t > 0 ? (t < 10 ? "0" + String(t) : String(t)) : "00";
    tt = tt % 3600;
    t = Math.floor(tt / 60);
    let ms = t > 0 ? (t < 10 ? "0" + String(t):String(t)) : "00";
    t = tt % 60;
    let ss = t > 0 ? (t < 10 ? "0" + t.toFixed(1) : t.toFixed(1)) : "00.0";
    return `${ds} ${hs}:${ms}:${ss}`;
    }


    rotation() {
        this.signalsService.SetRPM(this.rpmVal).subscribe(x => {
            console.log("Rotation " +x);
        });
    }

    StopRotation() {
        this.signalsService.SetRPM(0).subscribe(x => {
            console.log("StopRotation "+x);
        });
    }

    loadPlus() {
        this.signalsService.SetLoad(10).subscribe(x => {
            console.log("Load " +x);
        });
    }

    loadMinus() {
        this.signalsService.SetLoad(-10).subscribe(x => {
            console.log("Load" + x);
        });
    }
}
