import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  const chainId = await hre.getChainId();

  let api = chainId === '31337' ? 'http://localhost:8080' : 'tbd';

  const turingHelperInfo = await deploy('TuringHelper', {
    from: deployer,
    log: true,
  })

  await deploy('Entity', {
    from: deployer,
    log: true,
    args: [turingHelperInfo.address, api],
  })

};
func.tags = ['main', 'local', 'seed'];
export default func;