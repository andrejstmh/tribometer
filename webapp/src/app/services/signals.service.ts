import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { webSocket } from "rxjs/webSocket";
import {
    trState, trProgram, trSettings, trResultFileData, trTotalState,
    SensorsData, CalibrationCurve, trResultBase64FileData,
    base_url, SERVER_URL,
    SensorsDataBase64, SocketMessageDataBase64, SocketMessageData
} from './../models/message.model';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
}

@Injectable()
export class SignalsService {
    //totalstate$: BehaviorSubject<trTotalState> = new BehaviorSubject<trTotalState>(null);
    settings$: BehaviorSubject<trSettings> = new BehaviorSubject<trSettings>(null);
    lastData$: BehaviorSubject<SensorsData> = new BehaviorSubject(null);
    lastState$: BehaviorSubject<trState> = new BehaviorSubject(null);
    subsctiprion: Subscription[] = null;
    //socket = webSocket<SocketMessageData>(SERVER_URL);
    socket = webSocket<SocketMessageDataBase64>(SERVER_URL).pipe(map(x => {
        let res = new SocketMessageData(x);
        return res;
    }));

    constructor(private http: HttpClient ) {
        //this.GetState().subscribe(x => { this.state = x });
        //this.GetSettings().subscribe(x => { this.settings = x });
    }

    //getTotalState() {
    //    forkJoin(this.GetState(), this.GetSettings()).subscribe(([st, stt]) => {
    //        this.totalstate$.next(new trTotalState(stt, st));
    //    })
    //}

    //subsctiprion: Subscription[] = null;
    //public initSocket(): void {
    //    //this.socket = socketIo(SERVER_URL);
    //    this.subsctiprion.push(this.socket.subscribe(
    //        msg => {
    //            //console.log('msg: ' + msg); // Called whenever there is a message from the server.
    //            //console.log('msg');
    //            if (msg.sensorData) {
    //                this.lastData$.next(msg.sensorData);
    //            }
    //            if (msg.state) {
    //                this.lastState$.next(msg.state);
    //            }
    //        },
    //        err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
    //        () => console.log('socket connection is closed!') // Called when connection is closed (for whatever reason).
    //    )
    //    );
    //}

    public send(message: SensorsData): void {
        //this.socket.emit('message', message);
    }

    //public onMessage(): Observable<SensorsData> {
    //    return of(null);
    //    // return new Observable<SensorsData>(observer => {
    //    //   this.socket.on('message', (data: SensorsData) => observer.next(data));
    //    // });
    //}

    // public onEvent(event: Event): Observable<any> {
    //   return new Observable<Event>(observer => {
    //     this.socket.on(event, () => observer.next());
    //   });
    // }


