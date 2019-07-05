import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subscription, interval ,of} from 'rxjs';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

import { SensorsData, ObjHelper } from './../../models/message.model';
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
        public signalsService: SignalsService) {
        this.ChartListen = this.chartService.ChartListen;
    }
    rpmVal: number = 0;
    public ChartListen: LineChartSettings =null;
    
    @ViewChild("listen", { read: BaseChartDirective }) chart: BaseChartDirective;
    
    OnChDCh: Subscription = null;

    ngOnInit() {
        
        this.OnChDCh = this.chartService.onChartDataChanged$.subscribe(
            reOk => {
                if (reOk) {
                    this.currentData = reOk;
                    this.chart.update();
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
    //public secondsToSting(s: number) {
    //let t = Math.floor(s / 86400);
    //let ds = t > 0 ? (t < 10 ? " " + String(t) : String(t)) : "  ";
    //let tt = s % 86400;
    //t = Math.floor(tt / 3600);
    //let hs = t > 0 ? (t < 10 ? "0" + String(t) : String(t)) : "00";
    //tt = tt % 3600;
    //t = Math.floor(tt / 60);
    //let ms = t > 0 ? (t < 10 ? "0" + String(t):String(t)) : "00";
    //t = tt % 60;
    //let ss = t > 0 ? (t < 10 ? "0" + t.toFixed(1) : t.toFixed(1)) : "00.0";
    //return `${ds} ${hs}:${ms}:${ss}`;
    //}


    StopRotation() {
        this.signalsService.SetRPM(0).subscribe(x => {
            console.log("StopRotation "+x);
        });
    }

    loadPlus(val: number) {
        this.signalsService.UpdateLoadManual(val).subscribe(x => {
            console.log("Load +" +val);
        });
    }

    loadMinus(val: number) {
        this.signalsService.UpdateLoadManual(-val).subscribe(x => {
            console.log("Load -" + val);
        });
    }

    increaseRPM(val: number) {
        console.log("increaseRPM" + val);
        this.signalsService.UpdateRPMManual(val).subscribe(
            resOk => { console.log("RPM" + val); }
        );
    }
    decreaseRPM(val: number) {
        console.log("decreaseRPM" + val);
        this.signalsService.UpdateRPMManual(-val).subscribe(
            resOk => { console.log("RPM" + val); }
        );
    }
    setRPMAuto(val: number) {
        this.signalsService.SetRPM(val).subscribe(
            resOk => { this.signalsService.settings$.next(resOk); }
        );
        console.log(val);
    }
    setLoadAuto(val: number) {
        this.signalsService.SetLoad(val).subscribe(
            resOk => { this.signalsService.settings$.next(resOk); }
        );
        console.log(val);
    }
    setThresholds(maxFr: number, maxTemp: number) {
        this.signalsService.UpdateThresholds(maxFr, maxTemp).subscribe(
            resOk => { this.signalsService.settings$.next(resOk); }
        );
    }
}
