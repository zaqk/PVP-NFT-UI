import * as PIXI from "pixi.js";
import * as Viewport from "pixi-viewport";
import { Room, Client } from "colyseus.js";
import { BigNumber, ethers } from "ethers";

import { State } from "../server/rooms/State";
import { abi as entityAbi, address as entityAddress } from '../abis/Entity.json';

const ENDPOINT = (process.env.NODE_ENV==="development")
    ? "ws://localhost:8080"
    : "wss://contract-playground.herokuapp.com";

const WORLD_SIZE = 2000;

export const lerp = (a: number, b: number, t: number) => (b - a) * t + a

class PlayerEntity extends PIXI.Graphics {
    id:string
    tokenId:number
}

export class Application extends PIXI.Application {
    entities: { [id: string]: PlayerEntity } = {};
    objects: { [id: string]: PIXI.Graphics } = {};
    currentPlayerEntity: PlayerEntity;

    client = new Client(ENDPOINT);
    room: Room<State>;

    viewport: Viewport;
    _interpolation: boolean;

    constructor () {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0c0c0c
        });

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
        });

        // draw boundaries of the world
        const boundaries = new PIXI.Graphics();
        boundaries.beginFill(0x000000);
        boundaries.drawRoundedRect(0, 0, WORLD_SIZE, WORLD_SIZE, 30);
        this.viewport.addChild(boundaries);

        // add viewport to stage
        this.stage.addChild(this.viewport);

        this.interpolation = false;

        this.viewport.on("click", (e) => {
            console.log(`viewport click caught`)
            if (this.currentPlayerEntity) {
                const point = this.viewport.toLocal(e.data.global);
                this.room.send('moveTo', { x: point.x, y: point.y });
            }
        });
    }

    async connect() {
        const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum, 
            'any'
        )
        const entityContract = new ethers.Contract(
            entityAddress,
            entityAbi,
            provider.getSigner()
        );

        const tx = await entityContract.mint();
        const rc = await tx.wait();
        const event: {args: {tokenId: BigNumber} } = rc.events.find((event: { event: string; }) => event.event === 'NewEntity');
        const tokenId = event.args.tokenId.toNumber();
        console.log(`minted new entity: ${tokenId}`)

        this.room = await this.client.joinOrCreate<State>("arena", { tokenId });

        this.room.state.entities.onAdd = async (entity, sessionId: string) => {
            console.log(entity);
            const color = (entity.radius < 10)
                ? 0xff0000
                : 0xFFFF0B;

            const graphics = new PlayerEntity();
            graphics.lineStyle(0);
            graphics.beginFill(color, 0.5);
            graphics.drawCircle(0, 0, entity.radius);
            graphics.endFill();

            graphics.x = entity.x;
            graphics.y = entity.y;
            graphics.tokenId = entity.tokenId;
            graphics.interactive = true;
            graphics.on('pointerup', async (e) => {
                e.stopPropagation() // prevent movement from viewport onclick
                console.log('me', this.currentPlayerEntity)
                console.log(`other player from event`, e.currentTarget)
                console.log('clicked on player')
                const attacker = BigNumber.from(this.currentPlayerEntity.tokenId);
                const target = BigNumber.from(e.currentTarget.tokenId);
                const gasLimit = await entityContract.estimateGas.attack(attacker, target);
                const tx = await entityContract.attack(attacker, target, {gasLimit});
                await entityContract.estimateGas.attack(attacker, target);
                const result = await tx.wait();
                console.log('attack result', result);
            });

            // detecting current user
            if (sessionId === this.room.sessionId) {
                graphics.tokenId = tokenId; // override tokenId from server (defaults to zero when none)
                this.currentPlayerEntity = graphics;
                this.viewport.follow(this.currentPlayerEntity);
            }
            
            // add object to state
            this.viewport.addChild(graphics);
            this.entities[sessionId] = graphics;

            entity.onChange = (changes) => {
                const color = (entity.radius < 10) ? 0xff0000 : 0xFFFF0B;

                const graphics = this.entities[sessionId];

                // set x/y directly if interpolation is turned off
                if (!this._interpolation) {
                    graphics.x = entity.x;
                    graphics.y = entity.y;
                }

                graphics.clear();
                graphics.lineStyle(0);
                graphics.beginFill(color, 0.5);
                graphics.drawCircle(0, 0, entity.radius);
                graphics.endFill();
            }
        };

        this.room.state.entities.onRemove = (_, sessionId: string) => {
            this.viewport.removeChild(this.entities[sessionId]);
            this.entities[sessionId].destroy();
            delete this.entities[sessionId];
        };
    }

    set interpolation (bool: boolean) {
        this._interpolation = bool;

        if (this._interpolation) {
            this.loop();
        }
    }

    loop () {
        for (let id in this.entities) {
            this.entities[id].x = lerp(this.entities[id].x, this.room.state.entities[id].x, 0.2);
            this.entities[id].y = lerp(this.entities[id].y, this.room.state.entities[id].y, 0.2);
        }

        // continue looping if interpolation is still enabled.
        if (this._interpolation) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
}