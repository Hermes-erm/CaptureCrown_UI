import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuxiliaryService {
  hexColors: string = '0123456789ABCDEF';
  // color: string = '#';

  constructor() {}

  generateColor(): string {
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += this.hexColors[Math.floor(Math.random() * 16)];
    }

    return color;
  }
}
