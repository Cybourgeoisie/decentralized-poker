import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatContainer } from "./ChatContainer";
import { useXMTP } from "../../providers/XMTPHelperProvider";

const ChatSidebar = ({ gameId }) => {
	const { conversations } = useXMTP();
	const [isOpen, setIsOpen] = useState(false);

	const toggleSidebar = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="fixed right-0 top-0 h-full">
			{/* Chat Icon */}
			<button
				onClick={toggleSidebar}
				disabled={!conversations || conversations.length === 0}
				className={["absolute top-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg", !conversations ? "bg-grey" : ""].join("")}
			>
				{isOpen ? <X size={24} /> : <MessageCircle size={24} />}
			</button>

			{/* Sidebar */}
			<div
				className={`bg-white w-80 h-full shadow-lg transform transition-transform duration-300 ease-in-out border-l-2 ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{conversations && conversations.length > 0 ? <ChatContainer gameId={gameId} /> : null}
			</div>
		</div>
	);
};

export default ChatSidebar;
