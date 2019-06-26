import { Injectable } from '@angular/core';
import { Observable, Observer, of, Subscription, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators'

//import * as socketIo from 'socket.io-client';
import { webSocket } from "rxjs/webSocket";
import { forEach } from '@angular/router/src/utils/collection';
//import { Message } from '../model/message';
//import { Event } from '../model/event';

import { SensorsData, SocketMessageData, trState, SERVER_URL, base_url } from './../models/message.model';

//const SERVER_URL = 'ws://localhost:8787/ss';

@Injectable()
export class SocketService {
    constructor(private http: HttpClient) { }
    lastData$: BehaviorSubject<SensorsData> = new BehaviorSubject(null);
    lastState$: BehaviorSubject<trState> = new BehaviorSubject(null);
    socket = webSocket<SocketMessageData>(SERVER_URL);
    subsctiprion: Subscription[] = null;
    public initSocket(): void {
        //this.socket = socketIo(SERVER_URL);
        this.subsctiprion.push(this.socket.subscribe(
            msg => {
                //console.log('msg: ' + msg); // Called whenever there is a message from the server.
                //console.log('msg');
                if (msg.sensorData) {
                    this.lastData$.next(msg.sensorData);
                }
                if (msg.state) {
                    this.lastState$.next(msg.state);
                }
            },
            err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
            () => console.log('socket connection is closed!') // Called when connection is closed (for whatever reason).
        )
        );
    }

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
        const url = base_url+"beginr";
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("startListen")),
            catchError(this.handleError<any>("startListen"))
        );
    }
    public stopListen(): Observable<any> {
        const url = base_url +"endr";
        this.subsctiprion.forEach(it => { it.unsubscribe(); });
        this.subsctiprion = [];
        //this.buffer = [];
        //this.lastData$.next(null);
        return this.http.get<any>(url).pipe(
            tap(_ => console.log("stopListen")),
            catchError(this.handleError<any>("stopListen"))

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
