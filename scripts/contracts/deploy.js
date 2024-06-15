// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
require("hardhat");
const { ethers } = require("hardhat");

async function main() {
	// Check the address of the sender
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);
	console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

	// Get the contract to deploy
	const Contract = await ethers.getContractFactory("MultiplayerCardGameVerifer");

	// Deploy contract
	const _contract = await Contract.deploy();
	await _contract.waitForDeployment();
	const address = await _contract.getAddress();
	console.log("MultiplayerCardGameVerifer deployed to:", address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
