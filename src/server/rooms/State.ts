import { generateId } from "colyseus";
import { Schema, type, MapSchema, filterChildren } from "@colyseus/schema";

import { Entity } from "./Entity";
import { Player } from "./Player";

const WORLD_SIZE = 2000;
export const DEFAULT_PLAYER_RADIUS = 10;

export class State extends Schema {

  width = WORLD_SIZE;
  height = WORLD_SIZE;

  @filterChildren(function(client, key: string, value: Entity, root: State) {
    const currentPlayer = root.entities.get(client.sessionId);
    if (currentPlayer) {
        const a = value.x - currentPlayer.x;
        const b = value.y - currentPlayer.y;

        return (Math.sqrt(a * a + b * b)) <= 500;

    } else {
        return false;
    }
  })
  @type({ map: Entity })
  entities = new MapSchema<Entity>();

  initialize () {
    // create some food entities
    for (let i = 0; i < 20; i++) {
      this.createFood();
    }
  }

  createFood () {
    const food = new Entity().assign({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.max(4, (Math.random() * (DEFAULT_PLAYER_RADIUS - 1)))
    });
    this.entities.set(generateId(), food);
  }

  createPlayer(sessionId: string) {
    this.entities.set(sessionId, new Player().assign({
      x: Math.random() * this.width,
      y: Math.random() * this.height
    }));
  }

  update() {
    const deadEntities: string[] = [];
    this.entities.forEach((entity, sessionId) => {
      if (entity.dead) {
        deadEntities.push(sessionId);
        return;
      }

      if (entity.speed > 0) {
        entity.x -= entity.x !== entity.moveToX ? (Math.cos(entity.angle)) * entity.speed : entity.x;
        entity.y -= entity.y !== entity.moveToY ? (Math.sin(entity.angle)) * entity.speed : entity.y;

        // apply boundary limits
        if (entity.x < 0) { entity.x = 0; }
        if (entity.x > WORLD_SIZE) { entity.x = WORLD_SIZE; }
        if (entity.y < 0) { entity.y = 0; }
        if (entity.y > WORLD_SIZE) { entity.y = WORLD_SIZE; }

        // check if entity has hit point, if so stop moving
        if (Entity.distanceToPoint(entity) <= entity.radius) {
          entity.speed = 0;
        }

      } else {
        //
        // touch all satic entities for filtering by distance...
        //
        entity['$changes'].touch(0);
      }
    });

    // delete all dead entities
    deadEntities.forEach(entityId => {
      this.entities.delete(entityId);
    });
  }
}
