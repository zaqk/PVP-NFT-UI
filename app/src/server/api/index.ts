import { Router } from 'express';
import presence from '../presence'

const apiRouter = Router()

apiRouter.get('/api/state', async (req, res) => {
  console.log(`presence === ${JSON.stringify(presence)}`);

  res.send({ result: { success: true, error: false, } });
  return;
});

apiRouter.get('/api/turing-proximity', async (req, res) => {
  console.log(`presence === ${JSON.stringify(presence)}`);

  res.send({ result: { success: true, error: false, data: presence } });
  return;
});

export default apiRouter;