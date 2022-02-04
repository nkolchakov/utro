import { UTRO_CONTRACT_ADDRESS } from "./constants";
import compiledUtro from './artifacts/Utro.json'
import { Contract, ethers, utils } from "ethers";
import { useContractFunction } from "@usedapp/core";

export function useUtro() {
    const utroAddress = UTRO_CONTRACT_ADDRESS;
    const utroAbi = compiledUtro.abi;

    const utroInterface = new utils.Interface(utroAbi);
    const contract = new Contract(utroAddress, utroInterface);
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    const { state: stateCreate, send: sendCreate } = useContractFunction(
        contract, 'createSchedule', { signer: signer });


    return {
        useCreateSchedule: {
            stateCreate, sendCreate
        }
    }

}