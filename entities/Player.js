import { Entity } from './Entity.js';

// Учебная заглушка: игрок пока не участвует в активном runtime.
export class Player extends Entity {
    constructor(camera, physics, scene) {
        super(scene, physics);
        this.camera = camera;
    }

    async init() {}
    move() {}
    update() {}
}
