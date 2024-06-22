import React, { useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { useClient } from "@xmtp/react-sdk";
import ChatItem from "./ChatItem";
import { useXMTPConversation } from "../../providers/XMTPConversationProvider";

export const ChatContainer = ({ conversations, isPWA = false, isContained = false }) => {
	const messagesEndRef = useRef(null);
	const { client } = useClient();
	const { formattedMessages } = useXMTPConversation();

	useEffect(() => {
		if (!isContained) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [formattedMessages, isContained]);

	return (
		<div className={`flex flex-col justify-between h-full ${isPWA ? "text-lg" : "text-sm"}`}>
			<ul className="px-1 py-1 m-0 flex-grow flex flex-col items-start overflow-y-auto">
				{formattedMessages.slice().map((message) => (
					<ChatItem isPWA={isPWA} key={message.id} message={message} senderAddress={message.senderAddress} client={client} />
				))}
				<div ref={messagesEndRef} />
			</ul>
			<ChatInput isPWA={isPWA} />
		</div>
	);
};
