import React, { useState, useEffect } from "react";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
//import { useGameContract } from "../providers/ContractProvider";
import { useAccount } from "wagmi";
import PokerTable from "../components/poker/PokerTable";
import { useXMTPConversation } from "../utils/XMTPConversation";
import { MentalPoker } from "../classes/MentalPoker";

export default function GameUX({ gameId }) {
	const { client: XmtpClient, sendDirectMessage } = useXMTP();

	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const { communityCards, getPlayerHand, players, dealer, updatePlayer, keys } = usePoker();
	const { address } = useAccount();

	const { ackSenders, gameMessages } = useXMTPConversation({ gameId });

	const [allPlayersAcked, setAllPlayersAcked] = useState(false);
	const [lock, setLock] = useState(false);

	// Set all players who've acked
	useEffect(() => {
		if (ackSenders && ackSenders.length > 0) {
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
		if (players && players.length > 0) {
			setAllPlayersAcked(players.every((player) => player.getACK()));
		}
	}, [players]);

	// If all players have acked, then the dealer will start the game
	// Here, we know that all players have generated their keys
	useEffect(() => {
		if (allPlayersAcked && dealer) {
			// Dealer starts the game - create the deck, encrypt, pass first message
			if (dealer === address && !lock) {
				// Start the game
				(async () => {
					setLock(true);
					// If the game messages includes the encrypted deck, then we can start the game
					const signingDeckMessages = gameMessages.filter((msg) => msg.state === "signing-deck");
					if (signingDeckMessages.length > 0) {
						// Find the last signed message
						const lastSignedMessage = signingDeckMessages[signingDeckMessages.length - 1];

						// Make sure that "total signed" is equal to the number of players
					}

					// Otherwise, we need to generate the seed, shuffle the deck, and encrypt the deck, and then pass it around for signing
					const game = new MentalPoker();
					const encryptedDeck = await game.shuffleAndEncrypt(keys);
					const firstNonDealerPlayer = players.find((player) => player.getAddress() !== dealer);

					console.log("First non-dealer player:", firstNonDealerPlayer.getId(), firstNonDealerPlayer.getAddress());
					console.log("Encrypted deck:", encryptedDeck);

					sendDirectMessage(
						firstNonDealerPlayer.getAddress(),
						gameId,
						"game",
						JSON.stringify({ state: "signing-deck", nextSigner: firstNonDealerPlayer.getAddress(), deck: encryptedDeck }),
					);
				})();
			}

			// Player is asked to sign the deck
			if (gameMessages.length > 0) {
				const signedDeckMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "signed-deck");
				const signingDeckMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "signing-deck");

				// Don't move forward if everyone signed
				if (signedDeckMessages.length === 0 && signingDeckMessages.length > 0) {
					// Check if this current player signed a deck message
					const signedDeckMessage = signingDeckMessages.filter((msg) => msg.senderAddress === address);
					console.log("signedDeckMessage", signedDeckMessage, address, signingDeckMessages);

					// If not, check if we are the next signer
					if (!signedDeckMessage || signedDeckMessage.length === 0) {
						const isNextSignerMessage = signingDeckMessages.filter((msg) => msg.messageJson.nextSigner === address);
						console.log("isNextSignerMessage", isNextSignerMessage);
						if (isNextSignerMessage && isNextSignerMessage.length) {
							(async () => {
								const message = isNextSignerMessage[0];

								// Sign the deck
								try {
									const game = new MentalPoker();
									console.log("Setting deck...");
									game.setDeck(message.messageJson.deck);
									const encryptedDeck = await game.shuffleAndEncrypt(keys);
									console.log("Getting next player ...");

									// Get the next player -- if it's the dealer, then pass it back to him
									const nextPlayerIdx = players.findIndex((player) => player.getAddress() === address) + 1;
									const nextPlayer = players[nextPlayerIdx];

									// If either we do not have a next player, or if the next player is the dealer, then pass it back to the dealer
									if (!nextPlayer || nextPlayer.getAddress() === dealer) {
										console.log("Done, send back to dealer:", dealer);
										sendDirectMessage(
											dealer,
											gameId,
											"game",
											JSON.stringify({ state: "signed-deck", nextSigner: dealer, deck: encryptedDeck }),
										);
										return;
									} else {
										console.log("Pass to next signer: #", nextPlayer.getId(), nextPlayer.getAddress());
										sendDirectMessage(
											nextPlayer.getAddress(),
											gameId,
											"game",
											JSON.stringify({ state: "signing-deck", nextSigner: nextPlayer.getId(), deck: encryptedDeck }),
										);
									}
								} catch (e) {
									console.error("Failed to sign deck:", e);
								}
							})();
						}
					}
				}
			}

			// If all players have signed the deck, then the dealer will decrypt the deck and deal the hands
			if (gameMessages.length > 0) {
				const signedDeckMessages = gameMessages.filter((msg) => msg.messageJson && msg.messageJson.state === "signed-deck");
				if (signedDeckMessages.length > 0 && signedDeckMessages[0].messageJson.nextSigner === address) {
					// I am the dealer, I will deal shit
					const signedDeckMessage = signedDeckMessages[0];
					const game = new MentalPoker();
					game.setDeck(signedDeckMessage.messageJson.deck);

					// Pick 2 for every other player, give to each player
					const playerCards = [game.drawCard(), game.drawCard()];

					// Pick 5 for community cards
					const communityCards = [game.drawCard(), game.drawCard(), game.drawCard(), game.drawCard(), game.drawCard()];

					// Decrypt them locally
				}
			}
		}
	}, [allPlayersAcked, dealer, gameMessages, address, keys, players, setLock]);

	/**
	 * Stages of the game:
	 * - signing-deck
	 * - dealing-hands
	 */

	/**
	 *  The next part here is to make sure that everyone has a consistent state of the game:
	 *    - once all ACKed, then dealer will start the game
	 *    - track the game state & display the current state of the game
	 *    - iterate through player turns
	 *    - eventually add the mental poker requirements
	 */

	// If everyone has acked, and if we are the dealer, then we need to shuffle the cards, deal the hands, and deal the community cards, and communicate this to all players
	//useEffect(() => {}, [players]);

	/*
	useEffect(() => {
		if (!deck || deck.length === 0) {
			setNewDeck();
		} else if (deck && deck.length === 52 && players && players.length > 0) {
			players.forEach((player) => dealHand(deck, player.id));
			dealCommunityCards(deck);
		}
	}, [dealHand, dealCommunityCards, deck, players, setNewDeck]);
	*/

	/*
	useEffect(() => {
		if (communityCards && communityCards.length === 5) {
			sendMessage(gameId, "game", JSON.stringify({ communityCards }));
		}
	}, [communityCards, gameId, sendMessage]);
	*/

	/*
	useEffect(() => {
		if (formattedMessages && formattedMessages.length > 0) {
			// Find any game type messages
			const gameMessages = formattedMessages.filter((msg) => msg.type === "game" && msg.gameId === gameId);

			// Go through all game messages, if we see "communityCards" then update the community cards
			gameMessages.forEach((msg) => {
				try {
					const message = JSON.parse(msg.message);
					if (message.communityCards) {
						setCommunityCards(message.communityCards);
					}
				} catch (e) {}
			});
		}
	}, [formattedMessages, setCommunityCards, gameId]);
	*/

	const copyGameId = () => {
		navigator.clipboard.writeText(gameId);
		setCopiedToClipboard(true);
		setTimeout(() => setCopiedToClipboard(false), 2000);
	};

	const yourHand = getPlayerHand(6);

	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* Poker table background */}
			{!XmtpClient || !gameId ? (
				<div className="absolute inset-0 z-0">
					<PokerTable communityCards={communityCards} yourHand={yourHand} />
				</div>
			) : (
				<div className="relative w-full h-full">
					<PokerTable players={players} communityCards={communityCards} yourHand={yourHand} dealer={dealer} />
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
