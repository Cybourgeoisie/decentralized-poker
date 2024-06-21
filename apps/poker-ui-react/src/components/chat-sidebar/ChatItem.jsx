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
		const contentType = ContentTypeId.fromString(message.contentType);
		const codec = client.codecFor(contentType);
		let content = message.content;
		if (!codec) {
			if (message?.contentFallback !== undefined) content = message?.contentFallback;
			else return null;
		}
		return (
			<div className="flex flex-row">
				<div className="break-words">{content}</div>
				{renderFooter(message.sentAt)}
			</div>
		);
	};

	const isSender = senderAddress === client?.address;

	return (
		<li className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2 w-full`}>
			<div
				className={`
          px-3 py-2
          ${
				isSender
					? "bg-blue-500 text-white rounded-t-2xl rounded-l-2xl rounded-br-lg"
					: "bg-gray-200 text-gray-800 rounded-t-2xl rounded-r-2xl rounded-bl-lg"
			}
          ${isPWA ? "text-lg" : "text-base"}
          shadow-sm
        `}
			>
				{renderMessage(message)}
			</div>
		</li>
	);
};

export default ChatItem;
