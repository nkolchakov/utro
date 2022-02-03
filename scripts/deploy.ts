import { arrayify, keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { ethers, getUnnamedAccounts } from 'hardhat';

async function main() {
  const [acc1, acc2] = await getUnnamedAccounts()

  const Utro = await ethers.getContractFactory("Utro");
  const utro = await Utro.deploy();

  await utro.deployed();

  const signer1 = await ethers.getSigner(acc1);

  const answer = "europe";
  const secret = "gg#2"
  const message = answer + secret;
  keccak256

  console.log("Utro deployed to:", utro.address);

  // check signing + verification
  const hashedMsg = solidityKeccak256(['string'], [message])
  const signature = await signer1.signMessage(arrayify(hashedMsg));

  console.log(await utro.verify(answer, secret, acc1, signature))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
