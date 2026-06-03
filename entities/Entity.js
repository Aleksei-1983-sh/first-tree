// Учебная заглушка для будущих игровых сущностей.
export class Entity {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.mesh = null;
    }

    init() {}
    update() {}
    destroy() {}
}
