import pokersolver from "pokersolver";

export class PokerSolver {
	constructor() {
		this.deck = this.createDeck();
		this.shuffleDeck();
	}

	createDeck() {
		const suits = ["d", "c", "h", "s"];
		const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
		return suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`));
	}

	setDeck(deck) {
		this.deck = deck;
	}

	getDeck() {
		return this.deck;
	}

	shuffleDeck() {
		for (let i = this.deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
	}

	drawCard() {
		if (this.deck.length === 0) {
			throw new Error("No more cards in the deck");
		}
		return this.deck.pop();
	}

	dealHand() {
		if (this.deck.length < 5) {
			throw new Error("Not enough cards in the deck to deal a hand");
		}
		return Array(5)
			.fill()
			.map(() => this.drawCard());
	}

	evaluateHand(hand) {
		// Check if input is valid
		if (!Array.isArray(hand) || hand.length !== 5) {
			return { descr: "Invalid hand" };
		}

		// Evaluate the hand using pokersolver
		const evaluatedHand = pokersolver.Hand.solve(hand);

		return evaluatedHand;
	}

	solveHands(addressToHands) {
		// Check if input is valid
		if (!Array.isArray(Object.values(addressToHands)) || Object.values(addressToHands).length === 0) {
			return [];
		}

		// Evaluate all hands using pokersolver
		const evaluatedHands = Object.values(addressToHands).map((hand) => this.evaluateHand(hand));

		const winner = pokersolver.Hand.winners(evaluatedHands);

		// Get the which of the evaluated hands is exactly the winner by the desc
		const winnerHand = evaluatedHands.find((hand) => hand.descr === winner[0].descr);

		// Find the address of the winner
		for (const [address, hand] of Object.entries(addressToHands)) {
			if (this.evaluateHand(hand).descr === winnerHand.descr) {
				return address;
			}
		}
	}
}
