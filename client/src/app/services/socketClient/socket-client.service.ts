import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';
import { Observable, Subscriber } from 'rxjs';
import { PayLoad, Message } from '../../capture-crown';

@Injectable({
  providedIn: 'root',
})
export class SocketClientService {
  socket: Socket = io(`http://${environment.HOST}:${environment.PORT}`);
  // eventObservable: Observable<any> = new Observable();

  constructor() {}

  broadCast(event: string, data: any) {
    this.socket.emit(event, data);
  }

  onLobby(): Observable<PayLoad[]> {
    return new Observable((subscriber) => {
      this.socket.on(environment.onLobby, (data: PayLoad[]) => {
        subscriber.next(data);
      });
    });
  }

  onPlayerLeft(): Observable<PayLoad> {
    return new Observable((subscriber) => {
      this.socket.on(environment.onPlayerLeft, (data: PayLoad) => {
        subscriber.next(data);
      });
    });
  }

  onMessage(): Observable<Message> {
    return new Observable((subscriber) => {
      this.socket.on(environment.message, (data: Message) => {
        subscriber.next(data);
      });
    });
  }

  // onPoseEvent
  onPlayer(event: string): Observable<PayLoad> {
    return new Observable((subscriber) => {
      this.socket.on(event, (data: PayLoad) => {
        subscriber.next(data); // JSON.parse(data)
      });
    });
  }
}
