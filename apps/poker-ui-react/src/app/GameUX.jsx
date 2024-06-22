import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
import PokerTable from "../components/poker/PokerTable";

const demoPlayers = [
	{ id: 1, name: "Player 1" },
	{ id: 2, name: "Player 2" },
	{ id: 3, name: "Player 3" },
	{ id: 4, name: "Player 4" },
	{ id: 5, name: "Player 5" },
	{ id: 6, name: "You" },
];

const communityCards = ["♠A", "♥K", "♦Q", "♣J", "♠10"];
const yourHand = ["♠A", "♠K"];

export default function GameUX() {
	const { client: XmtpClient } = useXMTP();
	const [joinGameId, setJoinGameId] = useState("");
	const [copiedToClipboard, setCopiedToClipboard] = useState(false);

	const { address, status, isConnected } = useAccount();
	const { gameId, setGameId } = usePoker();

	const startNewGame = () => {
		// Generate a new game ID (you might want to use a more robust method)
		const newGameId = Math.random().toString(36).substring(2, 15);
		setGameId(newGameId);
	};

	const copyGameId = () => {
		navigator.clipboard.writeText(gameId);
		setCopiedToClipboard(true);
		setTimeout(() => setCopiedToClipboard(false), 2000);
	};

	const joinGame = () => {
		if (joinGameId.trim()) {
			setGameId(joinGameId);
		}
	};

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

			{XmtpClient && isConnected && !gameId && (
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

			{XmtpClient && gameId && (
				<div className="relative w-full h-full">
					<PokerTable players={demoPlayers} communityCards={communityCards} yourHand={yourHand} />
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
