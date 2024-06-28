export class MentalPoker {
	constructor() {
		this.deck = this.createDeck();
	}

	createDeck() {
		const suits = ["d", "c", "h", "s"];
		const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
		return suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`));
	}

	setDeck(deck) {
		this.deck = deck;
	}

	static async generatePlayerKey() {
		return await window.crypto.subtle.generateKey(
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"],
		);
	}

	static async saveKeysToLocalStorage(key, address, gameId) {
		const exportedKey = await window.crypto.subtle.exportKey("raw", key);
		localStorage.setItem(`player-${address}-${gameId}-Key`, btoa(String.fromCharCode.apply(null, new Uint8Array(exportedKey))));
	}

	static async loadKeysFromLocalStorage(address, gameId) {
		const storedKey = localStorage.getItem(`player-${address}-${gameId}-Key`);
		if (!storedKey) {
			return null;
		}
		const keyData = new Uint8Array(
			atob(storedKey)
				.split("")
				.map((char) => char.charCodeAt(0)),
		);
		return await window.crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
	}

	static async encryptCard(card, key) {
		const encoder = new TextEncoder();
		const cardData = encoder.encode(card);
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encryptedData = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, cardData);
		return {
			iv: Array.from(iv),
			data: Array.from(new Uint8Array(encryptedData)),
		};
	}

	static async decryptCard(encryptedCard, key) {
		const iv = new Uint8Array(encryptedCard.iv);
		const data = new Uint8Array(encryptedCard.data);
		const decryptedData = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
		const decoder = new TextDecoder();
		return decoder.decode(decryptedData);
	}

	shuffle(deck) {
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}
		return deck;
	}

	async shuffleAndEncrypt(key) {
		let encryptedDeck = this.shuffle(this.deck);
		encryptedDeck = await Promise.all(encryptedDeck.map((card) => MentalPoker.encryptCard(card, key)));
		encryptedDeck = this.shuffle(encryptedDeck);
		return encryptedDeck;
	}

	drawCard(encryptedDeck) {
		if (encryptedDeck.length === 0) {
			throw new Error("No more cards in the deck");
		}
		const index = Math.floor(Math.random() * encryptedDeck.length);
		return encryptedDeck.splice(index, 1)[0];
	}
}
