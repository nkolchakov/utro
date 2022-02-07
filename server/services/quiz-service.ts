import { TransactionRequest } from '@ethersproject/providers';
// bad imports, i know, no time
//@ts-ignore
import compiledUtro from "../../artifacts/contracts/Utro.sol/Utro.json"
import { Contract, ContractReceipt, ethers, utils } from 'ethers';
import { UTRO_CONTRACT_ADDRESS } from "../../client/src/contract-address";
import { Participant } from "../models/Participant";
// import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";

const processDailyCheck = async (scheduleId: number, currentQuizCache: any) => {
    const sortedParticipants =
        await Participant.find({ schedule: scheduleId })
            .sort({ participantOrder: 'asc' })

    const answerData = parseRaw(
        scheduleId,
        sortedParticipants,
        currentQuizCache);

    console.log('answer data ', answerData);

    const tx: any = await getContractBackendLocal().dailyCheck(scheduleId, answerData);
    const confirmed: any = await tx.wait(1);
    console.log('confirmed ', confirmed);
    console.log('events ', confirmed.events);
    console.log('events 0, args', confirmed.events[0].args);
    return true;
}

function parseRaw(
    scheduleId: number,
    sortedParticipants: string[],
    currentQuizCache: any) {
    const scheduleData = currentQuizCache[scheduleId];


    const answers1: string[] = [];
    const answers2: string[] = [];
    const gameKeys: string[] = [];
    const participants: string[] = [];
    const signatures: string[] = [];

    if (!scheduleData) {
        console.log('quizCache is null');
        return {
            answers1,
            answers2,
            gameKeys,
            participants,
            signatures
        };
    }

    sortedParticipants.forEach((sortedP: any) => {
        const address = sortedP._id.toLowerCase();
        console.log('------key ', address)
        console.log('curr quiz ', currentQuizCache);

        const quizInfo = currentQuizCache[scheduleId.toString()][address];

        if (!quizInfo) {
            return;
        }

        console.log('quiz info ', quizInfo)
        answers1.push(quizInfo.firstAnswer.toString());
        answers2.push(quizInfo.secondAnswer.toString());
        gameKeys.push(quizInfo.gameKey.toString());
        participants.push(address);
        signatures.push(quizInfo.signature);
    })

    const answerData = {
        answers1,
        answers2,
        gameKeys,
        participants,
        signatures
    };

    return answerData;
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

const getContractBackendLocal = () => {
    const utroAddress = UTRO_CONTRACT_ADDRESS;
    const utroAbi = compiledUtro.abi;

    const utroInterface = new utils.Interface(utroAbi);
    //  @ts-ignore
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');

    console.log(`pk ${process.env.SERVER_PRIVATE_KEY}`);
    const signer = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY!, provider);

    const contract = new Contract(utroAddress, utroInterface, signer);

    return contract;
}


export { processDailyCheck, generateAlgebra, getRandomInt, getContract };


