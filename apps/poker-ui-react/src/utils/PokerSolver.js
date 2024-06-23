import pokersolver from "pokersolver";

function evaluateHand(playerHand, communityCards) {
	// Check if inputs are valid
	if (!Array.isArray(playerHand) || !Array.isArray(communityCards)) {
		return { descr: "No hand" };
	}

	// If both arrays are empty, return "No hand"
	if (playerHand.length === 0 && communityCards.length === 0) {
		return { descr: "No hand" };
	}

	// Combine player's hand and community cards
	const allCards = [...playerHand, ...communityCards];

	// Evaluate the hand using pokersolver
	const hand = pokersolver.Hand.solve(allCards);

	return hand;
}

export default evaluateHand;
