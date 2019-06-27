import { Component, OnInit } from '@angular/core';
import { trTotalState, trState, trSettings, ObjHelper } from './../../models/message.model';
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
                    //console.log('request');
                    //console.log(resOk);
                    this.totState = ObjHelper.DeepCopyOfState(resOk);
                    //console.log('form data');
                    //console.log(this.totState);
                } else {
                    this.totState = null;

                }
            },
            resErr => { },
            () => { }
        );
    }

    

    onSubmit() {
        this.signalsService.EditSettings(this.totState.settings).subscribe(
            resOk => {
                console.log("EditSettingsOk");
                //console.log(resOk);
                let v = this.signalsService.totalstate$.value;
                v.settings = resOk;
                this.signalsService.totalstate$.next(v);
                //this.totState = DeepCopyOfState(v);
                this.signalsService.GetTotalState();
            },
            resErr => { console.log("EditSettingsErr"); },
            () => { }
        );
        this.submitted = true;
    }

}
