import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import { formatDate } from '@angular/common';

import { trTotalState, trState, trSettings, ObjHelper, trProgram } from './../../../models/message.model';
import { SignalsService } from './../../../services/signals.service';
import { ChartService } from './../../../services/chart.service';

@Component({
    selector: 'app-status-row',
    templateUrl: './status-row.component.html',
    styleUrls: ['./status-row.component.css']
})
export class StatusRowComponent implements OnInit, OnChanges {
    @Input() tableClass: string = "";
    constructor(public signalsService: SignalsService,
        private chartService: ChartService) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        
    }

}
