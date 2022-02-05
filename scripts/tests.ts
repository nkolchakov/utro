import { UTRO_CONTRACT_ADDRESS } from './../client/src/contract-address';

//@ts-ignore
import compiledUtro from '../artifacts/contracts/Utro.sol/Utro.json'

import { Contract } from 'ethers';
import { ethers, getUnnamedAccounts } from 'hardhat';


async function main() {
    const [acc1, acc2] = await getUnnamedAccounts()
    const address = UTRO_CONTRACT_ADDRESS;
    const abi = compiledUtro.abi;

    const contract = new Contract(address, abi);



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
