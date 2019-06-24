import { Component, OnInit,OnDestroy } from '@angular/core';

import { listener } from '@angular/core/src/render3';

import { SocketService, SensorsData } from './services/socket.service';
import { ChartService } from './services/chart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    appLogo = require("./../assets/bearing.png");
    title = 'Tribometer';
    constructor(private socketService: SocketService, private chartService: ChartService) {}
    
    private SockServLastDataSubsc: Subscription = null;
    ngOnInit() {

        //getStatus => serverStatusInformation
        //if listenening{
        //  schow currtent values
        //}else{
        //  setting form
        //}

        this.socketService.startListen().subscribe(x => {
            this.chartService.initChartData();
            this.socketService.initSocket();
             this.socketService.lastData$.subscribe(x => {
                this.chartService.updateChartData(x);
            });
        });
    }
    ngOnDestroy() {
        if (this.SockServLastDataSubsc) { this.SockServLastDataSubsc.unsubscribe();}
        this.socketService.stopListen().subscribe();
    }
}
