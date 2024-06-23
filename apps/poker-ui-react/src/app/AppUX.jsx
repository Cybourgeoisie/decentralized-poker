import React, { useState, useEffect } from "react";
import AccountConnect from "../components/account-connect/AccountConnect";
import GameUX from "./GameUX";
import ChatSidebar from "../components/chat-sidebar/ChatSidebar";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
import { useGameContract } from "../providers/ContractProvider";

export default function AppUX() {
	const { client: XmtpClient, startNewConversation, sendMessage } = useXMTP();
	const { communityCards, addPlayer, getPlayerHand, players, setNewDeck, dealHand, dealCommunityCards, deck } = usePoker();
	const { address, gameId, setGameId, gameData, bytes16ToString, registerGame, generateRandomString, isConfirmed } = useGameContract();
	const [newGameId, setNewGameId] = useState(null);

	const registerNewGame = async (players = []) => {
		const newGameId = await generateRandomString();
		setNewGameId(newGameId);
		registerGame(
			newGameId,
			2,
			players.filter((player) => player && player.trim().length > 0),
		);
	};

	const joinGame = async (joinGameId) => {
		if (joinGameId.trim()) {
			setGameId(joinGameId);
		}
	};

	useEffect(() => {
		if (isConfirmed && newGameId !== gameId && newGameId) {
			setGameId(newGameId);
		}
	}, [isConfirmed, setGameId, newGameId, gameId]);

	useEffect(() => {
		if (gameData && gameData.length > 0 && (!deck || deck.length === 0)) {
			const [gameInfo, gamePlayers] = gameData;

			if (!gameInfo || !gameInfo.result) {
				return;
			}

			const [hexGameId] = gameInfo.result;
			if (hexGameId.length > 0 && hexGameId !== "0x00000000000000000000000000000000") {
				const stringGameId = bytes16ToString(hexGameId);
				if (gameId !== stringGameId) {
					console.log("gameId mismatch:", gameId, ", received:", stringGameId);
					return;
				}

				console.log("connecting...");

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
	}, [gameId, gameData, deck, bytes16ToString, setGameId, startNewConversation, addPlayer, setNewDeck, address, generateRandomString]);

	return (
		<div className="App">
			{/* Account Connect */}
			<header className="text-white flex flex-row items-end w-full p-4 absolute z-50 pointer-events-none">
				<AccountConnect setGameId={setGameId} />
			</header>

			{/* Game UX */}
			<GameUX gameId={gameId} setGameId={setGameId} registerNewGame={registerNewGame} joinGame={joinGame} />

			{/* Chat Sidebar */}
			<ChatSidebar gameId={gameId} />
		</div>
	);
}
