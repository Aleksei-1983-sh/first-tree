import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';

export class Physics {
    /**
     * Хранит ссылку на helper RapierPhysics, который связывает three.js mesh и физику Rapier.
     */
    constructor() {
        this.rapierWorld = null;
    }

    /**
     * Асинхронно загружает физический движок и возвращает текущий wrapper для цепочки вызовов.
     */
    async init() {
        // RapierPhysics загружается асинхронно, потому что движок физики использует WebAssembly.
        this.rapierWorld = await RapierPhysics();
        return this;
    }

    /**
     * Добавляет в физический мир все mesh из сцены, у которых есть userData.physics.
     */
    addScene(scene) {
        // three.js читает mesh.userData.physics и создаёт физические тела для объектов сцены.
        this.rapierWorld.addScene(scene);
    }

    /**
     * Добавляет один mesh, созданный уже после первичной регистрации сцены в физике.
     */
    addMesh(mesh, mass = 1, restitution = 0.5) {
        this.rapierWorld.addMesh(mesh, mass, restitution);
    }

    /**
     * Принудительно переносит физическое тело mesh в новую позицию.
     */
    setMeshPosition(mesh, position, index = 0) {
        this.rapierWorld.setMeshPosition(mesh, position, index);
    }

    /**
     * Задаёт физическому телу скорость, что удобно для бросков и стартовых импульсов.
     */
    setMeshVelocity(mesh, velocity, index = 0) {
        this.rapierWorld.setMeshVelocity(mesh, velocity, index);
    }

    /**
     * Оставлен как учебная точка расширения для будущего ручного шага симуляции.
     */
    update() {
        // RapierPhysics из three.js обновляет привязанные mesh-объекты внутри своего helper-а.
        return undefined;
    }
}
