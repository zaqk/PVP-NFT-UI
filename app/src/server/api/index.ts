import { Router } from 'express';
import { matchMaker } from "colyseus";
import {ethers} from 'ethers';
import {DEFAULT_PLAYER_RADIUS} from '../rooms/State';
import {Entity} from '../rooms/Entity';
const apiRouter = Router()

apiRouter.get('/api/health', async (_, res) => {
  res.send({ result: { success: true, error: false, } });
  return;
});

apiRouter.post('/api/turing-proximity', async (req, res) => {
  try{
    let result = false;
    let { body } = req.body;

    console.log(`a === ${ethers.utils.hexDataSlice(body, 0, 32)}`)
    console.log(`b === ${ethers.utils.hexDataSlice(body, 32, body.length)}`)

    const attackerTokenId = ethers.BigNumber.from(
      ethers.utils.hexDataSlice(body, 0, 32)
    ).toNumber();
    const victimTokenId = ethers.BigNumber.from(
      ethers.utils.hexDataSlice(body, 32, 64)
    ).toNumber();

    console.log('attackerTokenId', attackerTokenId)
    console.log('victimTokenId', victimTokenId)

    // there will only ever be one room for this POC
    const { roomId } = await matchMaker.findOneRoomAvailable("arena", {});
    const room = matchMaker.getRoomById(roomId);

    // no need to optimize
    let attacker: Entity | null = null;
    let victim: Entity | null = null;
    room.state.entities.forEach((entity) => {
      if(entity.tokenId === attackerTokenId) attacker = entity;
      if(entity.tokenId === victimTokenId) victim = entity;
    })

    if (attacker && victim) {
      const isInProximity = Entity.distance(attacker, victim) < DEFAULT_PLAYER_RADIUS * 4;
      result = isInProximity;
    }
    res.send(ethers.utils.solidityPack(['bool'], [result]));

    return;
  } catch(err) {
    console.error(err);
    return;
  }
});

export default apiRouter;