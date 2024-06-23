import React, { useState } from "react";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { useGameContract } from "../providers/ContractProvider";

export default function GameSetupUX({ gameId, setGameId, registerNewGame, joinGame, invalidGameId, setInvalidGameId }) {
	const { client: XmtpClient } = useXMTP();

	const [showRegisterGameForm, setShowRegisterGameForm] = useState(false);
	const [joinGameId, setJoinGameId] = useState("");
	const { isConnected, hash, error, isConfirming, isLoadingGameData } = useGameContract();

	if (isLoadingGameData) {
		return <div>Loading game data...</div>;
	}
	return (
		<>
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
								onClick={setShowRegisterGameForm.bind(null, true)}
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
								<button
									onClick={() => {
										joinGame(joinGameId);
									}}
									className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
								>
									Join Game
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{XmtpClient && isConnected && showRegisterGameForm && !gameId && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
						<h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Game</h2>
						<div className="space-y-4">
							{/* Five text fields to set addresses for players */}
							<div className="space-y-2">
								<input
									type="text"
									id="player1"
									placeholder="Player 1 (0x...)"
									className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<input
									type="text"
									id="player2"
									placeholder="(Optional) Player 2 (0x...)"
									className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<input
									type="text"
									id="player3"
									placeholder="(Optional) Player 3 (0x...)"
									className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<input
									type="text"
									id="player4"
									placeholder="(Optional) Player 4 (0x...)"
									className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<input
									type="text"
									id="player5"
									placeholder="(Optional) Player 5 (0x...)"
									className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<button
								onClick={() => {
									// Pull the addresses from the input fields
									const player1 = document.getElementById("player1").value;
									const player2 = document.getElementById("player2").value;
									const player3 = document.getElementById("player3").value;
									const player4 = document.getElementById("player4").value;
									const player5 = document.getElementById("player5").value;

									// Required to have at least one player
									if (!player1) {
										alert("Please enter at least one player address.");
										return;
									}

									registerNewGame([player1, player2, player3, player4, player5]);
								}}
								className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
							>
								Register New Game
							</button>
							<button
								onClick={setShowRegisterGameForm.bind(null, false)}
								className="w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{XmtpClient && isConfirming && !gameId && (
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

			{XmtpClient && invalidGameId && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">Invalid Game ID</h1>
						<p className="text-md text-gray-600">Please enter a valid game ID to join, or create a game to play.</p>
						<button
							onClick={() => {
								setShowRegisterGameForm(false);
								setGameId("");
								setJoinGameId("");
								setInvalidGameId(false);
							}}
							className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 mt-4"
						>
							OK
						</button>
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
		</>
	);
}
