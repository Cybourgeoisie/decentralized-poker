import React from "react";
import { Card } from "../ui/card";
import { cn } from "../../utils/cn";

export default function PokerCard({ value, className = "" }) {
	// Convert the card value from pokersolver format to the format used by the Card component
	let textColor = "text-black";
	if (value) {
		// Split the card value into rank and suit
		let rank = value.slice(0, -1);
		let suit = value.slice(-1);

		rank = rank.replace("T", "10");
		suit = suit.replace("d", "♦").replace("c", "♣").replace("h", "♥").replace("s", "♠");

		// Determine the text color based on the suit
		textColor = suit === "♦" || suit === "♥" ? "text-red-600" : "text-black";
		value = `${suit}${rank}`;
	}

	return (
		<Card className={cn("flex items-center justify-center bg-white", textColor, !value ? "w-4 h-6 rounded-sm bg-blue-500" : "", className)}>{value}</Card>
	);
}
