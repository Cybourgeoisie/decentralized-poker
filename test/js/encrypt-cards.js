const EC = require("elliptic").ec;
const crypto = require("crypto");

class CardCrypto {
	constructor(numPlayers) {
		this.ec = new EC("secp256k1");
		this.numPlayers = numPlayers;
		this.playerKeys = [];
	}

	generatePlayerKeys() {
		console.log("Generating player keys...");
		for (let i = 0; i < this.numPlayers; i++) {
			const keyPair = this.ec.genKeyPair();
			this.playerKeys.push(keyPair);
			console.log(`Generated key pair for player ${i + 1}`);
		}
		console.log("All player keys generated");
	}

	encryptCard(card) {
		console.log(`Original card: ${card}`);
		let encryptedCard = Buffer.from(card, "hex");

		for (let i = 0; i < this.numPlayers; i++) {
			const publicKey = this.playerKeys[i].getPublic();
			const sharedSecret = crypto.createHash("sha256").update(publicKey.encode("hex")).digest();

			const cipher = crypto.createCipheriv("aes-256-ecb", sharedSecret, null);
			let encrypted = cipher.update(encryptedCard);
			encrypted = Buffer.concat([encrypted, cipher.final()]);

			console.log(encrypted.toString("hex"));

			encryptedCard = encrypted;
			console.log(`After encryption by Player ${i + 1}: ${encryptedCard.toString("hex")}`);
		}

		return encryptedCard.toString("hex");
	}

	decryptCard(encryptedCard) {
		let decryptedCard = Buffer.from(encryptedCard, "hex");

		for (let i = this.numPlayers - 1; i >= 0; i--) {
			const publicKey = this.playerKeys[i].getPublic();
			const sharedSecret = crypto.createHash("sha256").update(publicKey.encode("hex")).digest();

			const decipher = crypto.createDecipheriv("aes-256-ecb", sharedSecret, null);
			let decrypted = decipher.update(decryptedCard);
			decrypted = Buffer.concat([decrypted, decipher.final()]);

			decryptedCard = decrypted;
			console.log(`After decryption by Player ${i + 1}: ${decryptedCard.toString("hex")}`);
		}

		return decryptedCard.toString("hex");
	}

	getRandomCard() {
		return crypto.randomBytes(32).toString("hex");
	}

	demonstrateUsage() {
		this.generatePlayerKeys();

		console.log("\nSimulating card encryption:");
		const originalCard = this.getRandomCard();
		const encryptedCard = this.encryptCard(originalCard);

		console.log("\nSimulating card decryption:");
		const decryptedCard = this.decryptCard(encryptedCard);

		console.log(`\nOriginal card: ${originalCard}`);
		console.log(`Final decrypted card: ${decryptedCard}`);
		console.log(`Decryption successful: ${decryptedCard === originalCard}`);
	}
}

// Usage
const numPlayers = 3;
const cardCrypto = new CardCrypto(numPlayers);
cardCrypto.demonstrateUsage();
