import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Physics } from './Physics.js';

// Эти настройки собраны сверху, чтобы начинающему было проще менять сцену.
const CAMERA_FIELD_OF_VIEW = 55;
const CAMERA_NEAR_PLANE = 0.1;
const CAMERA_FAR_PLANE = 100;
const PLATFORM_SIZE = 18;
const PLATFORM_HEIGHT = 0.5;
const BLOCK_SIZE = 0.8;
const WALL_COLUMNS = 5;
const WALL_LEVELS = 4;
const WALL_ROW_SPACING = 0.04;
const PROJECTILE_RADIUS = 0.28;
const PROJECTILE_SPEED = 12;
const PROJECTILE_START = new THREE.Vector3(0, 1.6, 6.5);
const PROJECTILE_TARGET = new THREE.Vector3(0, 1.3, 0);
const MAX_PROJECTILES = 6;

export class Game {
    /**
     * Создаёт главный объект игры и хранит ссылки на системы, которые нужны между кадрами.
     */
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.orbitControls = null;
        this.physics = new Physics();

        // Массивы ниже нужны, чтобы позже было легко добавить очистку, счётчик или перезапуск.
        this.structureBlocks = [];
        this.projectiles = [];
        this.lastShotTime = 0;
        this.hudStatusElement = null;
    }

    /**
     * Запускает сцену: создаёт графику, физические тела, обработчики ввода и render-loop.
     */
    async init() {
        this.setupSceneBackground();
        this.setupCamera();
        this.setupRenderer();
        this.setupOrbitControls();
        this.setupHud();

        this.createLights();
        this.createPlatform();
        this.createObservationGrid();
        this.createDestructionStructure();
        this.createLauncherGuide();

        await this.physics.init();
        this.physics.addScene(this.scene);

        this.setupInputHandlers();
        window.addEventListener('resize', () => this.handleWindowResize());
        this.renderer.setAnimationLoop(() => this.renderFrame());
    }

    /**
     * Настраивает фон и туман, чтобы блоки и платформа читались на тёмной сцене.
     */
    setupSceneBackground() {
        // Тёмный фон и лёгкий туман помогают лучше видеть форму платформы и кубов.
        this.scene.background = new THREE.Color(0x10131a);
        this.scene.fog = new THREE.Fog(0x10131a, 16, 40);
    }

    /**
     * Создаёт перспективную камеру наблюдателя.
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_FIELD_OF_VIEW,
            window.innerWidth / window.innerHeight,
            CAMERA_NEAR_PLANE,
            CAMERA_FAR_PLANE
        );
        this.camera.position.set(8, 6, 10);
    }

    /**
     * Создаёт WebGL renderer, включает тени и добавляет canvas в документ.
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Подключает OrbitControls, чтобы сцену можно было осматривать мышью без логики игрока.
     */
    setupOrbitControls() {
        // OrbitControls дают режим наблюдения: можно вращать камеру и приближаться колёсиком.
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.target.set(0, 1.2, 0);
        this.orbitControls.enableDamping = true;
        this.orbitControls.enablePan = false;
        this.orbitControls.minDistance = 4;
        this.orbitControls.maxDistance = 24;
        this.orbitControls.maxPolarAngle = Math.PI * 0.49;
    }

    /**
     * Находит строку HUD, которую игра будет обновлять после броска снаряда.
     */
    setupHud() {
        this.hudStatusElement = document.querySelector('[data-hud-status]');
        this.updateHudStatus('Нажми Space или кнопку мыши: шар полетит в башню из блоков.');
    }

    /**
     * Создаёт базовый свет: общий для читаемости и направленный для теней.
     */
    createLights() {
        // Мягкий общий свет подсвечивает тени, чтобы объекты не пропадали в темноте.
        const hemisphereLight = new THREE.HemisphereLight(0xbfd4ff, 0x1b1f26, 1.7);
        this.scene.add(hemisphereLight);

        // Направленный свет создаёт понятные тени от блоков на платформе.
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

    /**
     * Создаёт неподвижную платформу, от которой будут отскакивать блоки и снаряды.
     */
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

    /**
     * Добавляет визуальную сетку масштаба; она не участвует в расчёте физики.
     */
    createObservationGrid() {
        // Сетка не участвует в физике. Она нужна только как визуальная подсказка масштаба.
        const gridHelper = new THREE.GridHelper(PLATFORM_SIZE, PLATFORM_SIZE, 0x536174, 0x303946);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    /**
     * Строит компактную стенку из отдельных динамических блоков для учебного разрушения.
     */
    createDestructionStructure() {
        const blockGeometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const blockColors = [0xb8c0cc, 0x93a2b5, 0xd3b58d, 0xcf8f8f];

        for (let levelIndex = 0; levelIndex < WALL_LEVELS; levelIndex += 1) {
            for (let columnIndex = 0; columnIndex < WALL_COLUMNS; columnIndex += 1) {
                const offsetFromCenter = columnIndex - (WALL_COLUMNS - 1) / 2;
                const isOddLevel = levelIndex % 2 === 1;

                // Небольшое смещение каждого второго ряда делает башню менее "идеальной".
                // Так удар шара легче превращается в заметный завал, а не в абсолютно ровное скольжение.
                const position = new THREE.Vector3(
                    offsetFromCenter * (BLOCK_SIZE + WALL_ROW_SPACING) + (isOddLevel ? BLOCK_SIZE * 0.25 : 0),
                    BLOCK_SIZE / 2 + levelIndex * (BLOCK_SIZE + WALL_ROW_SPACING),
                    0
                );

                const blockMesh = this.createPhysicsBlock({
                    geometry: blockGeometry,
                    color: blockColors[levelIndex % blockColors.length],
                    position,
                    name: `Structure block ${levelIndex + 1}-${columnIndex + 1}`
                });

                this.structureBlocks.push(blockMesh);
            }
        }
    }

    /**
     * Создаёт один физический блок и возвращает mesh, чтобы вызывающий код мог его запомнить.
     */
    createPhysicsBlock({ geometry, color, position, name }) {
        // Каждый блок — динамическое физическое тело: mass = 1 значит, что гравитация двигает его.
        const blockMaterial = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.55,
            metalness: 0.02
        });
        const blockMesh = new THREE.Mesh(geometry, blockMaterial);

        blockMesh.name = name;
        blockMesh.position.copy(position);
        blockMesh.castShadow = true;
        blockMesh.receiveShadow = true;
        blockMesh.userData.physics = { mass: 1, restitution: 0.08 };
        this.scene.add(blockMesh);

        return blockMesh;
    }

    /**
     * Добавляет простую визуальную подсказку направления, откуда летит шар.
     */
    createLauncherGuide() {
        const launcherGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.7, 24);
        const launcherMaterial = new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            roughness: 0.35,
            metalness: 0.08
        });
        const launcherMesh = new THREE.Mesh(launcherGeometry, launcherMaterial);

        launcherMesh.name = 'Projectile launcher guide';
        launcherMesh.position.copy(PROJECTILE_START);
        launcherMesh.rotation.x = Math.PI * 0.5;
        launcherMesh.castShadow = true;
        this.scene.add(launcherMesh);
    }

    /**
     * Подключает клавиатуру и мышь как простой источник воздействия на конструкцию.
     */
    setupInputHandlers() {
        window.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                this.launchProjectile();
            }
        });

        this.renderer.domElement.addEventListener('pointerdown', (event) => {
            // Левая кнопка мыши бросает шар; остальные кнопки оставляем OrbitControls.
            if (event.button === 0) {
                this.launchProjectile();
            }
        });
    }

    /**
     * Создаёт новый шар-снаряд, регистрирует его в физике и задаёт стартовую скорость.
     */
    launchProjectile() {
        const now = performance.now();

        // Простая защита от спама: Rapier успевает стабильнее посчитать столкновения.
        if (now - this.lastShotTime < 450) {
            return;
        }

        // У three.js RapierPhysics helper нет учебно-простого removeMesh(), поэтому старые шары
        // оставляем видимыми физическими телами и просто ограничиваем их количество.
        if (this.projectiles.length >= MAX_PROJECTILES) {
            this.updateHudStatus('Достигнут лимит шаров для учебного демо. Перезагрузи страницу, чтобы начать заново.');
            return;
        }

        this.lastShotTime = now;

        const projectileGeometry = new THREE.SphereGeometry(PROJECTILE_RADIUS, 32, 16);
        const projectileMaterial = new THREE.MeshStandardMaterial({
            color: 0xf97316,
            roughness: 0.4,
            metalness: 0.05
        });
        const projectileMesh = new THREE.Mesh(projectileGeometry, projectileMaterial);

        projectileMesh.name = `Projectile ${this.projectiles.length + 1}`;
        projectileMesh.position.copy(PROJECTILE_START);
        projectileMesh.castShadow = true;
        projectileMesh.receiveShadow = true;
        this.scene.add(projectileMesh);

        // Важный момент: объекты, созданные после physics.addScene(), нужно вручную добавить в physics.
        this.physics.addMesh(projectileMesh, 2.2, 0.35);

        const velocity = this.getProjectileVelocity();
        this.physics.setMeshVelocity(projectileMesh, velocity);

        this.projectiles.push(projectileMesh);
        this.updateHudStatus('Снаряд запущен: наблюдай, как отдельные блоки разъезжаются от столкновения.');
    }

    /**
     * Считает направление броска от точки старта к центру конструкции и умножает его на скорость.
     */
    getProjectileVelocity() {
        // normalize() превращает вектор в направление длиной 1, чтобы PROJECTILE_SPEED был удобной ручкой.
        const direction = PROJECTILE_TARGET.clone().sub(PROJECTILE_START).normalize();
        return direction.multiplyScalar(PROJECTILE_SPEED);
    }

    /**
     * Обновляет текстовую строку HUD, если соответствующий элемент есть в HTML.
     */
    updateHudStatus(message) {
        if (!this.hudStatusElement) {
            return;
        }

        this.hudStatusElement.textContent = message;
    }

    /**
     * Выполняется каждый кадр: обновляет controls и рисует текущую сцену.
     */
    renderFrame() {
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Подгоняет камеру и canvas под новый размер окна браузера.
     */
    handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
