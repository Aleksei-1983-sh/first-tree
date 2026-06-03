import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Physics } from './Physics.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.physics = new Physics();
        this.demoCube = null;
    }

    async init() {
        this.scene.background = new THREE.Color(0x10131a);
        this.scene.fog = new THREE.Fog(0x10131a, 16, 40);

        this.camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(8, 6, 10);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1, 0);
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 4;
        this.controls.maxDistance = 24;
        this.controls.maxPolarAngle = Math.PI * 0.49;

        this.createLights();
        this.createPlatform();
        this.createCubes();

        await this.physics.init();
        this.physics.addScene(this.scene);
        if (this.demoCube) {
            this.physics.setMeshVelocity(this.demoCube, new THREE.Vector3(1.4, 0.2, 0.5));
        }

        window.addEventListener('resize', () => this.onResize());
        this.renderer.setAnimationLoop(() => this.animate());
    }

    createLights() {
        const ambient = new THREE.HemisphereLight(0xbfd4ff, 0x1b1f26, 1.7);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 2.2);
        sun.position.set(8, 14, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 40;
        sun.shadow.camera.left = -12;
        sun.shadow.camera.right = 12;
        sun.shadow.camera.top = 12;
        sun.shadow.camera.bottom = -12;
        this.scene.add(sun);
    }

    createPlatform() {
        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(18, 0.5, 18),
            new THREE.MeshStandardMaterial({
                color: 0x22272f,
                roughness: 1,
                metalness: 0
            })
        );
        ground.position.y = -0.25;
        ground.receiveShadow = true;
        ground.userData.physics = { mass: 0, restitution: 0.05 };
        this.scene.add(ground);
    }

    createCubes() {
        const size = 0.8;
        const cubeGeometry = new THREE.BoxGeometry(size, size, size);
        const colors = [0xb8c0cc, 0x93a2b5, 0xd3b58d];
        const columns = [-1.6, 0, 1.6];

        for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
            const x = columns[columnIndex];
            const color = colors[columnIndex];

            for (let level = 0; level < 3; level += 1) {
                const cube = new THREE.Mesh(
                    cubeGeometry,
                    new THREE.MeshStandardMaterial({
                        color,
                        roughness: 0.55,
                        metalness: 0.02
                    })
                );
                cube.position.set(x, size / 2 + level * size, 0);
                cube.castShadow = true;
                cube.receiveShadow = true;
                cube.userData.physics = { mass: 1, restitution: 0.12 };
                this.scene.add(cube);

                if (columnIndex === 1 && level === 2) {
                    this.demoCube = cube;
                }
            }
        }
    }

    animate() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
