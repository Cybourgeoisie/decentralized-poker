/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-network-helpers");
require("@nomicfoundation/hardhat-ethers");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Default private keys - we don't want or need these in production
let sepoliaPrivateKey = "0x0000000000000000000000000000000000000000000000000000000000000001";
let basePrivateKey = "0x0000000000000000000000000000000000000000000000000000000000000001";

// If we have private keys in the environment, set them up
try {
	if (process.env.SEPOLIA_PRIVATE_KEY_FILE && fs.existsSync(path.resolve(__dirname, process.env.SEPOLIA_PRIVATE_KEY_FILE))) {
		sepoliaPrivateKey = fs.readFileSync(path.resolve(__dirname, process.env.SEPOLIA_PRIVATE_KEY_FILE), "utf-8");
		if (!sepoliaPrivateKey.startsWith("0x")) {
			sepoliaPrivateKey = "0x" + sepoliaPrivateKey;
		}
	}

	if (process.env.BASE_PRIVATE_KEY_FILE && fs.existsSync(path.resolve(__dirname, process.env.BASE_PRIVATE_KEY_FILE))) {
		basePrivateKey = fs.readFileSync(path.resolve(__dirname, process.env.BASE_PRIVATE_KEY_FILE), "utf-8");

		if (!basePrivateKey.startsWith("0x")) {
			basePrivateKey = "0x" + basePrivateKey;
		}
	}
} catch (_) {}

module.exports = {
	solidity: {
		version: "0.8.26",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			allowUnlimitedContractSize: false,
		},
		sepolia: {
			url: process.env.ETHEREUM_SEPOLIA_HTTPS_RPC,
			accounts: [sepoliaPrivateKey],
		},
		base: {
			url: process.env.BASE_HTTPS_RPC,
			accounts: [basePrivateKey],
		},
	},
	gasReporter: {
		currency: "USD",
		gasPrice: 0.007,
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		L1Etherscan: process.env.ETHERSCAN_API_KEY_ETHEREUM,
		L2: "base",
		L2Etherscan: process.env.BASESCAN_API_KEY_ETHEREUM,
		currencyDisplayPrecision: 4,
	},
	etherscan: {
		apiKey: process.env.BASESCAN_API_KEY_ETHEREUM,
	},
	sourcify: {
		enabled: true,
	},
};
