import { log } from 'console';
import { parseEther } from 'ethers/lib/utils';
import { ethers, getUnnamedAccounts } from 'hardhat';
import moment from 'moment';
import { Utro__factory } from '../typechain';

async function main() {
    const [acc1, acc2] = await getUnnamedAccounts()

    const Utro = await ethers.getContractFactory<Utro__factory>("Utro");
    const utro = await Utro.deploy();

    await utro.deployed();

    const signer2 = await ethers.getSigner(acc2);

    const stakeRequired = parseEther('0.5')
    const daysNumber = 32;
    await utro.createSchedule("test", stakeRequired, daysNumber, moment().valueOf(), { value: stakeRequired });
    console.log(await utro.getParticipants(0))

    await utro.connect(signer2).joinSchedule(0, { value: stakeRequired });
    console.log(await utro.getParticipants(0))
    console.log(await (await utro.scheduleIdToSchedule(0)).totalStakedEth.toString())
    console.log(await utro.getSchedules())

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
