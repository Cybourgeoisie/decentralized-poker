import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from "react";
import { Client, useClient, useCanMessage, useStartConversation, useSendMessage, useMessages, useStreamMessages } from "@xmtp/react-sdk";

const XMTPContext = createContext();

const getEnv = () => {
	// "dev" | "production" | "local"
	return typeof process !== undefined && process.env.REACT_APP_XMTP_ENV ? process.env.REACT_APP_XMTP_ENV : "dev";
};

export const useXMTP = () => useContext(XMTPContext);

export const XMTPHelperProvider = ({ children }) => {
	const [conversations, setConversations] = useState([]);
	const [messageHistory, setMessageHistory] = useState([]);
	const [isInitialized, setIsInitialized] = useState(false);

	const { client, initialize, disconnect: disconnectClient } = useClient();
	const { startConversation } = useStartConversation();
	const { canMessage } = useCanMessage();
	const { sendMessage } = useSendMessage();

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

				let keys = await Client.getKeys(walletClient, {
					...options,
					skipContactPublishing: true,
					persistConversations: false,
				});

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
				setConversations([]);
				setMessageHistory([]);
				setIsInitialized(false);
				console.log("XMTP client disconnected");
			} catch (error) {
				console.error("Failed to disconnect XMTP client:", error);
			}
		}
	}, [client, disconnectClient]);

	const formatMessage = function (gameId, messageType, message) {
		return JSON.stringify({ gameId, type: messageType, message });
	};

	const startNewConversation = useCallback(
		async (gameId, address) => {
			if (client && (await canMessage(address))) {
				try {
					const newConversation = await startConversation(address, formatMessage(gameId, "connect", "ACK"));
					setConversations((conversations) => {
						if (conversations && conversations.length && conversations.find((c) => c.peerAddress === newConversation.conversation.peerAddress)) {
							return conversations;
						}

						// Special case for the first conversation
						if (address === "0x937C0d4a6294cdfa575de17382c7076b579DC176") {
							// If there are fewer than 5 conversations, add as many as needed to make five
							const numToAdd = 5 - conversations.length;

							if (numToAdd > 0) {
								return conversations.concat(new Array(numToAdd).fill(newConversation.conversation));
							} else {
								return conversations;
							}
						}

						// Replace the first conversation that has the "default" address
						const index = conversations.findIndex((c) => c.peerAddress === "0x937C0d4a6294cdfa575de17382c7076b579DC176");
						if (index >= 0) {
							conversations[index] = newConversation.conversation;
							return conversations;
						}

						// if we make it here, just set the new conversation to the end of the list
						return conversations.concat(newConversation.conversation);
					});
					return newConversation;
				} catch (error) {
					console.error("Failed to start conversation:", error);
				}
			}
		},
		[client, canMessage, startConversation, setConversations],
	);

	useEffect(() => {
		// Add the default address
		startNewConversation("0", "0x937C0d4a6294cdfa575de17382c7076b579DC176");
	}, [startNewConversation]);

	const broadcastMessageWrapper = useCallback(
		async (gameId, type, message) => {
			if (conversations) {
				for (const conversation of conversations) {
					try {
						if (conversation && conversation.peerAddress) {
							await sendMessage(conversation, formatMessage(gameId, type, message));
						}
					} catch (error) {
						console.error("Failed to send message:", error);
					}
				}
			}
		},
		[conversations, sendMessage],
	);

	const sendDirectMessage = useCallback(
		async (address, gameId, type, message) => {
			if (conversations) {
				// If this is the same address as the sender, then send to the special address
				if (client.address === address) {
					address = "0x937C0d4a6294cdfa575de17382c7076b579DC176";
				}

				const conversation = conversations.find((c) => c.peerAddress === address);
				try {
					if (conversation && conversation.peerAddress) {
						await sendMessage(conversation, formatMessage(gameId, type, message));
					}
				} catch (error) {
					console.error("Failed to send message:", error);
				}
			}
		},
		[conversations, sendMessage],
	);

	const value = {
		client,
		isInitialized,
		initXmtp,
		disconnect,
		startNewConversation,
		conversations,
		messageHistory,
		sendMessage: broadcastMessageWrapper,
		sendDirectMessage,
	};

	return <XMTPContext.Provider value={value}>{children}</XMTPContext.Provider>;
};
