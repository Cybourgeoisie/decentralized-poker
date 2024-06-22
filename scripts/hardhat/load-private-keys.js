require("dotenv").config();
const fs = require("fs");
const path = require("path");

function loadKey(network, keyFile) {
	const relativePath = path.resolve(__dirname, "../../");

	try {
		const filepath = path.resolve(relativePath, keyFile);
		if (keyFile && fs.existsSync(filepath)) {
			let key = fs.readFileSync(filepath, "utf-8");
			if (!key.startsWith("0x")) {
				key = "0x" + key;
			}
			return key;
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
