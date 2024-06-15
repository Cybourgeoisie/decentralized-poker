require("dotenv").config();
const fs = require("fs");
const path = require("path");

function loadKey(network, keyFile) {
	const relativePath = path.resolve(__dirname, "../../");

	try {
		if (keyFile && fs.existsSync(path.resolve(relativePath, keyFile))) {
			keys[network] = fs.readFileSync(path.resolve(relativePath, keyFile), "utf-8");
			if (!keys[network].startsWith("0x")) {
				keys[network] = "0x" + keys[network];
			}
		}
	} catch (_) {}
}

// Default private keys - we don't want or need these in production
module.exports = function loadPrivateKeys(keys = {}) {
	const defaultKey = "0x0000000000000000000000000000000000000000000000000000000000000001";

	for (const network in keys) {
		const keyFile = keys[network];
		keys[network] = loadKey(network, keyFile) || defaultKey;
	}

	return keys;
};
