import { ethers } from 'ethers';

const IEXEC_CHAIN_ID = '134'; // 134

// Initialize an Ethers.js provider (connected to the iExec RPC)
export const provider = new ethers.JsonRpcProvider('https://bellecour.iex.ec');

export async function checkCurrentChain() {
  const network = await provider.getNetwork();

  const currentChainId = network.chainId.toString();

  if (currentChainId !== IEXEC_CHAIN_ID) {
    console.log('Please switch to iExec chain');
    throw new Error('Incorrect chain, switch to iExec sidechain');
  }
}
