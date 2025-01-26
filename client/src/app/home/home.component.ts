import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

  orbit: OrbitControls | null = null;

  boxGeometry = new THREE.BoxGeometry();
  boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff3335 });
  box = new THREE.Mesh(this.boxGeometry, this.boxMaterial);

  planeGeometry = new THREE.PlaneGeometry(10, 10);
  planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);

  gridHelper = new THREE.GridHelper(10, 10);

  ngOnInit() {
    this.container = document.getElementById('playground'); // element where we gonna put renderer
    if (!this.container) return;
    this.container.appendChild(this.renderer.domElement); // add the renderer inside our specified div
    this.renderer.setSize(
      this.container?.clientWidth,
      this.container?.clientHeight
    );
    let axesHelper = new THREE.AxesHelper(5); // just to guide us with axes

    this.box.position.set(0, 0.5, 0);

    this.scene.add(axesHelper, this.box, this.plane);
    this.scene.add(this.gridHelper);

    this.plane.rotation.x = -Math.PI / 2; // in radian

    this.camera = new THREE.PerspectiveCamera(
      75, // fov, camera angle of view ( that cover )
      this.container.clientWidth / this.container.clientHeight, // aspect ratio ( ratio between height and width of the screen )
      0.1, // near clipping plane
      500 // far clipping plane
    );

    this.camera.position.set(2, 2, 2); // x, y, z

    // // now render the scene
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // Also can it refered as => which navigate the scene by angular view

    // this.orbit.enableDamping = true;
    this.orbit.enableZoom = true;
    this.orbit.zoomSpeed = 1;
    this.orbit.enablePan = true;
    this.orbit.enabled = true;

    // this.renderer.render(this.scene, this.camera); // only next to orbit control, cz then we can also access orbit in the scene and via camera

    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.orbit?.update();
    if (this.camera) this.renderer.render(this.scene, this.camera);
    // this.container?.addEventListener('mousemove', () => {
    //   if (!this.camera || !this.orbit) return;
    //   this.orbit.update();
    //   this.renderer.render(this.scene, this.camera);
    //   console.log('hey');
    // });
  }
}
