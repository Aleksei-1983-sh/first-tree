// Учебная заглушка: стену позже можно превратить в разрушаемую конструкцию.
export class Wall {
    constructor(scene, physics, options) {
        this.scene = scene;
        this.physics = physics;
        this.options = options;
        this.cubes = [];
    }

    build() {}
    destroy() { this.cubes = []; }
}
