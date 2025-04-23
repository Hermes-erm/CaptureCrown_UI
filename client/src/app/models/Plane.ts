import { Component, Inject } from '@angular/core';
import * as THREE from 'three';

@Component({ template: '' })
export class Plane {
  planeGeometry: THREE.BoxGeometry;
  planeMaterial: THREE.MeshStandardMaterial;
  plane: THREE.Mesh;

  planeDepth: number;

  planeColor: string;
  constructor(
    @Inject('dimension') dimension: THREE.Vector2,
    @Inject('depth') depth: number,
    @Inject('color') color: string
  ) {
    this.planeDepth = depth;
    this.planeColor = color;
    this.planeGeometry = new THREE.BoxGeometry(dimension.x, dimension.y, depth);
    this.planeMaterial = new THREE.MeshStandardMaterial({
      color: this.planeColor,
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);

    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = -(this.planeDepth / 2); // half of depth

    this.plane.receiveShadow = true;
    this.plane.userData = { ground: true };
  }
}
