import React, { useRef, useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { useClient } from "@xmtp/react-sdk";
import ChatItem from "./ChatItem";
import { useXMTP } from "../../providers/XMTPHelperProvider";
import { useXMTPConversation } from "../../utils/XMTPConversation";

export const ChatContainer = ({ gameId, isPWA = false, isContained = false }) => {
	const messagesEndRef = useRef(null);
	const { client } = useClient();
	const { sendMessage } = useXMTP();

	const { chatMessages } = useXMTPConversation({ gameId });

	const handleSendMessage = useCallback(
		(newMessage) => {
			if (newMessage.trim() && gameId) {
				sendMessage(gameId, "chat", newMessage);
			}
		},
		[gameId, sendMessage],
	);

	useEffect(() => {
		if (!isContained) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages, isContained]);

	if (!client || !chatMessages) {
		return (
			<div className="flex flex-col justify-between h-full">
				<ul className="px-1 py-1 m-0 flex-grow flex flex-col items-start overflow-y-auto">
					<li className="flex justify-center w-full">
						<div className="text-center text-gray-500">Loading...</div>
					</li>
				</ul>
			</div>
		);
	}

	return (
		<div className={`flex flex-col justify-between h-full ${isPWA ? "text-lg" : "text-sm"}`}>
			<ul className="px-1 py-1 m-0 flex-grow flex flex-col items-start overflow-y-auto">
				{chatMessages.slice().map((message) => (
					<ChatItem isPWA={isPWA} key={message.id} message={message} senderAddress={message.senderAddress} client={client} />
				))}
				<div ref={messagesEndRef} />
			</ul>
			<ChatInput isPWA={isPWA} onSendMessage={handleSendMessage} />
		</div>
	);
};
