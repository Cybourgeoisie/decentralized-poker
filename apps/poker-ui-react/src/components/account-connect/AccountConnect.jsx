import React, { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import styled from "styled-components";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { useXMTP } from "../../providers/XMTPHelperProvider";

const StyledButton = styled.button`
	cursor: pointer;
	position: relative;
	display: inline-block;
	padding: 10px 18px;
	color: #ffffff;
	background: #1a88f8;
	font-size: 14px;
	font-weight: 500;
	border-radius: 10rem;

	transition: 200ms ease;
	&:hover {
		transform: translateY(-6px);
		box-shadow: 0 8px 20px -8px #1a88f8;
	}
	&:active {
		transform: translateY(-3px);
		box-shadow: 0 8px 12px -9px #1a88f8;
	}
`;

export default function AccountConnect() {
	const { address, status, isConnected } = useAccount();
	const { disconnect } = useDisconnect();
	const { data: walletClient } = useWalletClient();
	const [isOpen, setIsOpen] = useState(false);

	const { initXmtp, isInitialized: isXmtpInitialized, disconnect: xmtpDisconnect, startNewConversation } = useXMTP();

	const handleDisconnect = () => {
		disconnect();
		xmtpDisconnect(null);
		setIsOpen(false);
	};

	useEffect(() => {
		if (isConnected && walletClient && !isXmtpInitialized) {
			initXmtp(walletClient);
		}

		if (isXmtpInitialized) {
			startNewConversation(
				walletClient.account.address.toLowerCase() == "0x9eE5E3Ff06425CF972E77c195F70Ecb18aC23d7f".toLowerCase()
					? "0x1f48c5CA2DAA443A8413FA7a206D6a07FB7CCd04"
					: "0x9eE5E3Ff06425CF972E77c195F70Ecb18aC23d7f",
			);
		}
	}, [isConnected, walletClient, isXmtpInitialized, initXmtp, startNewConversation]);

	return (
		<div className="flex flex-row w-full items-center justify-start space-x-2">
			{(() => {
				if (status === "disconnected") {
					return (
						<ConnectKitButton.Custom>
							{({ isConnected, show, truncatedAddress, ensName }) => {
								return (
									<StyledButton className="pointer-events-auto" onClick={show}>
										{isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
									</StyledButton>
								);
							}}
						</ConnectKitButton.Custom>
					);
				}

				if (!address) {
					return <div>Connecting...</div>;
				}

				return (
					<>
						<Avatar address={address} showAttestation />
						<div className="flex flex-col text-sm">
							<b>
								<Name address={address} />
							</b>
							<Name address={address} showAddress />
						</div>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									{isXmtpInitialized ? (
										<div className="w-3 h-3 rounded-full bg-green-500 pointer-events-auto cursor-default" />
									) : (
										<button onClick={initXmtp} className="text-blue-500 text-xs pointer-events-auto cursor-pointer">
											<div className="w-3 h-3 rounded-full bg-red-500" />
										</button>
									)}
								</TooltipTrigger>
								<TooltipContent>
									{isXmtpInitialized ? (
										<p>XMTP Connected</p>
									) : (
										<p>XMTP not initialized. Click to sign the message to use chat and play the game.</p>
									)}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
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
					</>
				);
			})()}
		</div>
	);
}
