import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Player } from '../models/Player';
import { Plane } from '../models/Plane';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isOrbit: boolean = true;
  isKeyOpt: boolean = true;
  resetState: boolean = true;
  isJump: boolean = false;
  maxHeight: number = 5;

  key_w: number = 0;
  key_a: number = 0;
  key_s: number = 0;
  key_d: number = 0;

  moveDistance: number = 0.1;
  rotationDegree: number = 2;

  container: HTMLElement | null = null;
  renderer = new THREE.WebGLRenderer({ antialias: true }); // give space to render the animated part (on HTML canvas) by webGl | antialias - smoothen the edges/pixels of an object
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera | null = null; // better perspective camera over orthographic camera

  planeColor: number = 0xcfcfcf; //  or THREE.ColorRepresentation (type)
  boxColor: number = 0x3256a8;
  sphereColor: number = 0x32a852;

  orbit: OrbitControls | null = null;

  player: Player = new Player('#34abeb', new THREE.Vector3(0, 0.5, 0));
  playerObject: THREE.Mesh = this.player.player;
  sphere: THREE.Mesh | null = null;
  btP: THREE.Object3D = new THREE.Object3D(); // object3d -> base class

  gridHelper = new THREE.GridHelper(50, 50);
  directionalLight = new THREE.DirectionalLight(0xffffff, 3.14);
  ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  directionalLightHelper = new THREE.DirectionalLightHelper(
    this.directionalLight,
    5
  );

  vec = new THREE.Vector3();

  // draggable: THREE.Object3D | null = null; // manipulate object in 3d space
  objects: THREE.Object3D[] = [];

  loader: GLTFLoader = new GLTFLoader();

  ngOnInit() {
    this.container = document.getElementById('playground'); // element where we gonna put renderer
    if (!this.container) return;
    this.container.appendChild(this.renderer.domElement); // add the renderer inside our specified div

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container?.clientWidth,
      this.container?.clientHeight
    );
    this.renderer.shadowMap.enabled = true;

    let axesHelper = new THREE.AxesHelper(5); // just to guide us with axes

    // this.createSphere();
    // this.addBTP();

    let plane = new Plane(new THREE.Vector2(50, 50), 0.2, '#b2b0f7');
    this.scene.add(plane.plane, this.playerObject);

    this.directionalLight.position.set(0, 5, 3);
    this.directionalLight.castShadow = true;

    this.scene.add(axesHelper);
    this.scene.add(this.ambientLight, this.directionalLight);
    this.scene.add(this.gridHelper);

    this.camera = new THREE.PerspectiveCamera(
      75, // fov, camera angle of view ( that cover )
      this.container.clientWidth / this.container.clientHeight, // aspect ratio ( ratio between height and width of the screen )
      0.1, // near clipping plane
      500 // far clipping plane
    );

    this.camera.position.set(0, 4, 6);
    this.camera.lookAt(1, 1, 1);

    this.pivot.add(this.camera); // uncomment to attach with it cube..
    this.scene.add(this.pivot);

    this.pivot.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0.5, -24.5),
      max: new THREE.Vector3(24.5, 0.5, 24.5),
    };

    // now render the scene
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // Also can it refered as => which navigate the scene by angular view

    // this.orbit.enableDamping = true;

    this.orbit.enableZoom = true;
    this.orbit.zoomSpeed = 1;
    this.orbit.enablePan = true;
    this.orbit.enableRotate = this.isOrbit; // true to enable orbiting..
    this.objects.push(this.playerObject, this.pivot);

    this.animate();
    this.listenEvent();
  }

  enableOrbit(checked: boolean) {
    if (this.orbit) this.orbit.enableRotate = checked;
  }

  enableKeyOpt(checked: boolean) {
    this.isKeyOpt = checked;
  }

  reset() {
    this.playerObject.position.set(0, 0.5, 0);
    this.playerObject.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 0), 0);
  }

  toggleView() {
    // this.camera?.position.set(1, 2, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate()); // runs on 60 FPS || sync with browser's refresh rate

    if (this.player.isJump) this.player.jump();

    if (this.key_w) this.player.moveUp();
    if (this.key_a) this.player.rotateLeft();
    if (this.key_d) this.player.rotateRight();
    if (this.key_s) this.player.moveDown();
    this.updateCameraPos();

    this.objects.forEach((object3d: THREE.Object3D) => {
      object3d.position.clamp(
        object3d.userData['limit'].min,
        object3d.userData['limit'].max
      );
    });
    if (this.camera) this.renderer.render(this.scene, this.camera);
  }

  counterHeight: number = 0;
  jumpCount: number = 2;

  listenEvent() {
    window.addEventListener('keydown', this.keydownEvent.bind(this)); // bind current class or local to the listener function, else it takes the "this" ( window instance ) in default
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
  }

  keydownEvent(e: KeyboardEvent) {
    if (!this.isKeyOpt) return;
    switch (e.key) {
      case 'w':
        this.key_w = 1;
        break;
      case 'a':
        this.key_a = 1;
        break;
      case 's':
        this.key_s = 1;
        break;
      case 'd':
        this.key_d = 1;
        break;
      case ' ':
        this.player.isJump = true;
        break;
    }
  }

  keyUpEvent(e: KeyboardEvent) {
    if (!this.isKeyOpt) return;
    switch (e.key) {
      case 'w':
        this.key_w = 0;
        break;
      case 'a':
        this.key_a = 0;
        break;
      case 's':
        this.key_s = 0;
        break;
      case 'd':
        this.key_d = 0;
        break;
    }
  }

  pivot: THREE.Object3D = new THREE.Object3D();

  createSphere() {
    let SphereGeometry = new THREE.SphereGeometry(0.5);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: this.sphereColor,
    });
    this.sphere = new THREE.Mesh(SphereGeometry, sphereMaterial);
    this.sphere.position.set(4, 0.5, 2);
    this.sphere.castShadow = true;
    this.sphere.receiveShadow = true;
    this.scene.add(this.sphere);

    // this.sphere.userData = { draggable: false, name: 'SPHERE' }; // or this.box.userData['draggable'] = true;
    this.sphere.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0.5, -24.5),
      max: new THREE.Vector3(24.5, this.maxHeight, 24.5),
    };
  }

  addBTP() {
    this.loader.load('samp.glb', (gltfObject: GLTF) => {
      this.btP = gltfObject.scene;
      this.btP.rotateY(-Math.PI / 2);
      this.scene.add(this.btP);
    });
    this.btP.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0.5, -24.5),
      max: new THREE.Vector3(24.5, this.maxHeight, 24.5),
    };
  }

  updateCameraPos() {
    this.playerObject.getWorldPosition(this.vec);
    this.pivot.position.copy(this.vec); // copy the position of box and copy the vector in to pivot

    let euler = new THREE.Euler();
    euler = this.playerObject.rotation.clone() || euler; // clone and copy the orientation / rotation of box in to pivot
    this.pivot.rotation.copy(euler);
  }
}

// this.renderer.render(this.scene, this.camera); // only next to orbit control, cz then we can also access orbit in the scene and via camera
