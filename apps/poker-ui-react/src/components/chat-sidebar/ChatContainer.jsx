import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { useMessages, useStreamMessages, useClient } from "@xmtp/react-sdk";
import ChatItem from "./ChatItem";
import { useXMTP } from "../../providers/XMTPHelperProvider";

export const ChatContainer = ({ conversation, isPWA = false, isContained = false }) => {
	const messagesEndRef = useRef(null);
	const [messageHistory, setMessageHistory] = useState([]);
	const { client } = useClient();
	const { messages, isLoading } = useMessages(conversation);

	const { sendMessage } = useXMTP();

	const onMessage = useCallback((message) => {
		console.log("New message received:", message);
		//console.log("old messages:", messageHistory);
		//setMessageHistory((prevMessages) => [...prevMessages, message]);
	}, []);

	useStreamMessages(conversation, { onMessage });

	const handleSendMessage = async (newMessage) => {
		if (!newMessage.trim()) {
			return;
		}
		if (conversation && conversation.peerAddress) {
			await sendMessage(newMessage);
		}
	};

	useEffect(() => {
		if (!isContained) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		if (messages) {
			setMessageHistory(messages);
		}
	}, [messages]);

	return (
		<div className={`flex flex-col justify-between h-full ${isPWA ? "text-lg" : "text-sm"}`}>
			{isLoading ? (
				<small className="text-center">Loading messages...</small>
			) : (
				<>
					<ul className="px-1 py-1 m-0 flex-grow flex flex-col items-start overflow-y-auto">
						{messages.slice().map((message) => (
							<ChatItem isPWA={isPWA} key={message.id} message={message} senderAddress={message.senderAddress} client={client} />
						))}
						<div ref={messagesEndRef} />
					</ul>
					<ChatInput
						isPWA={isPWA}
						onSendMessage={(msg) => {
							handleSendMessage(msg);
						}}
					/>
				</>
			)}
		</div>
	);
};
