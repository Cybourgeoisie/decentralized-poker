import { useMessages, useStreamMessages } from "@xmtp/react-sdk";
import { useXMTP } from "../providers/XMTPHelperProvider";
import { useMemo } from "react";

export const useXMTPConversation = ({ gameId }) => {
	const { conversations } = useXMTP();

	// Use individual hooks for each conversation
	const { messages: messages0 } = useMessages(conversations[0] || { topic: "" });
	const { messages: messages1 } = useMessages(conversations[1] || { topic: "" });
	const { messages: messages2 } = useMessages(conversations[2] || { topic: "" });
	const { messages: messages3 } = useMessages(conversations[3] || { topic: "" });
	const { messages: messages4 } = useMessages(conversations[4] || { topic: "" });

	// Stream messages for each conversation
	useStreamMessages(conversations[0]);
	useStreamMessages(conversations[1]);
	useStreamMessages(conversations[2]);
	useStreamMessages(conversations[3]);
	useStreamMessages(conversations[4]);

	const formattedMessages = useMemo(() => {
		// Combine all messages
		const messages = []
			.concat(messages0 || [])
			.concat((messages1 || []).filter((m) => m.senderAddress !== m.walletAddress))
			.concat((messages2 || []).filter((m) => m.senderAddress !== m.walletAddress))
			.concat((messages3 || []).filter((m) => m.senderAddress !== m.walletAddress))
			.concat((messages4 || []).filter((m) => m.senderAddress !== m.walletAddress));

		// Format the messages, remove duplicates, and sort by timestamp
		return messages
			.filter((message, index) => {
				return messages.findIndex((m) => m.uuid === message.uuid) === index;
			})
			.map((message) => ({
				...message,
				timestamp: new Date(message.sentAt),
				gameId: ((m) => {
					try {
						return JSON.parse(m.content).gameId;
					} catch (e) {
						return null;
					}
				})(message),
				type: ((m) => {
					try {
						return JSON.parse(m.content).type;
					} catch (e) {
						return null;
					}
				})(message),
				message: ((m) => {
					try {
						return JSON.parse(m.content).message;
					} catch (e) {
						return m.content;
					}
				})(message),
			}))
			.filter((message) => message.gameId === gameId)
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [messages0, messages1, messages2, messages3, messages4, gameId]);

	// Now, split out the formatted messages into chat messages and game state messages
	const ackSenders = formattedMessages
		.filter((msg) => msg.type === "connect")
		.map((msg) => msg.senderAddress)
		.filter((value, index, self) => self.indexOf(value) === index);
	const chatMessages = formattedMessages.filter((msg) => msg.type === "chat").filter((message) => new Date() - message.timestamp < 30 * 60 * 1000);
	const gameMessages = formattedMessages.filter((msg) => msg.type === "game");

	return {
		ackSenders,
		chatMessages,
		gameMessages,
	};
};
