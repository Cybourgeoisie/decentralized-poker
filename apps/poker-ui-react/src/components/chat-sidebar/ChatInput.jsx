import React, { useState } from "react";

export const ChatInput = ({ onSendMessage, isPWA = false }) => {
	const [newMessage, setNewMessage] = useState("");

	const handleInputChange = (event) => {
		setNewMessage(event.target.value);
	};

	const handleKeyPress = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendMessage();
		}
	};

	const handleSendMessage = () => {
		if (newMessage.trim()) {
			onSendMessage(newMessage);
			setNewMessage("");
		}
	};

	return (
		<div className="flex items-center border-t border-gray-200 p-3">
			<input
				type="text"
				value={newMessage}
				onChange={handleInputChange}
				onKeyPress={handleKeyPress}
				placeholder="Type your message..."
				className="flex-grow px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
			/>
			<button
				onClick={handleSendMessage}
				className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${
					isPWA ? "text-xl" : "text-sm"
				}`}
			>
				{isPWA ? "📤" : "Send"}
			</button>
		</div>
	);
};
