import React from "react";
import { Card } from "../ui/card";
import PokerCard from "./PokerCard";

export default function PokerTable({ players, communityCards, yourHand }) {
	// Ensure the number of players is between 2 and 6
	const numPlayers = Math.max(2, Math.min(6, players.length));

	return (
		<div className="relative w-full h-screen bg-green-800 p-4">
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-700 rounded-full border-4 border-yellow-600">
				{/* Community cards */}
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-2">
					{communityCards.map((card, index) => (
						<PokerCard key={index} className="w-10 h-14" value={card} />
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
							<PokerCard />
							<PokerCard />
						</div>
					</div>
				);
			})}

			{/* Your hand */}
			<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
				<div className="flex space-x-2 mb-2">
					{yourHand.map((card, index) => (
						<PokerCard key={index} className="w-16 h-24 text-2xl" value={card} />
					))}
				</div>
				<div className="bg-gray-800 text-white p-2 rounded">
					<div>{players[numPlayers - 1].name}</div>
				</div>
			</div>
		</div>
	);
}
