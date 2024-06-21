import React, { createContext, useState, useContext, useCallback } from "react";
import { Client, useClient, useCanMessage, useStartConversation } from "@xmtp/react-sdk";

const XMTPContext = createContext();

const ENCODING = "binary";

const getEnv = () => {
	// "dev" | "production" | "local"
	return typeof process !== undefined && process.env.REACT_APP_XMTP_ENV ? process.env.REACT_APP_XMTP_ENV : "dev";
};

const buildLocalStorageKey = (walletAddress) => {
	return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";
};

const loadKeys = (walletAddress) => {
	const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
	return val ? Buffer.from(val, ENCODING) : null;
};

const storeKeys = (walletAddress, keys) => {
	localStorage.setItem(buildLocalStorageKey(walletAddress), Buffer.from(keys).toString(ENCODING));
};

const wipeKeys = (walletAddress) => {
	localStorage.removeItem(buildLocalStorageKey(walletAddress));
};

export const useXMTP = () => useContext(XMTPContext);

export const XMTPHelperProvider = ({ children }) => {
	const [conversation, setConversation] = useState(null);
	const [messageHistory, setMessageHistory] = useState([]);
	const [isInitialized, setIsInitialized] = useState(false);

	const { client, initialize, disconnect: disconnectClient } = useClient();
	const { startConversation } = useStartConversation();
	const { canMessage } = useCanMessage();

	const getAddress = async (signer) => {
		try {
			if (signer && typeof signer.getAddress === "function") {
				return await signer.getAddress();
			}
			if (signer && typeof signer.getAddresses === "function") {
				//viem
				const [address] = await signer.getAddresses();
				return address;
			}
			return null;
		} catch (e) {
			console.log(e);
		}
	};

	const initXmtp = useCallback(
		async (walletClient) => {
			if (!client && walletClient) {
				const options = { env: getEnv() };

				const address = await getAddress(walletClient);
				if (!address) return;

				let keys = loadKeys(address);
				if (!keys) {
					keys = await Client.getKeys(walletClient, {
						...options,
						skipContactPublishing: true,
						persistConversations: false,
					});
					storeKeys(address, keys);
				}

				try {
					await initialize({ keys, options, signer: walletClient });
					setIsInitialized(true);
					console.log("XMTP client initialized");
				} catch (error) {
					console.error("Failed to initialize XMTP client:", error);
				}
			}
		},
		[client, initialize],
	);

	const disconnect = useCallback(async () => {
		if (client) {
			try {
				await disconnectClient();
				setConversation(null);
				setMessageHistory([]);
				setIsInitialized(false);
				console.log("XMTP client disconnected");
			} catch (error) {
				console.error("Failed to disconnect XMTP client:", error);
			}
		}
	}, [client, disconnectClient]);

	const startNewConversation = useCallback(
		async (address) => {
			if (client && (await canMessage(address))) {
				try {
					const newConversation = await startConversation(address, "Hello!");
					setConversation(newConversation.conversation);
					return newConversation;
				} catch (error) {
					console.error("Failed to start conversation:", error);
				}
			}
		},
		[client, canMessage, startConversation],
	);

	const sendMessage = useCallback(
		async (message) => {
			if (conversation) {
				try {
					await conversation.send(message);
				} catch (error) {
					console.error("Failed to send message:", error);
				}
			}
		},
		[conversation],
	);

	const value = {
		client,
		isInitialized,
		initXmtp,
		disconnect,
		startNewConversation,
		conversation,
		messageHistory,
		sendMessage,
	};

	return <XMTPContext.Provider value={value}>{children}</XMTPContext.Provider>;
};
