import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
    trState, trProgram, trSettings, trResultFileData, trTotalState,
    CalibrationCurve,  base_url
} from './../models/message.model';

//const base_url = "http://localhost:8787/";

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
}


@Injectable()
export class SignalsService {
    totalstate$: BehaviorSubject<trTotalState> = new BehaviorSubject<trTotalState>(null);

    constructor(private http: HttpClient) {
        //this.GetState().subscribe(x => { this.state = x });
        //this.GetSettings().subscribe(x => { this.settings = x });
    }

    getTotalState() {
        forkJoin(this.GetState(), this.GetSettings()).subscribe(([st, stt]) => {
            this.totalstate$.next(new trTotalState(stt, st));
        })
    }

    beginWrite(): Observable<any> {
        const url = base_url + "beginw";
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("beginWrite")),
            catchError(this.handleError<any>("beginWrite"))
        );
    }
    endWrite(): Observable<any> {
        const url = base_url + "endw";
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("endWrite")),
            catchError(this.handleError<any>("endWrite"))
        );
    }

    GetTotalState() {
        forkJoin(this.GetState(), this.GetSettings()).subscribe(
            ([st, stt]) => {
                console.log("Get Settings: Ok");
                this.totalstate$.next(new trTotalState(stt, st))
            },
            resErr => { console.log("Get Settings: Error"); },
            () => { }
        );
    }

    GetCalibrationCurve(clbr_curve_name: string): Observable<CalibrationCurve> {
        let url = base_url + `sett?case=${clbr_curve_name}`;
        return this.http.get<CalibrationCurve>(url).pipe(
            tap(_ => console.log("GetCalibrationCurve")),
            catchError(this.handleError<any>("GetCalibrationCurve"))
        );
    }

    EditCalibrationCurve(clbr_curve_name: string, curve_data: CalibrationCurve): Observable<CalibrationCurve> {
        let url = base_url + `sett?case=${clbr_curve_name}`;
        return this.http.post<CalibrationCurve>(url, curve_data, httpOptions).pipe(
            catchError(this.handleError('EditCalibrationCurve', curve_data))
        );
    }

    GetState(): Observable<trState> {
        let url = base_url + "sett?case=st";
        return this.http.get<trState>(url).pipe(
            tap(_ => console.log("GetState")),
            catchError(this.handleError<any>("GetState"))
        );
    }

    GetSettings(): Observable<trSettings> {
        let url = base_url + "sett?case=base";
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("GetSettings")),
            catchError(this.handleError<any>("GetSettings"))
        );
    }

    EditSettings(data: trSettings): Observable<trSettings> {
        let url = base_url + "sett?case=base";
        return this.http.post<trSettings>(url, data, httpOptions).pipe(
            catchError(this.handleError("EditSettings", data))
        );
    }

    SetRPM(rpm: number): Observable<number> {
        let url = base_url + `sett?case=rpm&val=${rpm}`;
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("SetRPM")),
            catchError(this.handleError<any>("SetRPM"))
        );
    }

    SetLoad(load: number): Observable<number> {
        let url = base_url + `sett?case=load&val=${load}`;
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("SetLoad")),
            catchError(this.handleError<any>("SetLoad"))
        );
    }

    GetDataFromResultFile(): Observable<trResultFileData> {
        let url = base_url + "sett?case=resultfile";
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("GetDataFromResultFile")),
            catchError(this.handleError<any>("GetDataFromResultFile"))
        );
    }
    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            console.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
