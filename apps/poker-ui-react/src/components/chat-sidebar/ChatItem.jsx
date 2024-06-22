import React from "react";
import { useClient, ContentTypeId } from "@xmtp/react-sdk";

const ChatItem = ({ message, senderAddress, isPWA = false }) => {
	const { client } = useClient();

	const renderFooter = (timestamp) => {
		return (
			<div className="text-xs opacity-70 mt-1 ml-1">
				<span>{`${new Date(timestamp).getHours()}:${String(new Date(timestamp).getMinutes()).padStart(2, "0")}`}</span>
			</div>
		);
	};

	const renderMessage = (message) => {
		if (!message) return null;

		const contentType = ContentTypeId.fromString(message.contentType);
		if (!contentType) return null;

		try {
			const codec = client.codecFor(contentType);
			let content = message.content;
			if (!codec) {
				if (message?.contentFallback !== undefined) content = message?.contentFallback;
				else return null;
			}

			// Only display "chat" messages
			let jsonContent = {};
			try {
				jsonContent = JSON.parse(content);
			} catch (e) {
				return null;
			}

			if (jsonContent.type !== "chat") return null;

			return (
				<div className="flex flex-row">
					<div className="break-words">{jsonContent.message}</div>
					{renderFooter(message.sentAt)}
				</div>
			);
		} catch (e) {
			console.error("Failed to render message", e);
			return null;
		}
	};

	const isSender = senderAddress === client?.address;

	const renderedMessage = renderMessage(message);
	if (!renderedMessage) return null;

	return (
		<li className={`flex ${isSender ? "justify-end" : "justify-start"} mb-1 w-full`}>
			{/* Message */}
			<div>
				{/* Sender */}
				<div className={["h-4 m-1", isSender ? "text-right" : "text-left"].join(" ")}>
					<span className="text-xs text-gray-500">{senderAddress.slice(0, 10)}</span>
				</div>
				<div
					className={`px-3 py-1.5 min-w-32 ${
						isSender
							? "bg-blue-500 text-white rounded-t-2xl rounded-l-2xl rounded-br-lg"
							: "bg-gray-200 text-gray-800 rounded-t-2xl rounded-r-2xl rounded-bl-lg"
					}
					${isPWA ? "text-lg" : "text-base"}
					shadow-sm
					`}
				>
					{renderedMessage}
				</div>
			</div>
		</li>
	);
};

export default ChatItem;
