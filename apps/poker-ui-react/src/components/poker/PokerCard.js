import React from "react";
import { Card } from "../ui/card";
import { cn } from "../../utils/cn";

export default function PokerCard({ value, className = "" }) {
	return (
		<Card className={cn("flex items-center justify-center bg-white text-black", !value ? "w-4 h-6 rounded-sm bg-blue-500" : "", className)}>{value}</Card>
	);
}
