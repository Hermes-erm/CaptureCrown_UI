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

  planeColor: number = 0xffffff; //  or THREE.ColorRepresentation (type)
  boxColor: number = 0x3256a8;
  sphereColor: number = 0x32a852;

  orbit: OrbitControls | null = null;

  box: THREE.Mesh | null = null;
  sphere: THREE.Mesh | null = null;
  planeBox: THREE.Mesh | null = null;

  gridHelper = new THREE.GridHelper(50, 50);
  directionalLight = new THREE.DirectionalLight(0xffffff, 3.14);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  directionalLightHelper = new THREE.DirectionalLightHelper(
    this.directionalLight,
    5
  );

  mousePosition = new THREE.Vector2();
  mouseMove = new THREE.Vector2();
  vec = new THREE.Vector3();

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
    this.renderer.shadowMap.enabled = true;

    let axesHelper = new THREE.AxesHelper(5); // just to guide us with axes

    // this.createBox();
    this.createFloor();
    this.createSphere();

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

    this.camera.position.set(11.8, 7.3, 10.3);
    this.camera.lookAt(1, 1, 1);

    // this.pivot.add(this.camera); // uncomment to attach with it cube..
    // this.scene.add(this.pivot);

    // now render the scene
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

  reset() {
    // this.resetState = !this.resetState;
    if (this.sphere) this.sphere.position.y = this.maxHeight; // this.maxHeight
  }

  orgInit_velocity: number = 8;
  init_velocity: number = this.orgInit_velocity; // m/s
  velocity: number = 0; // m/s
  time: number = 0; // s
  acceleration: number = -9.81; // m/s^2 || acceleration or gravitational constant (+ acceleration | - deceleration)
  deltaTime: number = 1 / 60; // time elapsed for 1 frame (1 of 60)

  animate() {
    requestAnimationFrame(() => this.animate()); // runs on 60 FPS || sync with browser's refresh rate

    this.moveBall();

    if (this.key_w) this.moveUp();
    if (this.key_a) this.rotateLeft();
    if (this.key_d) this.rotateRight();
    if (this.key_s) this.moveDown();
    this.updateCameraPos();

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

  counterHeight: number = 0;

  moveBall() {
    if (this.sphere) {
      let displacement =
        this.init_velocity * this.time +
        0.5 * this.acceleration * this.time ** 2; // ut + 1/2(at^2)
      this.sphere.position.y = displacement + this.counterHeight; // add height to balance negative displacement

      this.velocity = this.init_velocity + this.acceleration * this.time; // u + at
      this.time += this.deltaTime;

      console.log(this.velocity, displacement);

      // max reached
      if (displacement > this.maxHeight + 0.5) {
        this.init_velocity = 0;
        // this.acceleration *= -1;
        this.time = 0;
        this.counterHeight = this.maxHeight;
        // reached down
      } else if (this.sphere.position.y <= 0) {
        this.init_velocity = this.orgInit_velocity;
        // this.acceleration *= -1;
        this.time = 0;
        this.counterHeight = 0.5;
      }
    }
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
      case ' ':
        this.moveBall();
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

    this.planeBox.receiveShadow = true;
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

  pivot: THREE.Object3D = new THREE.Object3D();

  createSphere() {
    let SphereGeometry = new THREE.SphereGeometry(0.5);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: this.sphereColor,
    });
    this.sphere = new THREE.Mesh(SphereGeometry, sphereMaterial);
    this.sphere.position.set(0, 0.5, 2);
    this.sphere.castShadow = true;
    this.sphere.receiveShadow = true;
    this.scene.add(this.sphere);

    this.sphere.userData = { draggable: false, name: 'SPHERE' }; // or this.box.userData['draggable'] = true;
    this.sphere.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0.5, -24.5),
      max: new THREE.Vector3(24.5, this.maxHeight, 24.5),
    };

    // this.objects.push(this.sphere);
  }

  updateCameraPos() {
    this.box?.getWorldPosition(this.vec);
    this.pivot.position.copy(this.vec); // copy the position of box and copy the vector in to pivot

    let euler = new THREE.Euler();
    euler = this.box?.rotation.clone() || euler; // clone and copy the orientation / rotation of box in to pivot
    this.pivot.rotation.copy(euler);
  }
}
