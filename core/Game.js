import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Physics } from './Physics.js';

// Эти настройки собраны сверху, чтобы начинающему было проще менять сцену.
const CAMERA_FIELD_OF_VIEW = 55;
const CAMERA_NEAR_PLANE = 0.1;
const CAMERA_FAR_PLANE = 100;
const PLATFORM_SIZE = 18;
const PLATFORM_HEIGHT = 0.5;
const CUBE_SIZE = 0.8;
const CUBE_COLUMNS = [-1.6, 0, 1.6];
const CUBE_LEVELS = 3;

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.orbitControls = null;
        this.physics = new Physics();

        // Этот куб получает небольшой стартовый толчок, чтобы сразу было видно физику.
        this.cubeForPhysicsDemo = null;
    }

    async init() {
        this.setupSceneBackground();
        this.setupCamera();
        this.setupRenderer();
        this.setupOrbitControls();

        this.createLights();
        this.createPlatform();
        this.createObservationGrid();
        this.createCubeStack();

        await this.physics.init();
        this.physics.addScene(this.scene);
        this.pushDemoCube();

        window.addEventListener('resize', () => this.handleWindowResize());
        this.renderer.setAnimationLoop(() => this.renderFrame());
    }

    setupSceneBackground() {
        // Тёмный фон и лёгкий туман помогают лучше видеть форму платформы и кубов.
        this.scene.background = new THREE.Color(0x10131a);
        this.scene.fog = new THREE.Fog(0x10131a, 16, 40);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_FIELD_OF_VIEW,
            window.innerWidth / window.innerHeight,
            CAMERA_NEAR_PLANE,
            CAMERA_FAR_PLANE
        );
        this.camera.position.set(8, 6, 10);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(this.renderer.domElement);
    }

    setupOrbitControls() {
        // OrbitControls дают режим наблюдения: можно вращать камеру и приближаться колёсиком.
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.target.set(0, 1, 0);
        this.orbitControls.enableDamping = true;
        this.orbitControls.enablePan = false;
        this.orbitControls.minDistance = 4;
        this.orbitControls.maxDistance = 24;
        this.orbitControls.maxPolarAngle = Math.PI * 0.49;
    }

    createLights() {
        // Мягкий общий свет подсвечивает тени, чтобы объекты не пропадали в темноте.
        const hemisphereLight = new THREE.HemisphereLight(0xbfd4ff, 0x1b1f26, 1.7);
        this.scene.add(hemisphereLight);

        // Направленный свет создаёт понятные тени от кубов на платформе.
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
        sunLight.position.set(8, 14, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.set(1024, 1024);
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 40;
        sunLight.shadow.camera.left = -12;
        sunLight.shadow.camera.right = 12;
        sunLight.shadow.camera.top = 12;
        sunLight.shadow.camera.bottom = -12;
        this.scene.add(sunLight);
    }

    createPlatform() {
        // Платформа — статичное физическое тело: mass = 0 значит, что она не падает.
        const platformGeometry = new THREE.BoxGeometry(
            PLATFORM_SIZE,
            PLATFORM_HEIGHT,
            PLATFORM_SIZE
        );
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x22272f,
            roughness: 1,
            metalness: 0
        });
        const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);

        platformMesh.position.y = -PLATFORM_HEIGHT / 2;
        platformMesh.receiveShadow = true;
        platformMesh.userData.physics = { mass: 0, restitution: 0.05 };
        this.scene.add(platformMesh);
    }

    createObservationGrid() {
        // Сетка не участвует в физике. Она нужна только как визуальная подсказка масштаба.
        const gridHelper = new THREE.GridHelper(PLATFORM_SIZE, PLATFORM_SIZE, 0x536174, 0x303946);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    createCubeStack() {
        const cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        const cubeColors = [0xb8c0cc, 0x93a2b5, 0xd3b58d];

        CUBE_COLUMNS.forEach((columnPositionX, columnIndex) => {
            const cubeColor = cubeColors[columnIndex];

            for (let levelIndex = 0; levelIndex < CUBE_LEVELS; levelIndex += 1) {
                const cubeMesh = this.createPhysicsCube({
                    geometry: cubeGeometry,
                    color: cubeColor,
                    position: new THREE.Vector3(
                        columnPositionX,
                        CUBE_SIZE / 2 + levelIndex * CUBE_SIZE,
                        0
                    )
                });

                if (columnIndex === 1 && levelIndex === CUBE_LEVELS - 1) {
                    this.cubeForPhysicsDemo = cubeMesh;
                }
            }
        });
    }

    createPhysicsCube({ geometry, color, position }) {
        // Каждый куб — динамическое физическое тело: mass = 1 значит, что гравитация двигает его.
        const cubeMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.55,
            metalness: 0.02
        });
        const cubeMesh = new THREE.Mesh(geometry, cubeMaterial);

        cubeMesh.position.copy(position);
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        cubeMesh.userData.physics = { mass: 1, restitution: 0.12 };
        this.scene.add(cubeMesh);

        return cubeMesh;
    }

    pushDemoCube() {
        if (!this.cubeForPhysicsDemo) {
            return;
        }

        // Небольшой импульс верхнему кубу делает старт сцены живым и показывает столкновения.
        this.physics.setMeshVelocity(this.cubeForPhysicsDemo, new THREE.Vector3(1.4, 0.2, 0.5));
    }

    renderFrame() {
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
    }

    handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
