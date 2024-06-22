import React, { createContext, useContext, useMemo } from "react";
import { useMessages, useStreamMessages } from "@xmtp/react-sdk";
import { useXMTP } from "./XMTPHelperProvider";

const XMTPConversationContext = createContext();

export const XMTPConversationProvider = ({ children }) => {
	const { conversations } = useXMTP();

	// We do this because React requires an exact number of hooks to be called in a component
	// And XMTP does not support group conversations in their front-end / React / JS SDK
	// So we have to do a really ridiculous workaround to emulate a group conversation
	const { messages: messages0, isLoading: isLoading0 } = useMessages(conversations[0] || { topic: "" });
	const { messages: messages1, isLoading: isLoading1 } = useMessages(conversations[1] || { topic: "" });
	const { messages: messages2, isLoading: isLoading2 } = useMessages(conversations[2] || { topic: "" });
	const { messages: messages3, isLoading: isLoading3 } = useMessages(conversations[3] || { topic: "" });
	const { messages: messages4, isLoading: isLoading4 } = useMessages(conversations[4] || { topic: "" });

	useStreamMessages(conversations[0]);
	useStreamMessages(conversations[1]);
	useStreamMessages(conversations[2]);
	useStreamMessages(conversations[3]);
	useStreamMessages(conversations[4]);

	const messages = useMemo(() => {
		// Combine all messages - if any of them are empty, return an empty array
		return []
			.concat(messages0 || [])
			.concat((messages1 || []).filter((m) => m.senderAddress !== m.walletAddress))
			.concat((messages2 || []).filter((m) => m.senderAddress !== m.walletAddress))
			.concat((messages3 || []).filter((m) => m.senderAddress !== m.walletAddress))
			.concat((messages4 || []).filter((m) => m.senderAddress !== m.walletAddress));
	}, [messages0, messages1, messages2, messages3, messages4]);

	// Format the messages, remove duplicates, and sort by timestamp
	const formatted = messages
		.filter((message, index) => {
			return messages.findIndex((m) => m.uuid === message.uuid) === index;
		})
		.map((message) => ({
			...message,
			timestamp: new Date(message.sentAt),
		}));

	const formattedMessages = formatted.sort((a, b) => a.timestamp - b.timestamp);

	const value = {
		formattedMessages,
	};

	return <XMTPConversationContext.Provider value={value}>{children}</XMTPConversationContext.Provider>;
};

export const useXMTPConversation = () => useContext(XMTPConversationContext);
