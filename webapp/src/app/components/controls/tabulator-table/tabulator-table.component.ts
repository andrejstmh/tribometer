import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';
import Tabulator from 'tabulator-tables';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-tabulator-table',
    templateUrl: './tabulator-table.component.html',
    styleUrls: ['./tabulator-table.component.css']
})
export class TabulatorTableComponent implements OnInit, OnChanges {
    @Input() tableClass: string = "";
    @Input() tableSettings: any = {}
    @Input() tableData: any[] = [];
    @Input() tableColumns: any[] = null;
    // @Input() height: string = '311px';
    @Input() layout: any = null;
    @Input() rowFormatter: any = null;
    @Input() rowClick: any = null;
    @Input() Theme: string = null;
    //@Input() movableColumns: any = true;
    @Input() responsiveLayout: any = null;
    @Input() responsiveLayoutCollapseStartOpen: boolean = null;
    @Input() rowSelectionChanged: any = null;
    tab = document.createElement('div');
    tabulator: Tabulator = null;
    constructor(private compRootEl: ElementRef, private renderer: Renderer2) {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.drawTable();
    }

    private drawTable(): void {
        //this.tabulator = new Tabulator(this.compRootEl.nativeElement, {
        if (this.tableClass) {
            this.tab.setAttribute("class", this.tableClass);
        }
        let settings = {};
        if (this.tableSettings) {
            settings = this.tableSettings;
        }
        if (this.tableData) {
            settings["data"] = this.tableData;
        }
        if (this.tableColumns) {
            settings["columns"] = this.tableColumns;
        }

        if (this.rowFormatter != null) {
            settings["rowFormatter"] = this.rowFormatter;
        }
        if (this.rowClick != null) {
            settings["rowClick"] = this.rowClick;
        }

        if (this.rowSelectionChanged != null) {
            settings["rowSelectionChanged"] = this.rowSelectionChanged;
        }

        if (this.layout != null) {
            settings["layout"] = this.layout;
        }
        //if (this.movableColumns) {
        //  settings["movableColumns"] = this.movableColumns;
        //}
        if (this.responsiveLayout != null) {
            settings["responsiveLayout"] = this.responsiveLayout;
        }
        if (this.responsiveLayoutCollapseStartOpen != null) {
            settings["responsiveLayoutCollapseStartOpen"] = this.responsiveLayoutCollapseStartOpen;
        }
        this.tabulator = new Tabulator(this.tab, settings);
        //this.compRootEl.nativeElement
        // this.compRootEl.nativeElement.appendChild(this.tab);
        //this.renderer.removeChild(this.compRootEl.nativeElement,this.tab);
        this.renderer.appendChild(this.compRootEl.nativeElement, this.tab);
        //document.getElementById('app-tatulator-table').appendChild(this.tab);
    }
}
