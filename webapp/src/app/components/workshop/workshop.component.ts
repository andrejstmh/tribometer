import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

import { SocketService, SensorsData } from './../../services/socket.service';
import { SygnalsService } from './../../services/sygnals.service';

export class LineChartSettings {
  public lineChartData: ChartDataSets[] = [
    {data: [], label: 'Temperature', yAxisID: "y-axis-T", fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0},
    { data: [], label: 'RPM', yAxisID: "y-axis-RPM", fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
    { data: [], label: 'load', yAxisID: 'y-axis-load', fill: false, lineTension: 0, pointBorderWidth: 0, pointRadius: 0 },
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
            fontColor: 'blue',
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
      borderColor: 'blue',
      //pointBackgroundColor: 'rgba(148,159,177,1)',
      //pointBorderColor: '#fff',
      //pointHoverBackgroundColor: '#fff',
      //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

}

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.css']
})
export class WorkshopComponent implements OnInit {
  OnMessage$: Observable<SensorsData> = null;
  constructor(private socketservice: SocketService, private sygnalsService: SygnalsService) {
  }
  OnMsgSubscription: Subscription = null;
  OnMinTimer = interval(60000);
  OnMinTimerSubscription: Subscription = null;
  rpmVal: number = 1200;
  public ChartListen: LineChartSettings = new LineChartSettings();
  public ChartFile: LineChartSettings = new LineChartSettings();
  //@ViewChild(BaseChartDirective) chart: BaseChartDirective;

  @ViewChild("listen", { read: BaseChartDirective }) chart: BaseChartDirective;
  @ViewChild("writing", { read: BaseChartDirective }) chartW: BaseChartDirective;

  
  ngOnInit() {
    let l: Label[] = [];
    let d1: number[] = [];
    let d2: number[] = [];
    let d3: number[] = [];
    let d4: number[] = [];
    for (let i = 0; i < 101; i++) {
      l.push(String(i - 100 ));
      d1.push(0.0);
      d2.push(0.0);
      d3.push(0.0);
      d4.push(0.0);
    }
    this.ChartListen.lineChartData[0].data = d1;
    this.ChartListen.lineChartData[1].data = d2;
    this.ChartListen.lineChartData[2].data = d3;
    this.ChartListen.lineChartData[3].data = d4;
    this.ChartListen.lineChartLabels = l;
  }

  public updateChartData(x: SensorsData): void {
    if (x) {
      let jj = this.ChartListen.lineChartData[0].data.length - 1;
      for (let j = 0; j < jj; j++) {
        this.ChartListen.lineChartData[0].data[j] = this.ChartListen.lineChartData[0].data[j + 1];
        this.ChartListen.lineChartData[1].data[j] = this.ChartListen.lineChartData[1].data[j + 1];
        this.ChartListen.lineChartData[2].data[j] = this.ChartListen.lineChartData[2].data[j + 1];
        this.ChartListen.lineChartData[3].data[j] = this.ChartListen.lineChartData[3].data[j + 1];
      }
      this.ChartListen.lineChartData[0].data[jj] = x.temperature;
      this.ChartListen.lineChartData[1].data[jj] = x.rotationrate;
      this.ChartListen.lineChartData[2].data[jj] = x.load;
      this.ChartListen.lineChartData[3].data[jj] = x.frictionforce;
      this.chart.update();
      
    }
  }

  initChartData() {
    for (let i = 0; i < this.ChartListen.lineChartData.length; i++) {
      for (let j = 0; j < this.ChartListen.lineChartData[i].data.length ; j++) {
        this.ChartListen.lineChartData[i].data[j] = 0;
      }
    }
  }

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
  public updateWChartData() {
    this.sygnalsService.GetDataFromResultFile().subscribe(x => {
      //temperature, rotationrate, load, frictionforce
      this.ChartFile.lineChartData[0].data = x.temperature;
      this.ChartFile.lineChartData[1].data = x.RPM;
      this.ChartFile.lineChartData[2].data = x.load;
      this.ChartFile.lineChartData[3].data = x.friction;
      this.ChartFile.lineChartLabels = x.time.map(this.secondsToSting);
    });
    this.chartW.update();
  }
  startListen() {
    console.log("Nachat slushat!")
    this.socketservice.startListen().subscribe(x => {
      this.initChartData();
      this.socketservice.initSocket();
      this.OnMessage$ = this.socketservice.lastData$.asObservable();
      this.OnMsgSubscription= this.OnMessage$.subscribe(x => {
        this.updateChartData(x);
      })
    })
  }

  stopListen(){
    console.log("Zakoncit slushat!");
    this.socketservice.stopListen().subscribe(x => x);
    this.OnMessage$ = null;
    this.OnMsgSubscription.unsubscribe();
    this.OnMsgSubscription = null;
  }

  beginWrite() {
    console.log("Nachat zapis!")
    this.sygnalsService.beginWrite().subscribe(x => x)
    
    this.OnMinTimerSubscription = this.OnMinTimer.subscribe(x => {
      this.updateWChartData();
    })
    
  }
  
  endWrite() {
    console.log("Zakoncit zapis!")
    this.OnMinTimerSubscription.unsubscribe();
    this.sygnalsService.endWrite().subscribe(x => x)
  }

  rotation() {
    this.sygnalsService.SetRPM(this.rpmVal).subscribe(x => {
      console.log("Rotation " +x);
    });
    
  }

  StopRotation() {
    this.sygnalsService.SetRPM(0).subscribe(x => {
      console.log("StopRotation "+x);
    });
  }

  loadPlus() {
    this.sygnalsService.SetLoad(10).subscribe(x => {
      console.log("Load " +x);
    });
  }

  loadMinus() {
    this.sygnalsService.SetLoad(-10).subscribe(x => {
      console.log("Load" + x);
    });
  }
}
