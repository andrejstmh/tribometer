import { Component, OnInit,OnDestroy } from '@angular/core';

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
        private signalsService: SignalsService,
        private chartService: ChartService) {
    }

    ngOnInit() {
        this.signalsService.GetSettings().subscribe();
        forkJoin(this.signalsService.GetState(), this.signalsService.GetSettings()).subscribe(
            ([st, stt]) => {
                this.signalsService.settings$.next(stt);
                this.signalsService.lastState$.next(new trState(st));
                console.log("Get Settings: Ok");
                this.SocketServiceStart();
            },
            resErr => { console.log("Get Settings: Error"); },
            () => { }
        );
    }

    SocketServiceStart() {
        this.signalsService.startListen().subscribe(
            x => {
                console.log("socketService.startListen: Ok");
                this.chartService.initChartData();
                //this.socketService.initSocket();
                this.signalsService.socket.subscribe(
                    msg => {
                        //console.log("updateChartData");
                        if (msg.sensorData) {
                            this.signalsService.lastData$.next(msg.sensorData);
                            this.chartService.updateChartData(msg.sensorData);
                        }
                        if (msg.state) {
                            this.signalsService.lastState$.next(msg.state);
                        }
                        
                });
            },
            resErr => { console.log("socketService.startListen: Error"); },
            () => { }
        );
    }
    ngOnDestroy() {
        //if (this.SockServLastDataSubsc) { this.SockServLastDataSubsc.unsubscribe();}
        this.signalsService.stopListen().subscribe();
    }
}
