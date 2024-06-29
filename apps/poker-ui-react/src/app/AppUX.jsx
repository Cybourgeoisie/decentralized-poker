import React, { useState, useEffect } from "react";
import AccountConnect from "../components/account-connect/AccountConnect";
import GameSetupUX from "./GameSetupUX";
import GameUX from "./GameUX";
import ChatSidebar from "../components/chat-sidebar/ChatSidebar";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
import { useGameContract } from "../providers/ContractProvider";

export default function AppUX() {
	const { startNewConversation } = useXMTP();
	const { addPlayer, players, setDealerByAddress } = usePoker();
	const { address, gameId, setGameId, gameData, bytes16ToString, registerGame, generateRandomString, isConfirmed } = useGameContract();
	const [newGameId, setNewGameId] = useState(null);
	const [invalidGameId, setInvalidGameId] = useState(false);

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
		if (gameData && gameData.length > 0 && (!players || players.length === 0)) {
			const [gameInfo, gamePlayers] = gameData;

			if (!gameInfo || !gameInfo.result) {
				return;
			}

			const [hexGameId, , creator] = gameInfo.result;
			if (hexGameId.length > 0 && hexGameId !== "0x00000000000000000000000000000000") {
				const stringGameId = bytes16ToString(hexGameId);
				if (gameId !== stringGameId) {
					console.log("gameId mismatch:", gameId, ", received:", stringGameId);
					return;
				}

				// Switch to async here to generate the keys
				(async () => {
					if (gamePlayers && gamePlayers.result) {
						gamePlayers.result.forEach((player, index) => {
							if (player.toLowerCase() !== address.toLowerCase()) {
								addPlayer({ id: index, name: String(player).substring(0, 10), address: String(player) });
								startNewConversation(stringGameId, player);
							}
						});
					}
					addPlayer({ id: 5, name: "You", address });

					// The dealer is the creator of the game
					setDealerByAddress(creator);
				})();
			} else if (hexGameId === "0x00000000000000000000000000000000") {
				setInvalidGameId(true);
			}
		}
	}, [gameId, gameData, bytes16ToString, startNewConversation, addPlayer, address, setInvalidGameId, setDealerByAddress, players]);

	return (
		<div className="App">
			{/* Account Connect */}
			<header className="text-white flex flex-row items-end w-full p-4 absolute z-50 pointer-events-none">
				<AccountConnect setGameId={setGameId} />
			</header>

			{/* Game UX */}
			<GameUX gameId={gameId} players={players} />

			{/* Game Setup UX */}
			<GameSetupUX
				gameId={gameId}
				setGameId={setGameId}
				registerNewGame={registerNewGame}
				joinGame={joinGame}
				invalidGameId={invalidGameId}
				setInvalidGameId={setInvalidGameId}
			/>

			{/* Chat Sidebar */}
			<ChatSidebar gameId={gameId} />
		</div>
	);
}
