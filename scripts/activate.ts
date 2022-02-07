import { BigNumber } from 'ethers';
import { UTRO_CONTRACT_ADDRESS } from '../client/src/contract-address';

//@ts-ignore
import compiledUtro from '../artifacts/contracts/Utro.sol/Utro.json'

import { Contract } from 'ethers';
import { ethers, getUnnamedAccounts } from 'hardhat';
import { arrayify, parseEther, solidityKeccak256 } from 'ethers/lib/utils';
import moment from 'moment';


async function main() {
    const [acc1, acc2, acc3, acc4] = await getUnnamedAccounts()
    const address = UTRO_CONTRACT_ADDRESS;
    const abi = compiledUtro.abi;

    // const contract = new Contract(address, abi);

    const Utro = await ethers.getContractFactory("Utro");
    const contract = await Utro.deploy();

    await contract.deployed();

    const name = 'schedule 1';
    const stakeRequired = parseEther('1000');
    const daysNumber = 30;
    const hour = moment().valueOf();

    const ownerSigner = await ethers.getSigner(acc2);

    const tx = await contract
        .connect(ownerSigner)
        .createSchedule(name, stakeRequired, daysNumber, hour,
            { value: stakeRequired });

    const confirmed = await tx.wait(1);
    const scheduleId = confirmed.events[0].args.scheduleId.toNumber();

    console.log(scheduleId);

    await joinSchedule(acc3, stakeRequired, contract, scheduleId);
    await joinSchedule(acc4, stakeRequired, contract, scheduleId);

    await contract
        .connect(ownerSigner)
        .activateSchedule(scheduleId);

    console.log('participants ', await contract.getParticipants(scheduleId));

    const a1 = '4';
    const a2 = '10';
    const gk = '12345';

    const signatures: any = [
        // await getSignature(acc2, a1, a2, gk),
        await getSignature(acc3, a1, a2, gk),
        // await getSignature(acc4, a1, a2, gk),
    ];

    const answerData = {
        participants: [acc3],
        signatures: signatures, // [s1, s2, s3]
        answers1: [a1],
        answers2: [a2],
        gameKeys: [gk]
    };
    console.log('answerData \n', answerData)
    // test signature logic
    // const isValid = await contract.verifySignature(msg, acc2, signatures[0]);
    // console.log(isValid)

    await contract.dailyCheck(scheduleId, answerData);

    console.log(await getBalance(acc2))
    console.log(await getBalance(acc3))
    console.log(await getBalance(acc4))
}

const verifySignature = async (ad: any, i: number, contract: any) => {
    const calldata = [
        ad.answers1[i].toString(),
        ad.answers2[i].toString(),
        ad.gameKeys[i].toString(),
        ad.participants[i],
        ad.signatures[i]
    ];
    console.log(calldata)

    const tx = await contract.verifySignature(...calldata);
    console.log(tx);
}

const joinSchedule = async (account: string, stake: BigNumber, contract: any, scheduleId = 0) => {
    return contract
        .connect(await ethers.getSigner(account))
        .joinSchedule(scheduleId, { value: stake });
}

const getBalance = async (acc: string) => {
    return ethers.utils.formatEther(await
        (await ethers.getSigner(acc)).getBalance());
}

const getSignature = async (
    account: string,
    a1: string,
    a2: string,
    gameKey: string) => {
    const signer = await ethers.getSigner(account);

    const hashedMsg = solidityKeccak256(
        ['string', 'string', 'string'],
        [a1, a2, gameKey])

    const signature = await signer.signMessage(arrayify(hashedMsg));
    return signature;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
