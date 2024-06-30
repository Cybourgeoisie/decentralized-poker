import React, { useState, useCallback } from "react";
import PokerCard from "./PokerCard";
import { PokerSolver } from "../../utils/PokerSolver";
import { Player } from "../../classes/Player";
import { CheckCircle, XCircle, Crown } from "lucide-react";

export default function PokerTable({ players, address, yourHand, dealer, lock, setChoices = () => {}, onReturnToMenu = () => {} }) {
	const [selectedCards, setSelectedCards] = useState([]);

	if (!players) {
		players = [
			new Player({ id: 1, name: "Demo Player 2", ack: true }),
			new Player({ id: 2, name: "Demo Player 3", ack: true }),
			new Player({ id: 3, name: "Demo Player 4", ack: true }),
			new Player({ id: 5, name: "You", ack: true }),
		];
	}

	const numPlayers = Math.max(2, Math.min(4, players.length));

	const game = new PokerSolver();
	const hand = game.evaluateHand(yourHand);
	const handDescription = hand ? hand.descr : "No hand";

	const allPlayersAcked = players.every((player) => player.ack);

	const handleCardClick = useCallback(
		(index) => {
			if (lock === "initial-hand" && !players[players.length - 1].hasMadeChoices()) {
				setSelectedCards((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : prev.length < 3 ? [...prev, index] : prev));
			}
		},
		[lock, players],
	);

	const handleReplaceClick = useCallback(() => {
		setChoices(selectedCards, yourHand);
	}, [selectedCards, setChoices, yourHand]);

	const currentPlayer = players.find((player) => player.getAddress() === address);
	const isCurrentPlayerDone = currentPlayer && currentPlayer.hasMadeChoices();

	// If we're in the end game, compare all hands using PokerSolver
	let winner = "";
	if (lock === "end-game") {
		const addressToHands = {};

		players.forEach((player) => {
			addressToHands[player.getAddress()] = player.showFinalHand();
		});

		winner = game.solveHands(addressToHands);
	}

	if (numPlayers < 2) {
		return <div className="text-white">Waiting for players...</div>;
	}

	return (
		<div className="relative w-full h-screen bg-green-800 p-4">
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-700 rounded-full border-4 border-yellow-600">
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2"></div>
			</div>

			{players.slice(0, numPlayers - 1).map((player, index) => {
				const angle = ((index + 1) / numPlayers) * Math.PI * 2 + Math.PI / 2;
				const top = 50 + 35 * Math.sin(angle);
				const left = 50 + 35 * Math.cos(angle);
				const isWinner = player.getAddress() === winner;
				return (
					<div key={player.id} className="absolute text-center" style={{ top: `calc(${top}%`, left: `${left}%`, transform: "translate(-50%, -50%)" }}>
						<div className="flex flex-row space-x-1 p-2">
							<div className="bg-gray-800 text-white p-2 rounded flex items-center">
								<div>{player.name}</div>
								{isWinner && <Crown className="ml-2 text-yellow-400" size={16} />}
								<div className={`w-3 h-3 rounded-full ml-2 ${player.ack ? "bg-green-500" : "bg-red-500"}`}></div>
								{(lock === "initial-hand" || lock === "waiting-for-dealer") &&
									(player.hasMadeChoices() ? (
										<CheckCircle className="ml-2 text-green-500" size={16} />
									) : (
										<XCircle className="ml-2 text-red-500" size={16} />
									))}
							</div>
							{player.address === dealer && dealer && (
								<div className="bg-gray-800 text-white p-2 rounded">
									<div>Dealer</div>
								</div>
							)}
						</div>
						<div className="flex justify-center space-x-1">
							{lock === "end-game" ? (
								<>
									{player.showFinalHand().map((card, cardIndex) => (
										<PokerCard className="w-10 h-14 text-md" key={cardIndex} value={card} />
									))}
									<div className="bg-gray-800 text-white p-2 rounded ml-2 h-10 self-center">
										{game.evaluateHand(player.showFinalHand()).descr}
									</div>
								</>
							) : (
								<>
									<PokerCard />
									<PokerCard />
									<PokerCard />
									<PokerCard />
									<PokerCard />
								</>
							)}
						</div>
					</div>
				);
			})}

			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
				<div className="flex items-end space-x-2 mb-2">
					<div className="flex space-x-2">
						{yourHand &&
							yourHand.map((card, index) => (
								<div
									key={index}
									onClick={() => handleCardClick(index)}
									className={`cursor-pointer transition-all duration-200 ${
										lock !== "end-game" && selectedCards.includes(index) ? "transform -translate-y-4" : ""
									}`}
								>
									<PokerCard className="w-16 h-24 text-2xl" value={card} />
								</div>
							))}
					</div>
					{lock === "initial-hand" && (
						<button
							onClick={handleReplaceClick}
							className={`ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-12 ${
								isCurrentPlayerDone ? "opacity-50 cursor-not-allowed" : ""
							}`}
							disabled={isCurrentPlayerDone}
						>
							{selectedCards.length > 0 ? "Replace" : "Keep All"}
						</button>
					)}
				</div>
				<div className="flex flex-row space-x-1">
					<div className="bg-gray-800 text-white p-2 rounded flex items-center">
						<div>{handDescription}</div>
						{currentPlayer && currentPlayer.getAddress() === winner && <Crown className="ml-2 text-yellow-400" size={16} />}
						<div className={`w-3 h-3 rounded-full ml-2 ${currentPlayer && currentPlayer.getACK() ? "bg-green-500" : "bg-red-500"}`}></div>
						{(lock === "initial-hand" || lock === "waiting-for-dealer") &&
							(currentPlayer && currentPlayer.hasMadeChoices() ? (
								<CheckCircle className="ml-2 text-green-500" size={16} />
							) : (
								<XCircle className="ml-2 text-red-500" size={16} />
							))}
					</div>
					{currentPlayer && currentPlayer.getAddress() === dealer && dealer && (
						<div className="bg-gray-800 text-white p-2 rounded">
							<div>Dealer</div>
						</div>
					)}
				</div>
			</div>

			{!allPlayersAcked && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
						<h2 className="text-2xl font-bold mb-4">Waiting for all players to join...</h2>
						<p>Please wait while other players show up.</p>
					</div>
				</div>
			)}

			{lock === "end-game" && winner && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg text-center">
						{winner !== address ? (
							<>
								<h2 className="text-3xl font-bold mb-4">The Winner is</h2>
								<p className="text-md flex items-center justify-center">
									{winner} <Crown className="ml-2 text-yellow-400" size={24} />
								</p>
							</>
						) : (
							<h2 className="text-3xl font-bold flex flex-row items-center">
								<Crown className="text-yellow-400 mr-2" size={24} />
								You won!
							</h2>
						)}
						<button onClick={onReturnToMenu} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
							Reload & Play Again{/*Return to Menu*/}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
