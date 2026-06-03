import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';

export class Physics {
    constructor() {
        this.rapier = null;
    }

    async init() {
        this.rapier = await RapierPhysics();
        return this;
    }

    addScene(scene) {
        this.rapier.addScene(scene);
    }

    addMesh(mesh, mass = 1, restitution = 0.5) {
        this.rapier.addMesh(mesh, mass, restitution);
    }

    setMeshPosition(mesh, position, index = 0) {
        this.rapier.setMeshPosition(mesh, position, index);
    }

    setMeshVelocity(mesh, velocity, index = 0) {
        this.rapier.setMeshVelocity(mesh, velocity, index);
    }

    update() {
        return undefined;
    }
}
