import { Component,  Input, OnInit,OnChanges, SimpleChanges,ElementRef,Renderer2 } from '@angular/core';
import Tabulator from 'tabulator-tables';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-tabulator-table',
  templateUrl: './tabulator-table.component.html',
  styleUrls: ['./tabulator-table.component.css']
})
export class TabulatorTableComponent implements OnInit,OnChanges {
  @Input() tableClass:string="";
  @Input() tableData: any[] = [];
  @Input() tableColumns: any[] = [];
 // @Input() height: string = '311px';
  @Input() layout: any = null;
  @Input() rowFormatter: any = null;
  @Input() rowClick: any = null;
  //@Input() movableColumns: any = true;
  @Input() responsiveLayout: any = null;
  @Input() responsiveLayoutCollapseStartOpen: boolean = false;
  @Input() selectable: boolean = false; //make rows selectable

  tab = document.createElement('div');
  tabulator:Tabulator = null;
  constructor(private compRootEl: ElementRef,private renderer: Renderer2) {
   }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {  
      this.drawTable(); 
  }

  private drawTable(): void {
    //this.tabulator = new Tabulator(this.compRootEl.nativeElement, {
    if (this.tableClass){
      this.tab.setAttribute("class",this.tableClass);
    }
    let settings = {
      data: this.tableData,
      columns: this.tableColumns,
      height: "311px"
    }
    if (this.rowFormatter) {
      settings["rowFormatter"] = this.rowFormatter;
    }
    if (this.rowClick) {
      settings["rowClick"] = this.rowClick;
    }
    if (this.layout) {
      settings["layout"] = this.layout;
    }
    if (this.selectable) {
      settings["selectable"] = this.selectable;
    }
    //if (this.movableColumns) {
    //  settings["movableColumns"] = this.movableColumns;
    //}
    if (this.responsiveLayout) {
      settings["responsiveLayout"] = this.responsiveLayout;
    }
    if (this.responsiveLayoutCollapseStartOpen != null) {
      settings["responsiveLayoutCollapseStartOpen"] = this.responsiveLayoutCollapseStartOpen;
    }
    this.tabulator = new Tabulator(this.tab, settings);
    //this.compRootEl.nativeElement
    // this.compRootEl.nativeElement.appendChild(this.tab);
    //this.renderer.removeChild(this.compRootEl.nativeElement,this.tab);
    this.renderer.appendChild(this.compRootEl.nativeElement, this.tab );
    //document.getElementById('app-tatulator-table').appendChild(this.tab);
  }
}
