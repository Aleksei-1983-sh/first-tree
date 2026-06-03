import { Entity } from './Entity.js';

// Учебная заглушка: снаряд пригодится для будущего разрушения конструкции.
export class Ball extends Entity {
    constructor(scene, physics, origin, direction) {
        super(scene, physics);
        this.origin = origin.clone();
        this.direction = direction.clone();
    }

    async spawn() {}
    update() {}
    checkCollisions() {}
    shouldRemove() { return false; }
}
