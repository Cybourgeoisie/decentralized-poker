import React, { useState, useEffect } from "react";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
//import { useGameContract } from "../providers/ContractProvider";
import { useAccount } from "wagmi";
import PokerTable from "../components/poker/PokerTable";
import { useXMTPConversation } from "../utils/XMTPConversation";
import { PokerSolver } from "../utils/PokerSolver";

export default function GameUX({ gameId }) {
	const { client: XmtpClient, sendDirectMessage, sendMessage } = useXMTP();

	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const { players, dealer, updatePlayer, keys } = usePoker();
	const { address } = useAccount();

	const { ackSenders, gameMessages } = useXMTPConversation({ gameId });

	const [allPlayersAcked, setAllPlayersAcked] = useState(false);

	const [dealerDeck, setDealerDeck] = useState([]);
	const [playerHand, setPlayerHand] = useState([]);
	const [playersWithDecisions, setPlayersWithDecisions] = useState([]);

	const STATES = ["waiting-ack", "game-start", "awaiting-cards", "initial-hand", "waiting-for-decision", "decision-delivered", "end-game"];
	const [lock, setLock] = useState(STATES[0]);

	// Set all players who've acked
	useEffect(() => {
		if (ackSenders && ackSenders.length > 0 && lock === "waiting-ack") {
			ackSenders.forEach((ackSender) => {
				try {
					for (const player of players) {
						if (ackSender === player.getAddress() && !player.getACK()) {
							updatePlayer({ id: player.getId(), ack: true });
						}
					}
				} catch (e) {}
			});
		}
	}, [ackSenders]);

	// Check if all players have acknowledged
	useEffect(() => {
		if (players && players.length > 0 && lock === "waiting-ack") {
			const allAcked = players.every((player) => player.getACK());
			setAllPlayersAcked(allAcked);

			if (allAcked) {
				setLock("game-start");
			}
		}
	}, [players, setLock]);

	// If all players have acked, then the dealer will start the game
	// Here, we know that all players have generated their keys
	useEffect(() => {
		if (allPlayersAcked && dealer) {
			console.log({ gameMessages });

			// Player is asked to sign the deck
			if (gameMessages.length > 0 && (lock === "game-start" || lock === "awaiting-cards")) {
				// Giving dealer back the deck
				const deckMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "deck");
				if (deckMessages.length > 0) {
					// Get the last version of the deck
					setDealerDeck(deckMessages[deckMessages.length - 1].messageJson.deck);
				}

				// Initial Hand
				const initialHandMessages = gameMessages.filter(
					(msg) => msg.messageJson && msg.messageJson.state === "initial-hand" && msg.messageJson.address === address,
				);
				if (initialHandMessages.length > 0) {
					// Set the hand
					setPlayerHand(initialHandMessages[0].messageJson.hand);

					if (STATES.indexOf(lock) < STATES.indexOf("initial-hand")) {
						setLock("initial-hand");
						return; // Don't continue to the next step, which could deal new cards instead of reviewing previous logic
					}
				}
			}

			if (dealer === address && lock === "game-start" && gameMessages.length === 0) {
				// Dealer starts the game - create the deck, pass hands to all players
				// Start the game
				const game = new PokerSolver();
				const deck = game.getDeck();

				for (const player of players) {
					const hand = game.dealHand();
					sendDirectMessage(player.getAddress(), gameId, "game", JSON.stringify({ state: "initial-hand", address: player.getAddress(), hand }));
				}

				// Save deck with self - do this after dealing hands to all players
				setDealerDeck(deck);
				sendDirectMessage(dealer, gameId, "game", JSON.stringify({ state: "deck", deck }));
				setLock("awaiting-cards");
			}

			if (gameMessages.length > 0 && lock === "initial-hand") {
				// Just keeping track of all users who made their decisions
				const decisionMadeMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "decision-made");

				// Get all addresses for players who have made decisions
				const _playersWithDecisions = decisionMadeMessages
					.map((msg) => msg.messageJson.address)
					.filter((value, index, self) => self.indexOf(value) === index);

				if (_playersWithDecisions.length > playersWithDecisions.length) {
					setPlayersWithDecisions(_playersWithDecisions);

					// For each player that made decisions, set the madeChoice flag
					for (const player of players) {
						if (_playersWithDecisions.includes(player.getAddress())) {
							player.madeChoice();
						}
					}
				}

				// If all players have made their decisions, then change the lock to "waiting-for-dealer"
				if (playersWithDecisions.length === players.length) {
					setLock("waiting-for-decision");

					// For each player that made decisions, set the madeChoice flag
					for (const player of players) {
						player.madeChoice();
					}
				}
			}

			// Get all final hands
			const finalHandMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "final-hand");

			// Get each final hand message for each player
			const eachFinalHand = finalHandMessages.map((msg) => msg.messageJson.address);
			const eachPlayer = players.map((player) => player.getAddress());
			const allPlayersHaveFinalHands = eachPlayer.every((player) => eachFinalHand.includes(player));

			if (allPlayersHaveFinalHands) {
				// Set this player's final hand
				const finalHand = finalHandMessages.find((msg) => msg.messageJson.address === address);
				if (finalHand) {
					setPlayerHand(finalHand.messageJson.hand);
				}

				// For each player's hand, set their final hand
				for (const player of players) {
					const hand = finalHandMessages.find((msg) => msg.messageJson.address === player.getAddress());
					if (hand) {
						player.setFinalHand(hand.messageJson.hand);
					}
				}

				setLock("end-game");
				return;
			}

			if (gameMessages.length > 0 && dealer === address && lock === "waiting-for-decision") {
				// Just keeping track of all users who made their decisions
				const decisionMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "decision");

				const game = new PokerSolver();
				game.setDeck(dealerDeck);

				// For each player decision, draw that many more cards
				const decisionMadeForPlayer = [];
				for (const decision of decisionMessages) {
					if (decisionMadeForPlayer.includes(decision.messageJson.address)) {
						continue;
					}

					const player = players.find((p) => p.getAddress() === decision.messageJson.address);
					const cards = decision.messageJson.cards;
					const hand = decision.messageJson.hand;

					if (player && cards && cards.length > 0) {
						const newCards = cards.map(() => game.drawCard());

						// Replace the old cards in the hand with the new cards
						for (const cardIdx of cards) {
							hand[cardIdx] = newCards.shift();
						}
					}

					// Send the new cards to the player
					sendMessage(gameId, "game", JSON.stringify({ state: "final-hand", address: player.getAddress(), hand }));

					decisionMadeForPlayer.push(player.getAddress());
				}

				// Now send the latest deck to the dealer
				sendDirectMessage(dealer, gameId, "game", JSON.stringify({ state: "deck", deck: game.getDeck() }));

				setLock("decision-delivered");
			}

			if (lock === "end-game") {
				return;
			}
		}
	}, [allPlayersAcked, dealer, gameMessages, address, keys, players, lock, setLock, setDealerDeck, setPlayerHand, sendDirectMessage]);

	const copyGameId = () => {
		navigator.clipboard.writeText(gameId);
		setCopiedToClipboard(true);
		setTimeout(() => setCopiedToClipboard(false), 2000);
	};

	const setChoices = React.useCallback(
		(cards, hand) => {
			// Send the cards to replace to the dealer
			sendDirectMessage(dealer, gameId, "game", JSON.stringify({ state: "decision", address, cards, hand }));
			console.log("Sending decision to dealer:", cards);

			// Notify all players that this player has made a decision
			for (const player of players) {
				console.log("Sending decision made message to:", player.getAddress());
				sendDirectMessage(player.getAddress(), gameId, "game", JSON.stringify({ state: "decision-made", address }));
			}
		},
		[dealer, gameId, playerHand, sendDirectMessage],
	);

	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* Poker table background */}
			{!XmtpClient || !gameId ? (
				<div className="absolute inset-0 z-0">
					<PokerTable yourHand={playerHand} />
				</div>
			) : (
				<div className="relative w-full h-full">
					<PokerTable
						players={players}
						address={address}
						playersWithDecisions={playersWithDecisions}
						yourHand={playerHand}
						dealer={dealer}
						lock={lock}
						setChoices={setChoices}
					/>
					<div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-1 rounded-md shadow-sm flex flex-row space-x-2 align-middle justify-center items-center">
						<p className="text-md font-semibold">Game ID: {gameId}</p>
						<button onClick={copyGameId} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 text-sm">
							{copiedToClipboard ? "Copied!" : "Copy ID"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
