import { Component, OnInit } from '@angular/core';
import { trTotalState, trState, trSettings, DeepCopyOfState } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    totState: trTotalState = null;
    submitted = false;
    constructor(
        private signalsService: SignalsService) { }

    ngOnInit() {
        this.signalsService.totalstate$.subscribe(
            resOk => {
                if (resOk) {
                    console.log('request');
                    console.log(resOk);
                    this.totState = DeepCopyOfState(resOk);
                    console.log('form data');
                    console.log(this.totState);
                } else {
                    this.totState = null;

                }
            },
            resErr => { },
            () => { }
        )
    }

    

    onSubmit() {
        this.submitted = true;

    }

}
