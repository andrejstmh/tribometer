import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';
import { Observable, Subscription, interval ,of} from 'rxjs';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SensorsData, ObjHelper } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings, ChartAxisSettings } from './../../services/chart.service';
import { ChartSettingsDialogComponent } from './../controls/chart-settings-dialog/chart-settings-dialog.component';

export interface axesSetting {
    min: number, max: number;
    visible: boolean; auto: boolean;
}

export interface DialogData {
    t: axesSetting;
    rpm: axesSetting;
    fr: axesSetting;
    load: axesSetting;
}



@Component({
  selector: 'app-contols',
  templateUrl: './trib-controls.component.html',
  styleUrls: ['./trib-controls.component.css']
})
export class TribControlsComponent implements OnInit, OnDestroy {
    currentData: SensorsData = null;
    rpmVal: number = 0;
    public ChartListen: LineChartSettings = null;
    public ControlChatrSettings: any = null;
    constructor(
        private chartService: ChartService,
        public signalsService: SignalsService,
        public dialog: MatDialog) {
        this.ControlChatrSettings = this.chartService.chartAxesSettings.ControlChatr;
        this.ChartListen = this.chartService.ChartListen;
        this.ChartListen.lineChartOptions["tooltips"] = { enabled: false };
        //this.ChartListen.lineChartOptions["legend"] = { position: "left" };
        //this.ChartListen.lineChartOptions["responsive"] = false;
        //this.ChartListen.lineChartOptions.scales.xAxes[0] = {
        //    ticks: {
        //        callback: (dataLabel, index) => {
        //            return (index % 5 === 0) ? dataLabel : "";
        //        }
        //    }
        //}
    }

    
    @ViewChild("listen", { read: BaseChartDirective, static: true }) chart: BaseChartDirective;
    
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

    showChartSettingsDialog() {
        console.log("START dialog!");
        const dialogRef = this.dialog.open(ChartSettingsDialogComponent, {
            width: '750px',
            data: {
                t: this.ControlChatrSettings[0].copy(),
                rpm: this.ControlChatrSettings[1].copy(),
                load: this.ControlChatrSettings[2].copy(),
                fr: this.ControlChatrSettings[3].copy()
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('chart setting dialog: update settings!');
            this.chartService.updateChartListenSettings([result.t, result.rpm, result.load, result.fr])
            this.ControlChatrSettings = this.chartService.chartAxesSettings.ControlChatr;
            //this.ChartListen = this.chartService.ChartListen;
            this.ChartListen.lineChartOptions["tooltips"] = { enabled: false };
        });
    }

    StopRotation() {
        this.signalsService.StopRotationsManual().subscribe(x => {
            console.log("StopRotation " + x);
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

