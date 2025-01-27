import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
// import { OrbitControls } from 'three-orbitcontrols-ts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor() {}

  container: HTMLElement | null = null;
  renderer = new THREE.WebGLRenderer(); // give space to render the animated part (on HTML canvas) by webGl
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera | null = null; // better perspective camera over orthographic camera

  planeColor: number = 0xffffff; //  or THREE.ColorRepresentation (type)
  boxColor: number = 0x3256a8;

  orbit: OrbitControls | null = null;

  box: THREE.Mesh | null = null;

  planeBox: THREE.Mesh | null = null;

  gridHelper = new THREE.GridHelper(10, 10);

  mousePosition = new THREE.Vector2();
  mouseMove = new THREE.Vector2();

  rayCaster = new THREE.Raycaster();

  intersects: any | null = null;

  draggable: THREE.Object3D | null = null; // manipulate object in 3d space

  dragControl: DragControls | null = null;

  ngOnInit() {
    this.container = document.getElementById('playground'); // element where we gonna put renderer
    if (!this.container) return;
    this.container.appendChild(this.renderer.domElement); // add the renderer inside our specified div
    this.renderer.setSize(
      this.container?.clientWidth,
      this.container?.clientHeight
    );

    let axesHelper = new THREE.AxesHelper(5); // just to guide us with axes

    this.createBox();
    this.createFloor();

    this.scene.add(axesHelper);
    this.scene.add(this.gridHelper);

    this.camera = new THREE.PerspectiveCamera(
      75, // fov, camera angle of view ( that cover )
      this.container.clientWidth / this.container.clientHeight, // aspect ratio ( ratio between height and width of the screen )
      0.1, // near clipping plane
      500 // far clipping plane
    );

    this.camera.position.set(5, 5, 5); // x, y, z
    this.camera.lookAt(0, 0, 0);

    // // now render the scene
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // Also can it refered as => which navigate the scene by angular view

    // this.orbit.enableDamping = true;

    this.orbit.enableZoom = true;
    this.orbit.zoomSpeed = 1;
    this.orbit.enablePan = true;
    this.orbit.enableRotate = false; // true to enable orbiting..

    // this.renderer.render(this.scene, this.camera); // only next to orbit control, cz then we can also access orbit in the scene and via camera

    if (this.box)
      this.dragControl = new DragControls(
        [this.box],
        this.camera,
        this.renderer.domElement
      );

    this.animate();
    this.listenEvent();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    // this.orbit?.update();
    if (this.camera) this.renderer.render(this.scene, this.camera);
  }

  listenEvent() {
    if (!this.dragControl) return;
    this.dragControl.addEventListener('drag', (e) => {
      if (!this.orbit) return;
      // this.orbit.enableZoom = false;
      // this.orbit.zoomSpeed = 1;
      // this.orbit.enablePan = false;
      // this.orbit.enabled = false;
      e.object.position.y = 0.5;
      // if (this.camera) this.renderer.render(this.scene, this.camera);
    });
  }

  createFloor() {
    let depth = 0.2;
    let planeBoxGeometry = new THREE.BoxGeometry(10, 10, depth);
    let planeBoxMaterial = new THREE.MeshBasicMaterial({
      color: this.planeColor,
      side: THREE.DoubleSide,
    });
    this.planeBox = new THREE.Mesh(planeBoxGeometry, planeBoxMaterial);

    this.planeBox.rotation.x = -Math.PI / 2;
    this.planeBox.position.y = -(depth / 2); // half of depth

    this.scene.add(this.planeBox);
    this.planeBox.userData = { ground: true };
  }

  createBox() {
    let boxGeometry = new THREE.BoxGeometry();
    let boxMaterial = new THREE.MeshBasicMaterial({ color: this.boxColor });
    this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.box.position.set(0, 0.5, 0);
    this.scene.add(this.box);

    this.box.userData = { draggable: false, name: 'BOX' }; // or this.box.userData['draggable'] = true;
  }
}
