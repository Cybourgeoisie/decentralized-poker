import React, { useState } from "react";
import { useDisconnect } from "wagmi";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useXMTP } from "../../providers/XMTPHelperProvider";
import { usePoker } from "../../providers/PokerProvider";

export default function DisconnectDialog() {
	const { disconnect } = useDisconnect();
	const [isOpen, setIsOpen] = useState(false);

	const { disconnect: xmtpDisconnect } = useXMTP();
	const { setGameId } = usePoker();

	const handleDisconnect = () => {
		setGameId(null);
		disconnect();
		xmtpDisconnect(null);
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button type="button" className="pointer-events-auto" onClick={() => setIsOpen(true)}>
					<svg fill="#ffffff" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon">
						<path
							transform="scale(0.025)"
							d="M832.6 191.4c-84.6-84.6-221.5-84.6-306 0l-96.9 96.9 51 51 96.9-96.9c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204l-96.9 96.9 51.1 51.1 96.9-96.9c84.4-84.6 84.4-221.5-.1-306.1zM446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l96.9-96.9-51.1-51.1-96.9 96.9c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l96.9-96.9-51-51-96.8 97zM260.3 209.4a8.03 8.03 0 0 0-11.3 0L209.4 249a8.03 8.03 0 0 0 0 11.3l554.4 554.4c3.1 3.1 8.2 3.1 11.3 0l39.6-39.6c3.1-3.1 3.1-8.2 0-11.3L260.3 209.4z"
						/>
					</svg>
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Disconnect Wallet</DialogTitle>
					<DialogDescription>Are you sure you want to disconnect your wallet?</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button type="button" variant="destructive" onClick={handleDisconnect}>
						Disconnect
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
