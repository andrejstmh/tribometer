import { Component, OnInit } from '@angular/core';
import { SignalsService, trTotalState, trState, trSettings, DeepCopyOfState} from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';


export class ProgramPoint {
    constructor(
        public duration: number,
        public load: number,
        public RPM: number
    ) { }
}

export class ExperimentSettings {
    constructor(
        public user: string = "",
        public bearing: string = "",
        public outputFileName: string = "results.h5",
        //public workingDirectory: string ="/home/pi/tribometer/",
        //public logFileName: string="log.txt",
        public totalDuration: number = 72,
        public program: ProgramPoint[] = []
    ) { }
}


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
                    console.log(resOk);
                    this.totState = DeepCopyOfState(resOk);
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
