import React, { useState, useEffect } from "react";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
//import { useGameContract } from "../providers/ContractProvider";
import PokerTable from "../components/poker/PokerTable";

// test: KDVDzBJqIX

export default function GameUX({ gameId }) {
	const { client: XmtpClient } = useXMTP();

	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const { communityCards, getPlayerHand, players, dealHand, dealCommunityCards, deck, setNewDeck, dealer } = usePoker();

	/**
	 *  The next part here is to make sure that everyone has a consistent state of the game:
	 *    - make sure that all players ACK the game
	 *    - show icons for players that have ACKed the game
	 *    - once all ACKed, then dealer will start the game
	 *    - track the game state & display the current state of the game
	 *    - iterate through player turns
	 *    - eventually add the mental poker requirements
	 */

	useEffect(() => {
		if (!deck || deck.length === 0) {
			setNewDeck();
		} else if (deck && deck.length === 52 && players && players.length > 0) {
			players.forEach((player) => dealHand(deck, player.id));
			dealCommunityCards(deck);
		}
	}, [dealHand, dealCommunityCards, deck, players, setNewDeck]);

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
