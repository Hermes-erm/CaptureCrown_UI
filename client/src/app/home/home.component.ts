import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Player } from '../models/Player';
import { Plane } from '../models/Plane';
import { PayLoad, Message } from '../capture-crown';
import { environment } from '../../environments/environment.development';
import { SocketClientService } from '../services/socketClient/socket-client.service';
import { ToastServiceService } from '../services/toastService/toast-service.service';
import { AuxiliaryService } from '../services/auxiliaryService/auxiliary.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isOrbit: boolean = true;
  isKeyOpt: boolean = true;
  isJump: boolean = false;

  key_w: number = 0;
  key_a: number = 0;
  key_s: number = 0;
  key_d: number = 0;

  tickRate: number = 4; // 4Hz <= 10Hz

  container: HTMLElement | null = null;
  renderer = new THREE.WebGLRenderer({ antialias: true }); // give space to render the animated part (on HTML canvas) by webGl | antialias - smoothen the edges/pixels of an object
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera | null = null; // better perspective camera over orthographic camera

  planeColor: string = '#b2b0f7';
  sphereColor: string = '0x32a852';

  /**
    params for Dom & styles
   */
  name: string = '';
  inputStatus: string = 'basic';

  hideInput: boolean = false;
  hideButton: boolean = false;

  activeContainer: string = 'welcome';
  welcomeText: string = `Give your name to get into lobby..`;
  /** */

  orbit: OrbitControls | null = null;

  player: Player = new Player('#34abeb', new THREE.Vector3(0, 0, 0));
  playerObject: THREE.Object3D = this.player.player;

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
  objects: THREE.Object3D[] = [];
  pivot: THREE.Object3D = new THREE.Object3D();

  loader: GLTFLoader = new GLTFLoader();

  viewId: number = 1;
  view: THREE.Vector3[] = [
    new THREE.Vector3(0, 1, 2), // fpv
    new THREE.Vector3(0, 1.2, 3), // spv
    new THREE.Vector3(0, 3, 5), // tpv
  ];

  playersPose: PayLoad[] = [];
  players: Map<string, Player> = new Map();

  constructor(
    private socketClientService: SocketClientService,
    private toastServiceService: ToastServiceService,
    private auxiliaryService: AuxiliaryService
  ) {
    this.ambientLight.position.set(10, 10, 10);
    this.directionalLight.position.set(-5, 10, -5);
    // this.directionalLight.castShadow = true;

    this.socketClientService
      .onPlayer(environment.playersPose)
      .subscribe((playersPose: PayLoad) => {
        this.updatePlayersPosition(playersPose); //this.playersPose[0] = playersPose;
      });

    this.socketClientService.onPlayerLeft().subscribe((player: PayLoad) => {
      let playerToExit: Player | undefined = this.players.get(player.name);
      console.log('player left: ', playerToExit);
      if (playerToExit) {
        console.log('player gonna remove: ', playerToExit);
        this.scene.remove(playerToExit.player);
        this.players.delete(player.name);
      }
    });
  }

  ngOnInit() {
    this.container = document.getElementById('playground'); // element where we gonna put renderer
    if (!this.container) return;
    this.container.appendChild(this.renderer.domElement); // add the renderer inside our specified div

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.shadowMap.enabled = true;

    let axesHelper = new THREE.AxesHelper(5);

    let plane = new Plane(new THREE.Vector2(50, 50), 0.2, this.planeColor);

    this.scene.add(
      plane.plane,
      axesHelper,
      this.ambientLight,
      this.directionalLight,
      this.gridHelper
    );

    this.camera = new THREE.PerspectiveCamera(
      75, // fov, camera angle of view ( that cover )
      this.container.clientWidth / this.container.clientHeight, // aspect ratio ( ratio between height and width of the screen )
      0.1, // near clipping plane
      500 // far clipping plane
    );

    let view = this.view[this.viewId];
    this.camera.position.set(view.x, view.y, view.z);

    this.playerObject.getWorldPosition(this.vec);
    this.camera.lookAt(this.vec.x, this.vec.y, this.vec.z);

    // this.pivot.add(this.camera); // uncomment to attach with it cube..
    // this.scene.add(this.pivot, this.playerObject);
    // this.getIntoLobby(this.playerObject, this.player.playerColor);

    this.socketClientService.onLobby().subscribe((data: PayLoad[]) => {
      console.log('from server: ', data);
      data.forEach((player: PayLoad) => {
        if (this.players.get(player.name)) return;
        this.onNewPlayer(player);
      });
    });

    this.socketClientService
      .onPlayer(environment.onNewPlayer)
      .subscribe((player: PayLoad) => {
        console.log('new single player arrived: ', player);
        this.onNewPlayer(player);
      });

    this.pivot.userData['limit'] = {
      min: new THREE.Vector3(-24.5, 0, -24.5),
      max: new THREE.Vector3(24.5, 5, 24.5), // udjust to 0.5 to limit max height
    };

    // now render the scene
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // Also can it refered as => which navigate the scene by angular view

    // this.orbit.enableDamping = true;
    this.orbit.enableZoom = true;
    this.orbit.zoomSpeed = 1;
    this.orbit.enablePan = true;
    this.orbit.enableRotate = this.isOrbit; // true to enable orbiting..
    this.objects.push(this.playerObject, this.pivot);

    // this.animate();
    // this.listenEvent();

    setInterval(() => {
      let position: THREE.Vector3 = this.playerObject.position;
      let payLoad: PayLoad;
      payLoad = {
        name: this.player.name,
        pose: {
          x: position.x,
          y: position.y,
          z: position.z,
          angle: this.playerObject.rotation.clone(),
        },
        color: this.player.playerColor,
      };

      // this.broadCastPosition(payLoad);
    }, 1000);
  }

  ngAfterViewInit() {
    this.animate();
    this.listenEvent();
  }

  reset() {
    this.playerObject.position.set(0, 0, 0);
    this.playerObject.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 0), 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate()); // runs on 60 FPS || sync with browser's refresh rate

    if (this.player.isJump) this.player.jump();

    if (this.key_w) this.player.moveUp();
    if (this.key_a) this.player.rotateLeft();
    if (this.key_d) this.player.rotateRight();
    if (this.key_s) this.player.moveDown();
    this.updateCameraPos();

    // this.players.forEach((player: PayLoad) => {});

    this.objects.forEach((object3d: THREE.Object3D) => {
      object3d.position.clamp(
        object3d.userData['limit'].min,
        object3d.userData['limit'].max
      );
    });
    if (this.camera) this.renderer.render(this.scene, this.camera);
  }

  toggleView() {
    this.viewId++;
    if (this.viewId > 2) this.viewId = 0;
    const personView = this.view[this.viewId];

    this.camera?.position.set(personView.x, personView.y, personView.z);
  }

  listenEvent() {
    window.addEventListener('keydown', this.keydownEvent.bind(this)); // bind current class or local to the listener function, else it takes the "this" ( window instance ) in default
    window.addEventListener('keyup', this.keyUpEvent.bind(this));

    let fieldElement: HTMLElement | null = document.getElementById('name-ip');
    if (!fieldElement) return;
    fieldElement.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') this.registerName();
    });
  }

  // without player (hidden), camera track the player`s position in the static place of itself.. (camera)
  registerName() {
    if (!this.name) {
      this.inputStatus = 'danger';
      return;
    }

    this.players.forEach((player: Player, name: string) => {
      if (name === this.name) {
        this.welcomeText = `Player with this name already exists in this lobby, try another..`;
        this.inputStatus = 'danger';
        this.name = '';
        return;
      }
    });
    if (!this.name) return;

    this.hideInput = true;
    this.hideButton = true;

    this.player.name = this.name;
    this.playerObject.name = this.name;

    if (this.camera) this.pivot.add(this.camera);
    this.scene.add(this.pivot, this.playerObject);

    let initialPose = this.getInitialPose();
    this.playerObject.position.set(initialPose.x, 0, initialPose.z);

    this.getIntoLobby(this.playerObject, this.auxiliaryService.generateColor()); // this.player.playerColor
  }

  updateCameraPos() {
    this.playerObject.getWorldPosition(this.vec);
    this.pivot.position.copy(this.vec); // copy the position of box and copy the vector in to pivot

    this.camera?.lookAt(this.vec.x, this.vec.y, this.vec.z);

    let euler = new THREE.Euler();
    euler = this.playerObject.rotation.clone(); // clone and copy the orientation / rotation of box in to pivot
    this.pivot.rotation.copy(euler);
  }

  toastMessage(data: string) {
    this.toastServiceService.showToast('top-left', data);
  }

  keyUpEvent(e: KeyboardEvent) {
    if (!this.isKeyOpt) return;
    switch (e.key.toLowerCase()) {
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

  enableOrbit(checked: boolean) {
    if (this.orbit) this.orbit.enableRotate = checked;
  }

  enableKeyOpt(checked: boolean) {
    this.isKeyOpt = checked;
  }

  keydownEvent(e: KeyboardEvent) {
    if (!this.isKeyOpt) return;
    switch (e.key.toLowerCase()) {
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
      case 'v':
        this.toggleView();
        break;
      case ' ':
        this.player.isJump = true;
        break;
    }
  }

  onNewPlayer(newPlayer: PayLoad) {
    let pose = newPlayer.pose;
    let initPose: THREE.Vector3 = new THREE.Vector3(pose.x, pose.y, pose.z);
    let player = new Player(newPlayer.color, initPose);
    this.players.set(newPlayer.name, player);
    this.scene.add(player.player);
  }

  broadCastPosition(payLoad: PayLoad) {
    this.socketClientService.broadCast(environment.playersPose, payLoad);
  }

  updatePlayersPosition(data: PayLoad) {
    const player: Player | undefined = this.players.get(data.name);
    if (!player) return;
    const playerObj: THREE.Object3D = player.player;
    const pose = data.pose;
    playerObj.position.set(pose.x, pose.y, pose.z);
    playerObj.rotation.copy(data.pose.angle);
  }

  getInitialPose(): { x: number; z: number } {
    let isPoseExist: boolean = false;
    let randomPose = this.auxiliaryService.getRandomCoordinate();

    const playersPose = this.players.values(); // retuns MapIterator!
    for (let player of playersPose) {
      let pose = player.player.position;
      if (pose.x == randomPose.x && pose.z == randomPose.z) {
        isPoseExist = true;
        break;
      }
    }

    if (isPoseExist) this.getInitialPose();
    return randomPose;
  }

  getIntoLobby(player: THREE.Object3D, color: string) {
    console.log('get on lobby: ', player.name);
    this.player.meshMaterial.color.set(color);
    let pose: THREE.Vector3 = player.position;
    let playerInfo: PayLoad = {
      name: player.name,
      pose: { x: pose.x, y: pose.y, z: pose.z, angle: player.rotation.clone() },
      color: color,
    };

    this.socketClientService.broadCast(environment.onNewPlayer, playerInfo);
  }

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
      min: new THREE.Vector3(-24.5, 0, -24.5),
      max: new THREE.Vector3(24.5, 0.5, 24.5),
    };
  }
}

// this.renderer.render(this.scene, this.camera); // only next to orbit control, cz then we can also access orbit in the scene and via camera
// this.createSphere();
// this.addBTP();
// addBTP() {
//   this.loader.load('samp.glb', (gltfObject: GLTF) => {
//     this.btP = gltfObject.scene;
//     this.btP.rotateY(-Math.PI / 2);
//     this.scene.add(this.btP);
//   });
//   this.btP.userData['limit'] = {
//     min: new THREE.Vector3(-24.5, 0.5, -24.5),
//     max: new THREE.Vector3(24.5, this.maxHeight, 24.5),
//   };
// }
