class CardCrypto {
	constructor(numPlayers) {
		this.numPlayers = numPlayers;
		this.playerKeys = [];
		this.playerIVs = {};
	}

	async generatePlayerKeys() {
		console.log("Generating player keys...");
		for (let i = 0; i < this.numPlayers; i++) {
			const keyPair = await window.crypto.subtle.generateKey(
				{
					name: "ECDH",
					namedCurve: "P-256",
				},
				true,
				["deriveKey", "deriveBits"],
			);
			this.playerKeys.push(keyPair);
			console.log(`Generated key pair for player ${i + 1}`);
		}
		console.log("All player keys generated");
	}

	async encryptCard(card) {
		console.log(`Original card: ${card}`);
		let encryptedCard = new TextEncoder().encode(card);
		this.playerIVs = {}; // Reset IVs for new encryption

		for (let i = 0; i < this.numPlayers; i++) {
			const publicKey = this.playerKeys[i].publicKey;
			const sharedSecret = await window.crypto.subtle.digest("SHA-256", await window.crypto.subtle.exportKey("raw", publicKey));

			const key = await window.crypto.subtle.importKey("raw", sharedSecret, { name: "AES-CBC" }, false, ["encrypt"]);

			const iv = window.crypto.getRandomValues(new Uint8Array(16));
			this.playerIVs[i] = this.buf2hex(iv);

			const encrypted = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, key, encryptedCard);

			encryptedCard = new Uint8Array(encrypted);
			console.log(`After encryption by Player ${i + 1}: ${this.buf2hex(encryptedCard)}`);
		}

		return {
			encryptedData: this.buf2hex(encryptedCard),
			ivs: this.playerIVs,
		};
	}

	async decryptCard(encryptedData, ivs) {
		let decryptedCard = new Uint8Array(this.hex2buf(encryptedData));

		//for (let i = this.numPlayers - 1; i >= 0; i--) {
		for (let i = 0; i < this.numPlayers; i++) {
			const publicKey = this.playerKeys[i].publicKey;
			const sharedSecret = await window.crypto.subtle.digest("SHA-256", await window.crypto.subtle.exportKey("raw", publicKey));

			const key = await window.crypto.subtle.importKey("raw", sharedSecret, { name: "AES-CBC" }, false, ["decrypt"]);

			const iv = this.hex2buf(ivs[i]);

			console.log("gonna decrypt with key", key, "iv", iv, "data", decryptedCard);

			decryptedCard = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, key, decryptedCard);

			decryptedCard = new Uint8Array(decryptedCard);
			console.log(`After decryption by Player ${i + 1}: ${this.buf2hex(decryptedCard)}`);
		}

		return new TextDecoder().decode(decryptedCard);
	}

	getRandomCard() {
		const array = new Uint8Array(32);
		return this.buf2hex(window.crypto.getRandomValues(array));
	}

	buf2hex(buffer) {
		return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
	}

	hex2buf(hex) {
		return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
	}

	async demonstrateUsage() {
		await this.generatePlayerKeys();

		console.log("\nSimulating card encryption:");
		const originalCard = this.getRandomCard();
		const { encryptedData, ivs } = await this.encryptCard(originalCard);

		console.log("\nEncrypted Data:", encryptedData);
		console.log("IVs:", ivs);

		console.log("\nSimulating card decryption:");
		const decryptedCard = await this.decryptCard(encryptedData, ivs);

		console.log(`\nOriginal card: ${originalCard}`);
		console.log(`Final decrypted card: ${decryptedCard}`);
		console.log(`Decryption successful: ${decryptedCard === originalCard}`);
	}
}

// Run the demonstration when the script loads
const numPlayers = 3;
const cardCrypto = new CardCrypto(numPlayers);
cardCrypto.demonstrateUsage().catch(console.error);
