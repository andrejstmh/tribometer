import { Injectable } from '@angular/core';
import { Observable, Observer ,of, Subscription,BehaviorSubject} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators'

//import * as socketIo from 'socket.io-client';
import { webSocket } from "rxjs/webSocket";

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { SensorsData, trResultFileData } from './../models/message.model';
import { SocketService } from './socket.service';
import { SignalsService } from './signals.service';

import { forEach } from '@angular/router/src/utils/collection';

export class LineChartSettings {
    public lineChartData: ChartDataSets[] = [
        { data: [], label: 'Temperature', yAxisID: "y-axis-T", fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
        { data: [], label: 'RPM', yAxisID: "y-axis-RPM", fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
        { data: [], label: 'Load', yAxisID: 'y-axis-load', fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
        { data: [], label: 'Friction force', yAxisID: 'y-axis-Fr', fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 }
    ];
    public lineChartLabels: Label[] = [];
    public lineChartOptions: ChartOptions = {
        //responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{}],
            yAxes: [
                {
                    id: 'y-axis-T',
                    position: 'left',
                    ticks: {
                        fontColor: 'red',
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature, °C'
                    }
                },
                {
                    id: 'y-axis-RPM',
                    position: 'left',
                    gridLines: {
                        display: false
                        //color: 'rgba(255,0,0,0.3)',
                    },
                    ticks: {
                        fontColor: 'rgba(77,83,96,1)',
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'RPM'
                    }
                },
                {
                    id: 'y-axis-load',
                    position: 'left',
                    gridLines: {
                        display: false
                        //color: 'rgba(0,0,255,0.3)',
                    },
                    ticks: {
                        fontColor: 'rgba(0,0,255,0.5)',
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Load, N'
                    }
                },
                {
                    id: 'y-axis-Fr',
                    position: 'left',
                    gridLines: {
                        display: false
                        //color: 'rgba(0,0,255,0.2)',
                    },
                    ticks: {
                        fontColor: 'green',
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Friction force, N'
                    }
                }
            ]
        }
    };
    public lineChartColors: Color[] = [
        { // grey
            //backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'red',
            //pointBackgroundColor: 'rgba(148,159,177,1)',
            //pointBorderColor: '#fff',
            //pointHoverBackgroundColor: '#fff',
            //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        { // dark grey
            //backgroundColor: 'rgba(77,83,96,0.2)',
            borderColor: 'rgba(77,83,96,1)',
            //pointBackgroundColor: 'rgba(77,83,96,1)',
            //pointBorderColor: '#fff',
            //pointHoverBackgroundColor: '#fff',
            //pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        { // blue
            //backgroundColor: 'rgba(255,0,0,0.3)',
            borderColor: 'rgba(0,0,255,0.5)',
            //pointBackgroundColor: 'rgba(148,159,177,1)',
            //pointBorderColor: '#fff',
            //pointHoverBackgroundColor: '#fff',
            //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        { // blue
            //backgroundColor: 'rgba(0,0,255,0.3)',
            borderColor: 'green',
            //pointBackgroundColor: 'rgba(148,159,177,1)',
            //pointBorderColor: '#fff',
            //pointHoverBackgroundColor: '#fff',
            //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];
    public lineChartLegend = true;
    public lineChartType = 'line';

}

export const chartDataLength: number = 100;

@Injectable()
export class ChartService {
    public expFileDataRefreshPeriodMin = 1;
    public onChartDataChanged$: BehaviorSubject<SensorsData> = new BehaviorSubject<SensorsData>(new SensorsData(NaN, NaN, NaN, NaN, NaN));
    public ChartListen: LineChartSettings = new LineChartSettings();
    public expFileData$: BehaviorSubject<trResultFileData> = new BehaviorSubject<trResultFileData>(new trResultFileData([],[],[],[],[]));

    constructor(private http: HttpClient,
        private signalsService: SignalsService) {
        let l: Label[] = [];  let d1: number[] = []; let d2: number[] = []; let d3: number[] = []; let d4: number[] = [];
        for (let i = 0; i <= chartDataLength; i++) {
            //l.push(String(i - chartDataLength));
            l.push(String(i)); d1.push(0.0); d2.push(0.0); d3.push(0.0); d4.push(0.0);
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
        this.onChartDataChanged$.next(new SensorsData(-1, -1, -1, -1, -1));

    }

    getDataFromFile() {
        this.signalsService.GetDataFromResultFile().subscribe(x => {
            if (x) {
                console.log("this.expFileData$.next(x)");
                this.expFileData$.next(x);
            }
        });
    }
    

    public initChartData() {
        for (let i = 0; i < this.ChartListen.lineChartData.length; i++) {
            //this.ChartListen.lineChartData[i].data.fill(0.0);
            for (let j = 0; j < this.ChartListen.lineChartData[i].data.length; j++) {
                this.ChartListen.lineChartData[i].data[j] = 0;
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
            for (let j = jj; j >0; j--) {
                this.ChartListen.lineChartData[0].data[j] = this.ChartListen.lineChartData[0].data[j - 1];
                this.ChartListen.lineChartData[1].data[j] = this.ChartListen.lineChartData[1].data[j - 1];
                this.ChartListen.lineChartData[2].data[j] = this.ChartListen.lineChartData[2].data[j - 1];
                this.ChartListen.lineChartData[3].data[j] = this.ChartListen.lineChartData[3].data[j - 1];
            }
            this.ChartListen.lineChartData[0].data[0] = this.NanToNum(x.temperature);
            this.ChartListen.lineChartData[1].data[0] = this.NanToNum(x.rotationrate);
            this.ChartListen.lineChartData[2].data[0] = this.NanToNum(x.load);
            this.ChartListen.lineChartData[3].data[0] = this.NanToNum(x.frictionforce);
            this.onChartDataChanged$.next(x);
        }
    }

}
