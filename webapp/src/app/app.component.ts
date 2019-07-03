import { Component, OnInit,OnDestroy } from '@angular/core';

import { listener } from '@angular/core/src/render3';

import { SocketService } from './services/socket.service';
import { SensorsData, trSettings, trState, trTotalState } from './models/message.model';
import { ChartService } from './services/chart.service';
import { SignalsService } from './services/signals.service'
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    appLogo = require("./../assets/bearing.png");
    title = 'Tribometer';
    constructor(
        private socketService: SocketService,
        private signalsService: SignalsService,
        private chartService: ChartService) { }
    
    //private SockServLastDataSubsc: Subscription = null;
    ngOnInit() {
        forkJoin(this.signalsService.GetState(), this.signalsService.GetSettings()).subscribe(
            ([st, stt]) => {
                console.log("Get Settings: Ok");
                this.signalsService.totalstate$.next(new trTotalState(stt, st));
                this.SocketServiceStart();
            },
            resErr => { console.log("Get Settings: Error"); },
            () => { }
        );
    }

    SocketServiceStart() {
        this.socketService.startListen().subscribe(
            x => {
                console.log("socketService.startListen: Ok");
                this.chartService.initChartData();
                //this.socketService.initSocket();
                this.socketService.socket.subscribe(
                    msg => {
                        //console.log("updateChartData");
                        if (msg.sensorData) {
                            this.socketService.lastData$.next(msg.sensorData);
                            this.chartService.updateChartData(msg.sensorData);
                        }
                        if (msg.state) {
                            let prev = this.signalsService.totalstate$.value;
                            if (prev) {
                                prev.state = msg.state;
                                this.signalsService.totalstate$.next(prev);
                            }
                            
                            this.socketService.lastState$.next(msg.state);
                        }
                        
                });
            },
            resErr => { console.log("socketService.startListen: Error"); },
            () => { }
        );
    }
    ngOnDestroy() {
        //if (this.SockServLastDataSubsc) { this.SockServLastDataSubsc.unsubscribe();}
        this.socketService.stopListen().subscribe();
    }
}
