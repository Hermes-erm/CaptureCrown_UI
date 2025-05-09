import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Component, Inject } from '@angular/core';

@Component({ template: '' })
export class Player {
  name: string = '';
  playerColor: string;
  player: THREE.Object3D = new THREE.Object3D();

  meshMaterial: THREE.MeshStandardMaterial;

  headRadius: number = 2;
  bodyHeight: number = 8;

  baseLimit: number = 0;
  maxTopLimit: number = 5;
  edgeLimit: number = 35 - 0.5;

  moveDistance: number = 0.1;
  rotationDegree: number = 2;

  orgInit_velocity: number = 8;
  init_velocity: number = this.orgInit_velocity; // m/s
  velocity: number = 0; // m/s
  time: number = 0; // s
  acceleration: number = -9.81; // m/s^2 || acceleration or gravitational constant (+ acceleration | - deceleration)
  deltaTime: number = 1 / 30; // time elapsed for 1 frame (1 of 60)

  counterHeight: number = 0;
  jumpCount: number = 2;

  isJump: boolean = false;

  constructor(
    @Inject('objectColor') objectColor: string,
    @Inject('initPos') initPos: THREE.Vector3
  ) {
    this.playerColor = objectColor;
    this.meshMaterial = new THREE.MeshStandardMaterial({
      color: this.playerColor,
    });

    let headRadius = this.headRadius / 10;
    let bodyHeight = this.bodyHeight / 10;

    let SphereGeometry = new THREE.SphereGeometry(headRadius);
    let sphere = new THREE.Mesh(SphereGeometry, this.meshMaterial);

    let cylinder = new THREE.CylinderGeometry(
      headRadius + 0.1,
      headRadius,
      bodyHeight,
      32
    );
    let cyl = new THREE.Mesh(cylinder, this.meshMaterial);

    this.player.position.copy(initPos);
    this.player.add(cyl, sphere);

    cyl.position.set(0, bodyHeight / 2, 0);
    sphere.position.set(0, bodyHeight + headRadius, 0);

    cyl.castShadow = true;
    cyl.receiveShadow = true;
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    this.player.userData['type'] = 'nativePlayer';
    this.player.userData['limit'] = {
      min: new THREE.Vector3(-this.edgeLimit, this.baseLimit, -this.edgeLimit),
      max: new THREE.Vector3(this.edgeLimit, this.maxTopLimit, this.edgeLimit),
    };
  }

  moveUp() {
    this.player.translateZ(-this.moveDistance); // translate object, which moves the object along it's *local* z-axis instead of it's global position, || position.z -= 0.5 => global positioning the object
  }

  moveDown() {
    this.player.translateZ(this.moveDistance);
  }

  rotateLeft() {
    let rad = this.rotationDegree * (Math.PI / 180);
    this.player.rotateY(rad);
  }

  rotateRight() {
    let rad = this.rotationDegree * (Math.PI / 180);
    this.player.rotateY(-rad);
  }

  jump() {
    let displacement =
      this.init_velocity * this.time + 0.5 * this.acceleration * this.time ** 2; // ut + 1/2(at^2)
    this.player.position.y = displacement + this.counterHeight; // add height to balance negative displacement

    this.velocity = this.init_velocity + this.acceleration * this.time; // u + at
    this.time += this.deltaTime; // increase delta time for more gravitational-pull / pull force towards down..

    // console.log(this.time);

    // max reached
    if (displacement > this.maxTopLimit + 0.5) {
      this.init_velocity = 0;
      this.counterHeight = this.maxTopLimit;
      this.jumpCount--;
      // reached down
    } else if (this.player.position.y <= 0) {
      this.init_velocity = this.orgInit_velocity;
      this.counterHeight = 0.5;
      this.jumpCount--;
      // reset
      if (!this.jumpCount) this.resetVelocityFactors();
    }
  }

  resetVelocityFactors() {
    this.velocity = 0;
    this.time = 0;
    this.jumpCount = 2;
    this.isJump = false;
  }
}
