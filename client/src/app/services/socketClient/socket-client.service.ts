import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SocketClientService {
  socket: Socket = io(`http://${environment.HOST}:${environment.PORT}`);

  constructor() {}
}
