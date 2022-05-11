import { Schema, type } from "@colyseus/schema";

export class Entity extends Schema {
    @type("float64") x!: number;
    @type("float64") y!: number;
    @type("float32") radius!: number;

    @type("float64") moveToX: number = this.x;
    @type("float64") moveToY: number = this.y;

    dead: boolean = false;
    angle: number = 0;
    speed = 0;

    static distance(a: Entity, b: Entity) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }

    static distanceToPoint(entity: Entity) {
        return Math.sqrt(Math.pow(entity.moveToX - entity.x, 2) + Math.pow(entity.moveToY - entity.y, 2));
    }
}