    public startListen(): Observable<any> {
        const url = base_url + "api/beginr";
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("startListen")),
            catchError(this.handleError<any>("startListen"))
        );
    }
    public stopListen(): Observable<any> {
        const url = base_url + "api/endr";
        this.subsctiprion.forEach(it => { it.unsubscribe(); });
        this.subsctiprion = [];
        //this.buffer = [];
        //this.lastData$.next(null);
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("stopListen")),
            catchError(this.handleError<any>("stopListen"))

        );
    }

    beginWrite(): Observable<any> {
        const url = base_url + "api/beginw";
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("beginWrite")),
            catchError(this.handleError<any>("beginWrite"))
        );
    }
    endWrite(): Observable<any> {
        const url = base_url + "api/endw";
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("endWrite")),
            catchError(this.handleError<any>("endWrite"))
        );
    }
    UpdateSettings() {
        this.GetSettings().subscribe(
            resOk => { this.settings$.next(resOk); }
        );
    }
    UpdateStatus() {
        this.GetState().subscribe(
            resOk => { this.lastState$.next(new trState(resOk)); }
        );
    }
    GetTotalState() {
        forkJoin(this.GetState(), this.GetSettings()).subscribe(
            ([st, stt]) => {
                //console.log("Get Settings: Ok");
                this.settings$.next(stt);
                this.lastState$.next(new trState(st));
                //this.totalstate$.next(new trTotalState(stt, new trState(st)))
            },
            resErr => { console.log("Get Settings: Error"); },
            () => { }
        );
    }

    GetCalibrationCurve(clbr_curve_name: string): Observable<CalibrationCurve> {
        let url = base_url + `api/sett?case=${clbr_curve_name}`;
        return this.http.get<CalibrationCurve>(url).pipe(
            tap(_ => console.log("GetCalibrationCurve")),
            catchError(this.handleError<any>("GetCalibrationCurve"))
        );
    }

    UpdateLoadManual(delta: number): Observable<string> {
        let url = base_url + `api/sett?case=manualload&val=${delta}`;
        return this.http.get<string>(url).pipe(
            tap(_ => console.log("UpdateLoadManual")),
            catchError(this.handleError<any>("UpdateLoadManual"))
        );
    }

    UpdateRPMManual(delta: number): Observable<string> {
        let url = base_url + `api/sett?case=manualrpm&val=${delta}`;
        return this.http.get<string>(url).pipe(
            tap(_ => console.log("UpdateRPMManual")),
            catchError(this.handleError<any>("UpdateRPMManual"))
        );
    }
    StopRotationsManual(): Observable<string> {
        let url = base_url + `api/sett?case=manualstoprot`;
        return this.http.get<string>(url).pipe(
            tap(_ => console.log("StopRotationsManual")),
            catchError(this.handleError<any>("StopRotationsManual"))
        );
    }
    
    UpdateThresholds(frict: number, temp: number): Observable<trSettings> {
        let url = base_url + `api/sett?case=threshold&f=${frict}&t=${temp}`;
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("UpdateThresholds")),
            catchError(this.handleError<any>("UpdateThresholds"))
        );
    }
    //st_case == "operators" fileexists val
    GetOperators(): Observable<string[]> {
        let url = base_url + "api/sett?case=operators";
        return this.http.get<string[]>(url).pipe(
            tap(_ => console.log("GetOperators")),
            catchError(this.handleError<any>("GetOperators"))
        );
    }
    GetOutputFileExists(fileName:string): Observable<string> {
        let url = base_url + `api/sett?case=fileexists&val=${fileName}`;
        return this.http.get<string>(url).pipe(
            tap(_ => console.log("GetOutputFileExists")),
            catchError(this.handleError<any>("GetOutputFileExists"))
        );
    }

    EditCalibrationCurve(clbr_curve_name: string, curve_data: CalibrationCurve): Observable<CalibrationCurve> {
        let url = base_url + `api/sett?case=${clbr_curve_name}`;
        return this.http.post<CalibrationCurve>(url, curve_data, httpOptions).pipe(
            catchError(this.handleError('EditCalibrationCurve', curve_data))
        );
    }

    GetState(): Observable<string> {
        let url = base_url + "api/sett?case=st";
        return this.http.get<string>(url).pipe(
            tap(_ => console.log("GetState")),
            catchError(this.handleError<any>("GetState"))
        );//.pipe(map(stStr => { console.log(stStr); return (stStr != null) ? new trState(stStr) : null; }));
    }

    GetSettings(): Observable<trSettings> {
        let url = base_url + "api/sett?case=base";
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("GetSettings")),
            catchError(this.handleError<any>("GetSettings"))
        );
    }

    EditSettings(data: trSettings): Observable<trSettings> {
        let url = base_url + "api/sett?case=base";
        return this.http.post<trSettings>(url, data, httpOptions).pipe(
            catchError(this.handleError("EditSettings", data))
        );
    }

    SetRPM(rpm: number): Observable<trSettings> {
        let url = base_url + `api/sett?case=rpm&val=${rpm}`;
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("SetRPM")),
            catchError(this.handleError<any>("SetRPM"))
        );
    }

    SetLoad(load: number): Observable<trSettings> {
        let url = base_url + `api/sett?case=load&val=${load}`;
        return this.http.get<trSettings>(url).pipe(
            tap(_ => console.log("SetLoad")),
            catchError(this.handleError<any>("SetLoad"))
        );
    }

    GetDataFromResultFile(): Observable<trResultBase64FileData> {
        let url = base_url + "api/sett?case=resultfile";
        return this.http.get<trResultBase64FileData>(url).pipe(
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
