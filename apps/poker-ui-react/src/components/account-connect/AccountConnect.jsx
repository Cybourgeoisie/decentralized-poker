import React, { useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient } from "wagmi";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import styled from "styled-components";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useXMTP } from "../../providers/XMTPHelperProvider";
import DisconnectDialog from "./DisconnectDialog";

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

export default function AccountConnect({ setGameId }) {
	const { address, status, isConnected } = useAccount();
	const { data: walletClient } = useWalletClient();

	const { initXmtp, isInitialized: isXmtpInitialized } = useXMTP();

	useEffect(() => {
		if (isConnected && walletClient && !isXmtpInitialized) {
			initXmtp(walletClient);
		}
	}, [isConnected, walletClient, isXmtpInitialized, initXmtp]);

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
						<Avatar address={address} />
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
										<div onClick={initXmtp} className="text-xs pointer-events-auto cursor-pointer w-3 h-3 rounded-full bg-red-500" />
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
						<DisconnectDialog setGameId={setGameId} />
					</>
				);
			})()}
		</div>
	);
}
