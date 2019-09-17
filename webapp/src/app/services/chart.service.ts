import { Injectable } from '@angular/core';
import { Observable, Observer ,of, Subscription,BehaviorSubject} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators'

//import * as socketIo from 'socket.io-client';
import { webSocket } from "rxjs/webSocket";

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { SensorsData, trResultFileData, trResultBase64FileData } from './../models/message.model';
import { SignalsService } from './signals.service';
import { Number } from 'bokehjs/build/js/types/core/properties';

//import { forEach } from '@angular/router/src/utils/collection';

export class LineChartSettings {
    public lineChartDataDraw: ChartDataSets[] = [];
    public lineChartData: ChartDataSets[] = [
        { data: [], label: 'Temperature', yAxisID: "y-axis-T", fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
        { data: [], label: 'RPM', yAxisID: "y-axis-RPM", fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
        { data: [], label: 'Load', yAxisID: 'y-axis-load', fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
        { data: [], label: 'Friction force', yAxisID: 'y-axis-Fr', fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 }
    ];

    public lineChartLabels: Label[] = [];

    constructor(AxSett: any[]) {
        this.UpdateSettings(AxSett);
    }

    public UpdateSettings(AxSett: any[]) {
        //id: 'y-axis-T', label: 'Temperature, °C', color: 'red', visible: true, auto: false, min: 15, max: 100
        this.lineChartOptions = {//responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            scales: {
                // We use this empty structure as a placeholder for dynamic theming.
                xAxes: [{}],
                yAxes: []
            }
        }
        let gridNedToSet = true;
        let ChartDataDraw = [];
        let ChartColors = [];
        let yaxes = []
        for (let axs of AxSett) {
            if (!axs.visible) { continue; }
            yaxes.push(this.getyAxesSettObj(axs, gridNedToSet));
            ChartDataDraw.push(this.lineChartData[axs.nr]);
            ChartColors.push({ // grey
                //backgroundColor: 'rgba(148,159,177,0.2)',
                borderColor: axs.color
                //pointBackgroundColor: 'rgba(148,159,177,1)',
                //pointBorderColor: '#fff',
                //pointHoverBackgroundColor: '#fff',
                //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            })
            gridNedToSet = false;
        }
        this.lineChartOptions.scales.yAxes = yaxes;
        this.lineChartDataDraw = ChartDataDraw;
        this.lineChartColors = ChartColors;
    }

    public getyAxesSettObj(yAxesSett: any, drawGridLines: boolean=false) {
        let res: any = null;
        if (yAxesSett.visible) { 
            let ticksV: any = { fontColor: yAxesSett.color }
            if (!yAxesSett.auto) {
                ticksV = {
                    fontColor: yAxesSett.color,
                    min: yAxesSett.min,
                    max: yAxesSett.max
                }
            }
            let scaleLabelV = {
                display: true,
                labelString: yAxesSett.label
            }
            res = {
                id: yAxesSett.id,
                position: 'left',
                gridLines: {
                    display: drawGridLines
                    //color: 'rgba(0,0,255,0.2)',
                },
                ticks: ticksV,
                scaleLabel: scaleLabelV
            }
        }
        return res
    }
    public lineChartOptions: ChartOptions = {
        //responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{}],
            yAxes: [
                //{
                //    id: 'y-axis-T',
                //    position: 'left',
                //    ticks: {
                //        fontColor: 'red',
                //        min:15,
                //        max:100,
                //    },
                //    scaleLabel: {
                //        display: true,
                //        labelString: 'Temperature, °C'
                //    }
                //},
                //{
                //    id: 'y-axis-RPM',
                //    position: 'left',
                //    gridLines: {
                //        display: false
                //        //color: 'rgba(255,0,0,0.3)',
                //    },
                //    ticks: {
                //        fontColor: 'rgba(77,83,96,1)',
                //        min: 0,
                //        max: 1200,
                //    },
                //    scaleLabel: {
                //        display: true,
                //        labelString: 'RPM'
                //    }
                //},
                //{
                //    id: 'y-axis-load',
                //    position: 'left',
                //    gridLines: {
                //        display: false
                //        //color: 'rgba(0,0,255,0.3)',
                //    },
                //    ticks: {
                //        fontColor: 'rgba(0,0,255,0.5)',
                //        min: 0,
                //        max: 1200,
                //    },
                //    scaleLabel: {
                //        display: true,
                //        labelString: 'Load, N'
                //    }
                //},
                //{
                //    id: 'y-axis-Fr',
                //    position: 'left',
                //    gridLines: {
                //        display: false
                //        //color: 'rgba(0,0,255,0.2)',
                //    },
                //    ticks: {
                //        fontColor: 'green',
                //        min: 0,
                //        max: 120,
                //    },
                //    scaleLabel: {
                //        display: true,
                //        labelString: 'Friction force, N'
                //    }
                //}
            ]
        }
    };
    public lineChartColors: Color[] = null;
    //[
    //    { // grey
    //        //backgroundColor: 'rgba(148,159,177,0.2)',
    //        borderColor: 'red',
    //        //pointBackgroundColor: 'rgba(148,159,177,1)',
    //        //pointBorderColor: '#fff',
    //        //pointHoverBackgroundColor: '#fff',
    //        //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //    },
    //    { // dark grey
    //        //backgroundColor: 'rgba(77,83,96,0.2)',
    //        borderColor: 'rgba(77,83,96,1)',
    //        //pointBackgroundColor: 'rgba(77,83,96,1)',
    //        //pointBorderColor: '#fff',
    //        //pointHoverBackgroundColor: '#fff',
    //        //pointHoverBorderColor: 'rgba(77,83,96,1)'
    //    },
    //    { // blue
    //        //backgroundColor: 'rgba(255,0,0,0.3)',
    //        borderColor: 'rgba(0,0,255,0.5)',
    //        //pointBackgroundColor: 'rgba(148,159,177,1)',
    //        //pointBorderColor: '#fff',
    //        //pointHoverBackgroundColor: '#fff',
    //        //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //    },
    //    { // blue
    //        //backgroundColor: 'rgba(0,0,255,0.3)',
    //        borderColor: 'green',
    //        //pointBackgroundColor: 'rgba(148,159,177,1)',
    //        //pointBorderColor: '#fff',
    //        //pointHoverBackgroundColor: '#fff',
    //        //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //    }
    //];
    public lineChartLegend = true;
    public lineChartType = 'line';

}
export class ChartAxisSettings{
    constructor(public nr: number, public id: string,
        public label: string, public color: string,
        public min: number, public max: number,
        public visible: boolean = true, public auto: boolean = false) { }
    copy() {
        return new ChartAxisSettings(this.nr, this.id, this.label, this.color, this.min, this.max, this.visible, this.auto);
    }
}
export const chartDataLength: number = 100;

@Injectable()
export class ChartService {
    public expFileDataRefreshPeriodMin = 1;
    public onChartDataChanged$: BehaviorSubject<SensorsData> = new BehaviorSubject<SensorsData>(null);
    public chartAxesSettings:any= {
        ControlChatr: [
            new ChartAxisSettings(0, 'y-axis-T', 'Temperature, °C', 'red', 15, 100),
            new ChartAxisSettings(1, 'y-axis-RPM', 'RPM', 'rgba(77,83,96,1)', 0, 1200),
            new ChartAxisSettings(2, 'y-axis-load', 'Load, N', 'rgba(0,0,255,0.5)', 0, 1200),
            new ChartAxisSettings(3, 'y-axis-Fr', 'Friction force, N', 'green', 0, 120)
            //{ nr:0, id: 'y-axis-T', label: 'Temperature, °C', color: 'red', visible: true, auto: false, min: 15, max: 100 },
            //{ nr: 1, id: 'y-axis-RPM', label: 'RPM', color: 'rgba(77,83,96,1)', visible: true, auto: false, min: 0, max: 1200 },
            //{ nr: 2, id: 'y-axis-load', label: 'Load, N', color: 'rgba(0,0,255,0.5)', visible: true, auto: false, min: 0, max: 1200 },
            //{ nr: 3, id: 'y-axis-Fr', label: 'Friction force, N', color: 'green', visible: true, auto: false, min: 0, max: 120 }
        ],
        ExpChatr: [new ChartAxisSettings(0, 'y-axis-T', 'Temperature, °C', 'red', 15, 100),
            new ChartAxisSettings(1, 'y-axis-RPM', 'RPM', 'rgba(77,83,96,1)', 0, 1200),
            new ChartAxisSettings(2, 'y-axis-load', 'Load, N', 'rgba(0,0,255,0.5)', 0, 1200),
            new ChartAxisSettings(3, 'y-axis-Fr', 'Friction force, N', 'green', 0, 120)
        ]
    }
    public ChartListen: LineChartSettings = null;
    public expFileData$: BehaviorSubject<trResultFileData> = new BehaviorSubject<trResultFileData>(new trResultFileData(null));

    constructor(private http: HttpClient,
        private signalsService: SignalsService) {
        this.ChartListen = new LineChartSettings(this.chartAxesSettings.ControlChatr);
        let l: Label[] = [];  let d1: number[] = []; let d2: number[] = []; let d3: number[] = []; let d4: number[] = [];
        for (let i = 0; i <= chartDataLength; i++) {
            //l.push(String(i - chartDataLength));
            l.push(String(chartDataLength-i)); //d1.push(0.0); d2.push(0.0); d3.push(0.0); d4.push(0.0); 
            d1.push(NaN); d2.push(NaN); d3.push(NaN); d4.push(NaN);
        }
        this.ChartListen.lineChartData[0].data = d1;
        this.ChartListen.lineChartData[1].data = d2;
        this.ChartListen.lineChartData[2].data = d3;
        this.ChartListen.lineChartData[3].data = d4;
        this.ChartListen.lineChartLabels = l;
        //this.ChartListen.lineChartData[0].data = new Array<number>(chartDataLength);
        //this.ChartListen.lineChartData[0].data.fill(0.0);
        //this.ChartListen.lineChartData[1].data = new Array<number>(chartDataLength);
        //this.ChartListen.lineChartData[1].data.fill(0.0);
        //this.ChartListen.lineChartData[2].data = new Array<number>(chartDataLength);
        //this.ChartListen.lineChartData[2].data.fill(0.0);
        //this.ChartListen.lineChartData[3].data = new Array<number>(chartDataLength);
        //this.ChartListen.lineChartData[3].data.fill(0.0);
        //this.ChartListen.lineChartLabels = new Array<Label>(chartDataLength);
        //for (let i = 0; i <= chartDataLength; i++) {
        //    this.ChartListen.lineChartLabels[i] = String(i);
        //}
        //this.onChartDataChanged$.next(new SensorsData(-1, -1, -1, -1, -1));
    }

    updateChartListenSettings(clAxesSettings: ChartAxisSettings[]) {
        this.chartAxesSettings.ControlChatr = clAxesSettings
        this.ChartListen.UpdateSettings(this.chartAxesSettings.ControlChatr);
    }

    getDataFromFile() {
        this.signalsService.GetDataFromResultFile().subscribe(x => {
            if (x) {
                //console.log("this.expFileData$.next(x)");
                let xx = new trResultFileData(x);
                this.expFileData$.next(xx);
            }
        });
    }
    

    public initChartData() {
        for (let i = 0; i < this.ChartListen.lineChartData.length; i++) {
            //this.ChartListen.lineChartData[i].data.fill(0.0);
            for (let j = 0; j < this.ChartListen.lineChartData[i].data.length; j++) {
                this.ChartListen.lineChartData[i].data[j] = NaN;
            }
        }
    }
    NanToNum(v: number) {
        return isNaN(v) ? 0.0 : v;
    }
    public updateChartData(x: SensorsData): void {
        if (x) {
            //this.ChartListen.lineChartData[0].data.unshift(x.temperature)
            //this.ChartListen.lineChartData[0].data.pop();
            //this.ChartListen.lineChartData[1].data.unshift(x.rotationrate)
            //this.ChartListen.lineChartData[1].data.pop();
            //this.ChartListen.lineChartData[2].data.unshift(x.load)
            //this.ChartListen.lineChartData[2].data.pop();
            //this.ChartListen.lineChartData[3].data.unshift(x.frictionforce)
            //this.ChartListen.lineChartData[3].data.pop();
            let jj = this.ChartListen.lineChartData[0].data.length - 1;
            for (let j = 1; j < jj+1; j++) {
                this.ChartListen.lineChartData[0].data[j-1] = this.ChartListen.lineChartData[0].data[j];
                this.ChartListen.lineChartData[1].data[j-1] = this.ChartListen.lineChartData[1].data[j];
                this.ChartListen.lineChartData[2].data[j-1] = this.ChartListen.lineChartData[2].data[j];
                this.ChartListen.lineChartData[3].data[j-1] = this.ChartListen.lineChartData[3].data[j];
            }
            //"load": sd[1], "frictionforce":sd[2], "rotationrate": sd[3], "temperature": sd[4]
            this.ChartListen.lineChartData[0].data[jj] = x.db[4];//this.NanToNum(x.temperature);
            this.ChartListen.lineChartData[1].data[jj] = x.db[3];//this.NanToNum(x.rotationrate);
            this.ChartListen.lineChartData[2].data[jj] = x.db[1];//this.NanToNum(x.load);
            this.ChartListen.lineChartData[3].data[jj] = x.db[2];//this.NanToNum(x.frictionforce);
            this.onChartDataChanged$.next(x);
        }
    }

}
