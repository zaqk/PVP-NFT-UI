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
    let isInProximity = false;
    const { params } = req.body;

    console.log(`req.body === ${JSON.stringify(req.body)}`);
    console.log(`params === ${JSON.stringify(params)}`);

    const input = params[0];
    console.log(`length === ${ethers.utils.hexDataSlice(input, 0, 32)}`)
    console.log(`a === ${ethers.utils.hexDataSlice(input, 32, 64)}`)
    console.log(`b === ${ethers.utils.hexDataSlice(input, 64, input.length)}`)

    const attackerTokenId = ethers.BigNumber.from(
      ethers.utils.hexDataSlice(input, 32, 64)
    ).toNumber();
    const victimTokenId = ethers.BigNumber.from(
      ethers.utils.hexDataSlice(input, 64, input.length)
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
      isInProximity = Entity.distance(attacker, victim) < DEFAULT_PLAYER_RADIUS * 4;
    }

    const result = formatResponse(isInProximity);
    console.log(`result === ${JSON.stringify(result)}`)
    res.send({ result });

    return;
  } catch(err) {
    console.error(err);
    const result = formatResponse(false);
    console.log(`result === ${JSON.stringify(result)}`);
    console.error('sending result === false to ensure contracts txs dont fail for testing purposes')
    res.send({ result });
    return;
  }
});

const formatResponse = (isInProximity: Boolean) => {
  const prefix = '0x';
  const length = '0000000000000000000000000000000000000000000000000000000000000020'; // 1 param, 32 bytes long
  const param = `000000000000000000000000000000000000000000000000000000000000000${Number(isInProximity)}`; // encoded boolean
  return `${prefix}${length}${param}`;
}

export default apiRouter;