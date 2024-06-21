import React from "react";
import { Card } from "../ui/card";

export default function PokerTable({ players }) {
	const communityCards = ["♠A", "♥K", "♦Q", "♣J", "♠10"];
	const yourHand = ["♥A", "♥K", "♦Q", "♣J", "♠10"];

	// Ensure the number of players is between 2 and 6
	const numPlayers = Math.max(2, Math.min(6, players.length));

	return (
		<div className="relative w-full h-screen bg-green-800 p-4">
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-700 rounded-full border-4 border-yellow-600">
				{/* Community cards */}
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2">
					{communityCards.map((card, index) => (
						<Card key={index} className="w-10 h-14 flex items-center justify-center bg-white text-black">
							{card}
						</Card>
					))}
				</div>
			</div>

			{/* Other players */}
			{players.slice(0, numPlayers - 1).map((player, index) => {
				const angle = ((index + 1) / numPlayers) * Math.PI * 2 + Math.PI / 2;
				const top = 50 + 35 * Math.sin(angle);
				const left = 50 + 35 * Math.cos(angle);
				return (
					<div key={player.id} className="absolute text-center" style={{ top: `calc(${top}%`, left: `${left}%`, transform: "translate(-50%, -50%)" }}>
						<div className="bg-gray-800 text-white p-2 rounded mb-2">
							<div>{player.name}</div>
						</div>
						<div className="flex justify-center space-x-1">
							<Card className="w-4 h-6 rounded-sm bg-blue-500" />
							<Card className="w-4 h-6 rounded-sm bg-blue-500" />
							<Card className="w-4 h-6 rounded-sm bg-blue-500" />
							<Card className="w-4 h-6 rounded-sm bg-blue-500" />
							<Card className="w-4 h-6 rounded-sm bg-blue-500" />
						</div>
					</div>
				);
			})}

			{/* Your hand */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
				<div className="flex space-x-2 mb-2">
					{yourHand.map((card, index) => (
						<Card key={index} className="w-16 h-24 flex items-center justify-center bg-white text-black text-2xl">
							{card}
						</Card>
					))}
				</div>
				<div className="bg-gray-800 text-white p-2 rounded">
					<div>{players[numPlayers - 1].name}</div>
				</div>
			</div>
		</div>
	);
}
