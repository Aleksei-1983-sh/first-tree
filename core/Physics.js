import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';

export class Physics {
    constructor() {
        this.rapierWorld = null;
    }

    async init() {
        // RapierPhysics загружается асинхронно, потому что движок физики использует WebAssembly.
        this.rapierWorld = await RapierPhysics();
        return this;
    }

    addScene(scene) {
        // three.js читает mesh.userData.physics и создаёт физические тела для объектов сцены.
        this.rapierWorld.addScene(scene);
    }

    addMesh(mesh, mass = 1, restitution = 0.5) {
        this.rapierWorld.addMesh(mesh, mass, restitution);
    }

    setMeshPosition(mesh, position, index = 0) {
        this.rapierWorld.setMeshPosition(mesh, position, index);
    }

    setMeshVelocity(mesh, velocity, index = 0) {
        this.rapierWorld.setMeshVelocity(mesh, velocity, index);
    }

    update() {
        // RapierPhysics из three.js обновляет привязанные mesh-объекты внутри своего helper-а.
        return undefined;
    }
}
