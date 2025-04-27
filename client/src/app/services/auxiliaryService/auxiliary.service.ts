import { Injectable } from '@angular/core';
import { Player } from '../../models/Player';

@Injectable({
  providedIn: 'root',
})
export class AuxiliaryService {
  // color: string = '#';
  hexColors: string = '0123456789ABCDEF';

  maxEdge: number = 25;

  constructor() {}

  generateColor(): string {
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += this.hexColors[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  getRandomCoordinate(): { x: number; z: number } {
    let x = Math.floor(Math.random() * 25);
    let z = Math.floor(Math.random() * 25);

    if (!(x % 2)) x *= -1;
    if (!(z % 2)) z *= -1;

    return { x: x, z: z };
  }
}

/**
 * (x, 0, z)
 */
