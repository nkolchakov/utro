import { Contract, ethers, utils } from "ethers";
import { UTRO_CONTRACT_ADDRESS } from './contract-address';
import compiledUtro from './artifacts/Utro.json'


export const getContract = () => {
    const utroAddress = UTRO_CONTRACT_ADDRESS;
    const utroAbi = compiledUtro.abi;

    const utroInterface = new utils.Interface(utroAbi);
    //  @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner()
    const contract = new Contract(utroAddress, utroInterface, signer);

    return contract;
}

export const compareAddresses = (a1: string, a2: string) => {
    if (!a1 || !a2) { return false; }
    return a1.toLowerCase() === a2.toLowerCase();
}