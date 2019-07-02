import { Component, OnInit } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, map, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { trTotalState, trState, trSettings, ObjHelper, trProgram } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    private outputFileName$ = new Subject<string>();
    fileExists$: Observable<string>;
    users$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    totState: trTotalState = null;
    constructor(
        private signalsService: SignalsService) { }
    
    ngOnInit() {
        this.fileExists$ = this.outputFileName$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(fileName =>
                this.signalsService.GetOutputFileExists(fileName))
        );
        
        this.signalsService.totalstate$.subscribe(
            resOk => {
                if (resOk) {
                    this.signalsService.GetOperators().subscribe(
                        resOk => { this.users$.next(resOk) }
                    );
                    //console.log('request');
                    //console.log(resOk);
                    this.totState = ObjHelper.DeepCopyOfState(resOk);
                    //console.log('form data');
                    //console.log(this.totState);
                    //if (this.totState.settings.program.length < 1) {
                    //    this.totState.settings.program.push(this.CreateNewItem());
                    //}
                    //this.selectedRow = this.totState.settings.program[0];

                    

                } else {
                    this.totState = null;

                }
            },
            resErr => { },
            () => { }
        );
    }

    selectedRow: trProgram = null;
    CreateNewItem(Nr?: number) {
        //if (Nr === undefined) {
        //    return new CurveRow(0, 0, null);
        //} else {
        //    return new CurveRow(0, 0, Nr);
        //}
        return new trProgram(1, this.totState.settings.load, this.totState.settings.rpm,
            this.totState.settings.temperature_threshold, this.totState.settings.friction_force_threshold,1);
    }

    onSelectRow(r: any) {
        this.selectedRow = r;
    }

    DeleteRow() {
        let res = this.totState.settings.program;
        let selectedRow_Nr = res.indexOf(this.selectedRow);
        if (selectedRow_Nr != null) {
            if (res.length > 1) {
                res.splice(selectedRow_Nr, 1);
                this.selectedRow = null;
            }
        }
    }

    InsertItem(before: boolean) {
        let res = this.totState.settings.program;
        let nr: number = res.indexOf(this.selectedRow);
        let newItem = this.CreateNewItem();
        if (nr != null) {
            if (before) {
                res.splice(nr, 0, newItem);
            } else {
                res.splice(nr + 1, 0, newItem);
                nr = nr + 1;
            }
        } else {
            if (before) {
                res.unshift(newItem);
                nr = 0;
            } else {
                res.push(newItem);
                nr = res.length - 1;
            }

        }
        this.selectedRow = res[nr];
    }

    InserRowBefore() {
        this.InsertItem(true);
    }

    InserRowAfter() {
        this.InsertItem(false);
    }

    MoveItem(up: boolean) {
        let res = this.totState.settings.program;
        let nr: number = res.indexOf(this.selectedRow);
        let moved: boolean = false;
        if (nr != null) {
            if (up) {
                if (nr > 0) {
                    let it = res[nr];
                    res[nr] = res[nr - 1];
                    nr = nr - 1;
                    res[nr] = it;
                    moved = true;
                }
            } else {
                if (nr < res.length - 1) {
                    let it = res[nr];
                    res[nr] = res[nr + 1];
                    nr = nr + 1;
                    res[nr] = it;
                    moved = true;
                }
            }
            if (moved) {
                this.selectedRow = res[nr];
            }
        }
    }

    MoveUp() {
        this.MoveItem(true);
    }

    MoveDown() {
        this.MoveItem(false);
    }

    onSubmit() {
        this.signalsService.EditSettings(this.totState.settings).subscribe(
            resOk => {
                console.log("EditSettingsOk");
                //console.log(resOk);
                //let v = this.signalsService.totalstate$.value;
                //v.settings = resOk;
                //this.signalsService.totalstate$.next(v);
                //this.totState = DeepCopyOfState(v);
                this.signalsService.GetTotalState();
            },
            resErr => { console.log("EditSettingsErr"); },
            () => { }
        );
    }
    ResFileExists(fileName: string) {
        this.outputFileName$.next(fileName);
    }
}
