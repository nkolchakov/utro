// bad imports, i know, no time
//@ts-ignore
import compiledUtro from "../../artifacts/contracts/Utro.sol/Utro.json"
import { Contract, utils } from 'ethers';
import { UTRO_CONTRACT_ADDRESS } from "../../client/src/contract-address";
import { Participant } from "../models/Participant";


const processDailyCheck = async (scheduleId: number, currentQuizCache: any) => {
    const sortedParticipants =
        await Participant.find({ schedule: scheduleId })
            .sort({ participantOrder: 'asc' })

    // send for verification participant[] w/ the parameters from the signature

    // const parsedData: {

    // };

    getContract()
}

const generateAlgebra = () => {
    const a = getRandomInt(0, 25);
    const b = getRandomInt(0, 25);
    const c = a + b;
    return {
        a, b, c
    }
}

//The maximum is exclusive and the minimum is inclusive
const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const getContract = () => {
    const utroAddress = UTRO_CONTRACT_ADDRESS;
    const utroAbi = compiledUtro.abi;

    const utroInterface = new utils.Interface(utroAbi);
    //  @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner()
    const contract = new Contract(utroAddress, utroInterface, signer);

    return contract;
}


export { processDailyCheck, generateAlgebra, getRandomInt, getContract };