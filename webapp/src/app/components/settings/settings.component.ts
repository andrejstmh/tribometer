import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router"
import { Observable, of, Subject, BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { catchError, map, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { trTotalState, trState, trSettings, ObjHelper, trProgram } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
    private outputFileName$ = new Subject<string>();
    fileExists$: Observable<string>;
    users$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    lSettings: trSettings = null;
    //totState: trTotalState = new trTotalState(null, null);
    OnNewSetting: Subscription = null;
    OnNewStatus: Subscription = null;
    constructor(
        private signalsService: SignalsService,
        private router: Router
    ) { }

    ngOnInit() {
        this.fileExists$ = this.outputFileName$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(fileName =>
                this.signalsService.GetOutputFileExists(fileName))
        );
        //this.OnNewStatus = this.signalsService.lastState$.subscribe(
        //    resOk => { if (resOk) this.totState.state = ObjHelper.DeepCopyOfState(resOk); }
        //);

        this.OnNewSetting = this.signalsService.settings$.subscribe(
            resOk => {
                if (resOk) {
                    this.signalsService.GetOperators().subscribe(
                        resOk => { this.users$.next(resOk) }
                    );
                    //console.log('request');
                    //console.log(resOk);
                    if (this.lSettings) {
                        if (this.lSettings.output_file !== resOk.output_file) {
                            this.outputFileName$.next(resOk.output_file);
                        }
                    } else {
                        this.outputFileName$.next(resOk.output_file);
                    }
                    resOk.recording_cycle = Math.round(resOk.recording_cycle * resOk.listening_interval / 1000.0);
                    resOk.manual_mode = !resOk.manual_mode;
                    this.lSettings = ObjHelper.DeepCopyOfState(resOk);
                } else {
                    this.lSettings = null;
                }
            },
            resErr => { },
            () => { }
        );
    }
    ngOnDestroy() {
        if (this.OnNewSetting) this.OnNewSetting.unsubscribe();
        if (this.OnNewStatus) this.OnNewStatus.unsubscribe();
    }
    selectedRow: trProgram = null;
    CreateNewItem(Nr?: number) {
        //if (Nr === undefined) {
        //    return new CurveRow(0, 0, null);
        //} else {
        //    return new CurveRow(0, 0, Nr);
        //}
        return new trProgram(1, this.lSettings.load, this.lSettings.rpm,
            this.lSettings.temperature_threshold, this.lSettings.friction_force_threshold,1);
    }

    onSelectRow(r: any) {
        this.selectedRow = r;
    }

    DeleteRow() {
        let res = this.lSettings.program;
        let selectedRow_Nr = res.indexOf(this.selectedRow);
        if (selectedRow_Nr != null) {
            if (res.length > 1) {
                res.splice(selectedRow_Nr, 1);
                this.selectedRow = null;
            }
        }
    }

    InsertItem(before: boolean) {
        let res = this.lSettings.program;
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
        let res = this.lSettings.program;
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
        let ss = ObjHelper.DeepCopyOfState(this.lSettings);
        ss.recording_cycle = Math.round(ss.recording_cycle * 1000 / ss.listening_interval);
        ss.manual_mode = !ss.manual_mode;
        this.signalsService.EditSettings(ss).subscribe(
            resOk => {
                console.log("EditSettingsOk");
                //console.log(resOk);
                //let v = this.signalsService.totalstate$.value;
                //v.settings = resOk;
                //this.signalsService.totalstate$.next(v);
                //this.totState = DeepCopyOfState(v);
                this.signalsService.GetTotalState();
                if (resOk.output_file) {
                    this.router.navigate(['/controls']);
                }
            },
            resErr => { console.log("EditSettingsErr"); },
            () => { }
        );
    }
    ResFileExists(fileName: string) {
        this.outputFileName$.next(fileName);
    }
}
