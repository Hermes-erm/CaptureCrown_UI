import { Injectable } from '@angular/core';
import { Player } from '../../models/Player';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class AuxiliaryService {
  // color: string = '#';
  hexColors: string = '0123456789ABCDEF';

  maxEdge: number = 24.5;

  rockCount: number = 24.5;
  rocks: THREE.Mesh[] = [];

  constructor() {}

  generateColor(): string {
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += this.hexColors[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  getRandomCoordinate(): { x: number; z: number } {
    let x = Math.floor(Math.random() * this.maxEdge);
    let z = Math.floor(Math.random() * this.maxEdge);

    if (!(x % 2)) x *= -1;
    if (!(z % 2)) z *= -1;

    return { x: x, z: z };
  }

  getRocks(): THREE.Mesh[] {
    let dodecahedronGeo = new THREE.DodecahedronGeometry(0.5, 0);
    let material = new THREE.MeshStandardMaterial({ color: 'grey' });
    for (let i = 0; i < this.rockCount; i++) {
      const dodecahedron = new THREE.Mesh(dodecahedronGeo, material);

      let pos = this.randomRockPos();

      dodecahedron.receiveShadow = true;
      dodecahedron.castShadow = true;
      dodecahedron.position.set(pos.x, 0, pos.z);
      this.rocks.push(dodecahedron);
    }
    return this.rocks;
  }

  randomRockPos(): { x: number; z: number } {
    let x = Math.floor(Math.random() * this.maxEdge);
    let z = Math.floor(Math.random() * this.maxEdge);

    if (Math.floor(Math.random() * 2)) x *= -1;
    if (Math.floor(Math.random() * 2)) z *= -1;

    console.log(x, z);

    return { x: x, z: z };
  }
}
