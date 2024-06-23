import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { hexlify, zeroPadBytes, toUtf8Bytes, toUtf8String } from "ethers";
import abi from "../utils/abi";

const GameContractContext = createContext();

const ContractAddresses = {
	"base-sepolia": "0x66c100126ac844264214752D0E4c191851a4dCBE",
};

export const ContractProvider = ({ children }) => {
	const [gameId, setGameId] = useState(null);
	const { address, isConnected } = useAccount();
	const { data: hash, error, writeContract } = useWriteContract();

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

	const formattedGameId = useMemo(() => {
		return gameId ? zeroPadBytes(hexlify(toUtf8Bytes(gameId)), 16) : "";
	}, [gameId]);

	const { data: gameData, isLoading: isLoadingGameData } = useReadContracts({
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
		enabled: !!formattedGameId,
	});

	const registerGame = useCallback(
		async (newGameId, maxPlayers, players) => {
			const formatted = zeroPadBytes(hexlify(toUtf8Bytes(newGameId)), 16);
			return writeContract({
				address: ContractAddresses["base-sepolia"],
				abi,
				functionName: "registerGame",
				args: [formatted, maxPlayers, players],
			});
		},
		[writeContract],
	);

	const bytes16ToString = useCallback((bytes16Value) => {
		if (!bytes16Value.match(/^(0x)?[0-9a-fA-F]{32}$/)) {
			return bytes16Value;
		}
		const hexString = bytes16Value.startsWith("0x") ? bytes16Value.slice(2) : bytes16Value;
		const trimmedHexString = hexString.replace(/^0+/, "");
		const utf8String = toUtf8String("0x" + trimmedHexString);
		return utf8String.replace(/\0/g, "");
	}, []);

	const generateRandomString = useCallback(async (length = 10) => {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			await new Promise((resolve) => setTimeout(resolve, 1));
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}, []);

	const value = {
		address,
		isConnected,
		gameId,
		setGameId,
		hash,
		error,
		isConfirming,
		isPending,
		isConfirmed,
		gameData,
		isLoadingGameData,
		registerGame,
		bytes16ToString,
		generateRandomString,
	};

	return <GameContractContext.Provider value={value}>{children}</GameContractContext.Provider>;
};

export const useGameContract = () => useContext(GameContractContext);
