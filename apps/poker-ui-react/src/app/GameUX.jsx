import React, { useState, useEffect } from "react";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
import { useGameContract } from "../providers/ContractProvider";
import PokerTable from "../components/poker/PokerTable";

// test: KDVDzBJqIX

const demoPlayers = [
	{ id: 1, name: "Player 1" },
	{ id: 2, name: "Player 2" },
	{ id: 3, name: "Player 3" },
	{ id: 4, name: "Player 4" },
	{ id: 5, name: "Player 5" },
	{ id: 6, name: "You" },
];

export default function GameUX() {
	const { client: XmtpClient, startNewConversation, sendMessage } = useXMTP();
	const [joinGameId, setJoinGameId] = useState("");
	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const { communityCards, setCommunityCards, addPlayer, getPlayerHand, players, setNewDeck, dealHand, dealCommunityCards, deck, setGameId, gameId } =
		usePoker();
	const {
		address,
		isConnected,
		hash,
		error,
		isConfirming,
		currentGameId,
		setCurrentGameId,
		gameData,
		isLoadingGameData,
		registerGame,
		bytes16ToString,
		generateRandomString,
	} = useGameContract();

	useEffect(() => {
		if (deck && deck.length === 52) {
			players.forEach((player) => dealHand(deck, player.id));
			dealCommunityCards(deck);
		}
	}, [dealHand, dealCommunityCards, deck, players]);

	useEffect(() => {
		if (communityCards && communityCards.length === 5) {
			sendMessage(gameId, "game", JSON.stringify({ communityCards }));
		}
	}, [communityCards, gameId, sendMessage]);

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

	useEffect(() => {
		if (gameData && gameData.length > 0 && (!deck || deck.length === 0)) {
			const [gameInfo, gamePlayers] = gameData;

			if (gameInfo && gameInfo.result) {
				const [gameId] = gameInfo.result;
				if (gameId.length > 0 && gameId !== "0x00000000000000000000000000000000") {
					const stringGameId = bytes16ToString(gameId);
					setGameId(stringGameId);
					setCurrentGameId(stringGameId);
					startNewConversation(stringGameId, "0x937C0d4a6294cdfa575de17382c7076b579DC176");

					if (gamePlayers && gamePlayers.result) {
						gamePlayers.result.forEach((player, index) => {
							if (player.toLowerCase() !== address.toLowerCase()) {
								addPlayer({ id: index + 1, name: String(player).substring(0, 10), address: String(player) });
								startNewConversation(stringGameId, player);
							}
						});
					}

					addPlayer({ id: 6, name: "You" });
					setNewDeck();
				}
			}
		}
	}, [gameData, deck, bytes16ToString, setCurrentGameId, startNewConversation, addPlayer, setNewDeck, address, setGameId]);

	const startNewGame = async () => {
		const newGameId = await generateRandomString();
		setCurrentGameId(newGameId);
		addPlayer({ id: 6, name: "You" });
		setNewDeck();
		registerGame(newGameId, 2, ["0xC27A7a787b3A115435DF8Fa154Ff0DfA0C63E276"]);
	};

	const joinGame = async () => {
		if (joinGameId.trim()) {
			setCurrentGameId(joinGameId);
		}
	};

	const copyGameId = () => {
		navigator.clipboard.writeText(currentGameId);
		setCopiedToClipboard(true);
		setTimeout(() => setCopiedToClipboard(false), 2000);
	};

	const yourHand = getPlayerHand(6);

	if (isLoadingGameData) {
		return <div>Loading game data...</div>;
	}
	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* Poker table background */}
			<div className="absolute inset-0 z-0">
				<PokerTable players={demoPlayers} communityCards={communityCards} yourHand={yourHand} />
			</div>

			{(!XmtpClient || !isConnected) && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Poker Table</h1>
						<p className="text-xl text-gray-600">Please connect your wallet and log into XMTP to join the game.</p>
					</div>
				</div>
			)}

			{XmtpClient && isConnected && !currentGameId && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
						<h2 className="text-2xl font-bold text-gray-800 mb-6">Choose an Option</h2>
						<div className="space-y-4">
							<button
								onClick={startNewGame}
								className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
							>
								Start New Game
							</button>
							<div className="flex items-center space-x-2">
								<input
									type="text"
									value={joinGameId}
									onChange={(e) => setJoinGameId(e.target.value)}
									placeholder="Enter Game ID"
									className="flex-grow py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<button onClick={joinGame} className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300">
									Join Game
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{XmtpClient && isConfirming && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">Waiting for Transaction Confirmation...</h1>
						<p className="text-md text-gray-600">
							Hash:{" "}
							<a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer">
								{hash}
							</a>
						</p>
					</div>
				</div>
			)}

			{XmtpClient && error && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl max-w-96">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">Error</h1>
						<p className="text-md text-gray-600">{error.message}</p>
					</div>
				</div>
			)}

			{XmtpClient && currentGameId && (
				<div className="relative w-full h-full">
					<PokerTable players={players} communityCards={communityCards} yourHand={yourHand} />
					<div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-1 rounded-md shadow-sm flex flex-row space-x-2 align-middle justify-center items-center">
						<p className="text-md font-semibold">Game ID: {currentGameId}</p>
						<button onClick={copyGameId} className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 text-sm">
							{copiedToClipboard ? "Copied!" : "Copy ID"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
