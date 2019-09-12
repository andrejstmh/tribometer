import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router"
import { Observable, of, Subject, BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { catchError, map, tap, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

import {
    FormGroup, FormControl, FormGroupDirective, NgForm, Validators, AbstractControl,
    ValidationErrors,ValidatorFn, AsyncValidatorFn
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { trTotalState, trState, trSettings, ObjHelper, trProgram } from './../../models/message.model';
import { SignalsService } from './../../services/signals.service';
import { ChartService, LineChartSettings } from './../../services/chart.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class settingsErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        //const isSubmitted = form && form.submitted;
        //return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
        return !!(control && control.invalid);
    }
}

export function outputFileExistsValidator(signalsService: SignalsService): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        return signalsService.GetOutputFileExists(control.value).pipe(
            debounceTime(300), distinctUntilChanged(),
            map(
                fe => {
                    console.log("outputFileExistsValidator "+fe)
                    return (fe == "1") ? { "outputFileExists": true } : null;
            }
            )
        );
    };
};

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
    settingsForm: FormGroup = null;
    matcher = new settingsErrorStateMatcher();
    constructor(
        private signalsService: SignalsService,
        private router: Router
    ) {
        this.settingsForm = new FormGroup({
            userControl: new FormControl('', [Validators.required]),
            bearingDescrControl: new FormControl('', [Validators.required]),
            outputFileNameControl: new FormControl('', [Validators.required], [outputFileExistsValidator(this.signalsService)]),
            recIntervalControl: new FormControl(1, [Validators.required, Validators.max(600), Validators.min(1)]),
            manualModeControle: new FormControl(true, []),
            exportToCSVControle: new FormControl(true, []),
            durationControl: new FormControl(10, [Validators.required, Validators.min(1), Validators.max(3000)]),
            loadControl: new FormControl(200, [Validators.required, Validators.min(20), Validators.max(1200)]),
            RPMControl: new FormControl(300, [Validators.required, Validators.min(100), Validators.max(1200)]),
            frictThreshControl: new FormControl(100, [Validators.required, Validators.min(5), Validators.max(120)]),
            tempThreshControl: new FormControl(100, [Validators.required, Validators.min(10), Validators.max(120)]),
        });
    }
    
    get userControl() { return this.settingsForm.get('userControl'); }
    get bearingDescrControl() { return this.settingsForm.get('bearingDescrControl'); }
    get outputFileNameControl() { return this.settingsForm.get('outputFileNameControl'); }
    get recIntervalControl() { return this.settingsForm.get('recIntervalControl'); }
    get manualModeControle() { return this.settingsForm.get('manualModeControle'); }
    get exportToCSVControle() { return this.settingsForm.get('exportToCSVControle'); }
    
    get durationControl() { return this.settingsForm.get('durationControl'); }
    get loadControl() { return this.settingsForm.get('loadControl'); }
    get RPMControl() { return this.settingsForm.get('RPMControl'); }
    get frictThreshControl() { return this.settingsForm.get('frictThreshControl'); }
    get tempThreshControl() { return this.settingsForm.get('tempThreshControl'); }

    filteredOptions: Observable<string[]>;

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.users$.value.filter(option => option.toLowerCase().includes(filterValue));
    }

    get programmList(): trProgram[] {
        if (this.lSettings) {
            if (this.lSettings.manual_mode) {
                return this.lSettings.program;
            } else {
                return this.lSettings.program.slice(0, 1);
            }
        } else { return [] };
    }
    ngOnInit() {
        this.filteredOptions = this.userControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value))
        );
        this.userControl.valueChanges.subscribe(resOk => { this.lSettings.user = resOk });
        this.bearingDescrControl.valueChanges.subscribe(resOk => { this.lSettings.bearing = resOk });
        //GetOutputFileExists
        this.outputFileNameControl.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).
            subscribe(resOk => { this.lSettings.output_file = resOk });
        this.recIntervalControl.valueChanges.subscribe(resOk => { this.lSettings.recording_cycle = resOk });
        this.manualModeControle.valueChanges.subscribe(resOk => { this.lSettings.manual_mode = resOk });
        this.exportToCSVControle.valueChanges.subscribe(resOk => { this.lSettings.export_result_to_csv = resOk });

        this.durationControl.valueChanges.subscribe(resOk => { if (this.selectedRow) { this.selectedRow.duration = resOk; } });
        this.loadControl.valueChanges.subscribe(resOk => { if (this.selectedRow) { this.selectedRow.load = resOk; } });
        this.RPMControl.valueChanges.subscribe(resOk => { if (this.selectedRow) { this.selectedRow.RPM = resOk; } });
        this.frictThreshControl.valueChanges.subscribe(resOk => { if (this.selectedRow) { this.selectedRow.Fmax = resOk; }});
        this.tempThreshControl.valueChanges.subscribe(resOk => { if (this.selectedRow) { this.selectedRow.Tmax = resOk; }});


        this.fileExists$ = this.outputFileName$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(fileName =>
                this.signalsService.GetOutputFileExists(fileName))
        );
        //this.OnNewStatus = this.signalsService.lastState$.subscribe(
        //    resOk => { if (resOk) this.totState.state = ObjHelper.DeepCopyOfState(resOk); }
        //);
        
        this.getOperators();
        this.OnNewSetting = this.signalsService.settings$.subscribe(
            resOk => {
                if (resOk) {
                    //this.signalsService.GetOperators().subscribe(
                    //    resOk => { this.users$.next(resOk) }
                    //);
                    this.getOperators();
                    //console.log('request');
                    //console.log(resOk);
                    if (this.lSettings) {
                        if (this.lSettings.output_file !== resOk.output_file) {
                            this.outputFileName$.next(resOk.output_file);
                        }
                    } else {
                        this.outputFileName$.next(resOk.output_file);
                    }
                    this.lSettings = ObjHelper.DeepCopyOfState(resOk);
                    this.lSettings.recording_cycle = Math.round(resOk.recording_cycle * resOk.listening_interval / 1000.0);
                    this.lSettings.manual_mode = !resOk.manual_mode;

                    this.bearingDescrControl.setValue(this.lSettings.bearing);
                    this.outputFileNameControl.setValue(this.lSettings.output_file);
                    this.recIntervalControl.setValue(this.lSettings.recording_cycle);
                    this.manualModeControle.setValue(this.lSettings.manual_mode);
                    this.exportToCSVControle.setValue(this.lSettings.export_result_to_csv);

                    this.durationControl.setValue(this.lSettings.program[0].duration);
                    this.loadControl.setValue(this.lSettings.program[0].load);
                    this.RPMControl.setValue(this.lSettings.program[0].RPM);
                    this.frictThreshControl.setValue(this.lSettings.program[0].Fmax);
                    this.tempThreshControl.setValue(this.lSettings.program[0].Tmax);

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
    getOperators() {
        this.signalsService.GetOperators().subscribe(
            resOk => {
                this.users$.next(resOk);
                if ((this.users$.value) && (this.users$.value.length > 0)) {
                    this.settingsForm.get("userControl").setValue(this.users$.value[0]);
                }
            }
        );
    }
    selectedRow: trProgram = null;
    CreateNewItem(Nr?: number) {
        //if (Nr === undefined) {
        //    return new CurveRow(0, 0, null);
        //} else {
        //    return new CurveRow(0, 0, Nr);
        //}
        let bp = this.lSettings.program[0]
        return new trProgram(bp.duration, bp.load, bp.RPM, bp.Tmax, bp.Fmax, 1);
    }

    onSelectRow(r: any) {
        this.selectedRow = r;
        this.durationControl.setValue(r.duration);
        this.loadControl.setValue(r.load);
        this.RPMControl.setValue(r.RPM);
        this.frictThreshControl.setValue(r.Fmax);
        this.tempThreshControl.setValue(r.Tmax);
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
