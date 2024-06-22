import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { usePoker } from "../providers/PokerProvider";
import PokerTable from "../components/poker/PokerTable";
import { useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import abi from "../utils/abi";
import { hexlify, zeroPadBytes, toUtf8Bytes, toUtf8String } from "ethers";

const demoPlayers = [
	{ id: 1, name: "Player 1" },
	{ id: 2, name: "Player 2" },
	{ id: 3, name: "Player 3" },
	{ id: 4, name: "Player 4" },
	{ id: 5, name: "Player 5" },
	{ id: 6, name: "You" },
];

const ContractAddresses = {
	"base-sepolia": "0x66c100126ac844264214752D0E4c191851a4dCBE",
};

export default function GameUX() {
	const { client: XmtpClient, startNewConversation } = useXMTP();
	const [joinGameId, setJoinGameId] = useState("");
	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const { data: hash, error, writeContract } = useWriteContract();
	const { address, isConnected } = useAccount();
	const { gameId, setGameId, communityCards, addPlayer, getPlayerHand, players, setNewDeck, dealHand, dealCommunityCards, deck } = usePoker();

	useEffect(() => {
		if (deck && deck.length === 52) {
			for (let i = 0; i < players.length; i++) {
				const player = players[i];
				dealHand(deck, player.id);
			}
			dealCommunityCards(deck);
		}
	}, [dealHand, dealCommunityCards, deck, players]);

	const {
		isLoading: isConfirming,
		isPending,
		isSuccess: isConfirmed,
	} = useWaitForTransactionReceipt({
		hash,
	});

	const contract = {
		address: ContractAddresses["base-sepolia"],
		abi,
	};

	const formattedGameId = (gameId && zeroPadBytes(hexlify(toUtf8Bytes(gameId)), 16)) || "";

	const result = useReadContracts({
		contracts: [
			{
				...contract,
				functionName: "games",
				args: [formattedGameId],
			},
			{
				...contract,
				functionName: "getPlayersInGame",
				args: [formattedGameId],
			},
		],
	});

	// test: KDVDzBJqIX
	const handleGameResult = result && result.data && result.data.length > 0 && result.data[0].result;
	if ((handleGameResult && !deck) || deck?.length === 0) {
		const game = result.data[0].result;
		const players = result.data[1].result;

		// Verify that the gameId is valid
		const gameId = game[0];
		if (gameId.length <= 0 || gameId === "0x00000000000000000000000000000000") {
			return;
		}

		//const maxPlayers = parseInt(game[1], 10);
		const stringGameId = bytes16ToString(gameId);
		setGameId(stringGameId);
		startNewConversation(stringGameId, "0x937C0d4a6294cdfa575de17382c7076b579DC176");

		players.forEach((player, index) => {
			// Skip over the current user
			if (player.toLowerCase() === address.toLowerCase()) return;
			addPlayer({ id: index + 1, name: String(player).substring(0, 10), address: String(player) });
			startNewConversation(stringGameId, player);
		});
		addPlayer({ id: 6, name: "You" });
		setNewDeck();
	}

	const startNewGame = async () => {
		const newGameId = await generateRandomString();
		setGameId(newGameId);
		addPlayer({ id: 6, name: "You" });
		setNewDeck();

		const formattedGameId = zeroPadBytes(hexlify(toUtf8Bytes(newGameId)), 16);
		writeContract({
			address: ContractAddresses["base-sepolia"],
			abi,
			functionName: "registerGame",
			args: [formattedGameId, 2n, ["0xC27A7a787b3A115435DF8Fa154Ff0DfA0C63E276"]],
		});
	};

	const joinGame = async () => {
		if (joinGameId.trim()) {
			setGameId(joinGameId);
		}
	};

	const copyGameId = () => {
		navigator.clipboard.writeText(gameId);
		setCopiedToClipboard(true);
		setTimeout(() => setCopiedToClipboard(false), 2000);
	};

	const yourHand = getPlayerHand(6);

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

			{XmtpClient && isConfirming && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
					<div className="text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
						<h1 className="text-3xl font-bold text-gray-800 mb-4">Waiting for Transaction Confirmation...</h1>
						<p className="text-md text-gray-600">
							Hash:{" "}
							<a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank">
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

			{XmtpClient && gameId && (
				<div className="relative w-full h-full">
					<PokerTable players={players} communityCards={communityCards} yourHand={yourHand} />
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

async function generateRandomString(length = 10) {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		// Wait 1ms
		await new Promise((resolve) => setTimeout(resolve, 1));
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function bytes16ToString(bytes16Value) {
	// If not a hex string, return the original value
	if (!bytes16Value.match(/^(0x)?[0-9a-fA-F]{32}$/)) {
		return bytes16Value;
	}

	// Remove '0x' prefix if present
	const hexString = bytes16Value.startsWith("0x") ? bytes16Value.slice(2) : bytes16Value;

	// Remove zero padding
	const trimmedHexString = hexString.replace(/^0+/, "");

	// Convert hex to UTF-8 string
	const utf8String = toUtf8String("0x" + trimmedHexString);

	// Trim any null characters
	return utf8String.replace(/\0/g, "");
}
