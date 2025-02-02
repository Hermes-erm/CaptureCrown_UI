import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor() {}

  isOrbit: boolean = true;
  isKeyOpt: boolean = false;

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

  planeColor: number = 0xffffff; //  or THREE.ColorRepresentation (type)
  boxColor: number = 0x3256a8;
  sphereColor: number = 0x32a852;

  orbit: OrbitControls | null = null;

  box: THREE.Mesh | null = null;
  sphere: THREE.Mesh | null = null;
  planeBox: THREE.Mesh | null = null;

  gridHelper = new THREE.GridHelper(50, 50);
  directionalLight = new THREE.DirectionalLight(0xffffff, 3.14);
  ambientLight = new THREE.AmbientLight(0xffffff, 2);
  directionalLightHelper = new THREE.DirectionalLightHelper(
    this.directionalLight
  );

  mousePosition = new THREE.Vector2();
  mouseMove = new THREE.Vector2();

  objects: THREE.Object3D[] = [];

  rayCaster = new THREE.Raycaster();

  intersects: any | null = null;

  draggable: THREE.Object3D | null = null; // manipulate object in 3d space

  dragControl: DragControls | null = null;

  ngOnInit() {
    this.container = document.getElementById('playground'); // element where we gonna put renderer
    if (!this.container) return;
    this.container.appendChild(this.renderer.domElement); // add the renderer inside our specified div

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container?.clientWidth,
      this.container?.clientHeight
    );

    let axesHelper = new THREE.AxesHelper(5); // just to guide us with axes

    this.createBox();
    this.createFloor();
    this.createSphere();

    this.scene.add(axesHelper);
    this.scene.add(this.gridHelper);
    this.directionalLight.position.set(-4, 5, 3);
    this.directionalLight.lookAt(0, 0, 0);
    this.scene.add(this.directionalLight, this.ambientLight); //this.directionalLightHelper

    this.camera = new THREE.PerspectiveCamera(
      75, // fov, camera angle of view ( that cover )
      this.container.clientWidth / this.container.clientHeight, // aspect ratio ( ratio between height and width of the screen )
      0.1, // near clipping plane
      500 // far clipping plane
    );

    this.camera.position.set(0, 6, 7); // x, y, z
    this.camera.lookAt(0, 0, 0);

    // // now render the scene
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // Also can it refered as => which navigate the scene by angular view

    // this.orbit.enableDamping = true;

    this.orbit.enableZoom = true;
    this.orbit.zoomSpeed = 1;
    this.orbit.enablePan = true;
    this.orbit.enableRotate = this.isOrbit; // true to enable orbiting..

    // this.renderer.render(this.scene, this.camera); // only next to orbit control, cz then we can also access orbit in the scene and via camera

    this.dragControl = new DragControls(
      this.objects,
      this.camera,
      this.renderer.domElement
    );

    this.animate();
    this.listenEvent();
  }

  enableOrbit(checked: boolean) {
    if (this.orbit) this.orbit.enableRotate = checked;
  }

  enableKeyOpt(checked: boolean) {
    this.isKeyOpt = checked;
  }

  // count: number = 0;

  animate() {
    requestAnimationFrame(() => this.animate()); // runs on 60 FPS || sync with browser's refresh rate
    // this.count++;
    // if (this.count % 60 == 0) console.log(this.count);

    if (this.key_w) this.moveUp();
    if (this.key_a) this.rotateLeft();
    if (this.key_d) this.rotateRight();
    if (this.key_s) this.moveDown();
    // this.orbit?.update();
    this.box?.position.clamp(
      this.box.userData['limit'].min,
      this.box.userData['limit'].max
    );
    this.sphere?.position.clamp(
      this.sphere.userData['limit'].min,
      this.sphere.userData['limit'].max
    );
    if (this.camera) this.renderer.render(this.scene, this.camera);
  }

  listenEvent() {
    if (!this.dragControl) return;
    this.dragControl.addEventListener('drag', this.dragEvent);

    this.dragControl.addEventListener('dragstart', this.dragStartEvent);

    this.dragControl.addEventListener('dragend', (e) => {
      if (e.object instanceof THREE.Mesh)
        e.object.material.color.set(this.boxColor);
    });

    window.addEventListener('keydown', this.keydownEvent.bind(this)); // bind current class or local to the listener function, else it takes the "this" ( window instance ) in default
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
  }

  dragEvent(e: any) {
    if (!this.orbit) return;
    e.object.position.y = 0.5;
  }

  dragStartEvent(e: any) {
    // ensure or check the type whether it's a mesh (geometry + material)..
    if (e.object instanceof THREE.Mesh) e.object.material.color.set(0xff0000);
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
    }
  }

  keyUpEvent(e: KeyboardEvent) {
    if (!this.isKeyOpt) return;
    let dir = new THREE.Vector3();
    this.box?.getWorldDirection(dir);
    this.sphere?.position.set(dir.x, dir.y, dir.z);
    // this.sphere.tra
    console.log(dir);
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

  moveUp() {
    if (this.box) this.box.translateZ(-this.moveDistance); // translate object, which moves the object along it's *local* z-axis instead of it's global position, || position.z -= 0.5 => global positioning the object
  }

  moveDown() {
    if (this.box) this.box.translateZ(this.moveDistance);
  }

  rotateLeft() {
    let rad = this.rotationDegree * (Math.PI / 180);
    if (this.box) this.box.rotateY(rad); //position.x -= 0.5;
  }

  rotateRight() {
    let rad = this.rotationDegree * (Math.PI / 180);
    if (this.box) this.box.rotateY(-rad); //position.x += 0.5;
  }

  createFloor() {
    let depth = 0.2;
    let planeBoxGeometry = new THREE.BoxGeometry(50, 50, depth);
    let planeBoxMaterial = new THREE.MeshStandardMaterial({
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
    let boxMaterial = new THREE.MeshStandardMaterial({ color: this.boxColor });
    this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    // this.box.geometry.translate(0, 0.5, 0); // to translate the pivot ( origin point ) of the geometry..
    this.box.position.set(0, 0.5, 0);
    this.scene.add(this.box);
    this.objects.push(this.box);

    this.box.userData = { draggable: false, name: 'BOX' }; // or this.box.userData['draggable'] = true;
    this.box.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0.5, -24.5),
      max: new THREE.Vector3(24.5, 0.5, 24.5),
    };
  }

  createSphere() {
    let SphereGeometry = new THREE.SphereGeometry(0.5);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: this.sphereColor,
    });
    this.sphere = new THREE.Mesh(SphereGeometry, sphereMaterial);
    this.sphere.position.set(2, 0.5, 0);
    this.scene.add(this.sphere);
    this.objects.push(this.sphere);

    this.sphere.userData = { draggable: false, name: 'SPHERE' }; // or this.box.userData['draggable'] = true;
    this.sphere.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0.5, -24.5),
      max: new THREE.Vector3(24.5, 0.5, 24.5),
    };
  }
}
