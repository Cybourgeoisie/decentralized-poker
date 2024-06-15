import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect } from "wagmi";
import { Avatar, Name } from "@coinbase/onchainkit/identity";

import styled from "styled-components";

const StyledButton = styled.button`
	cursor: pointer;
	position: relative;
	display: inline-block;
	padding: 14px 24px;
	color: #ffffff;
	background: #1a88f8;
	font-size: 16px;
	font-weight: 500;
	border-radius: 10rem;
	box-shadow: 0 4px 24px -6px #1a88f8;

	transition: 200ms ease;
	&:hover {
		transform: translateY(-6px);
		box-shadow: 0 6px 40px -6px #1a88f8;
	}
	&:active {
		transform: translateY(-3px);
		box-shadow: 0 6px 32px -6px #1a88f8;
	}
`;

export default function AccountConnect() {
	const { address, status } = useAccount();
	const { disconnect } = useDisconnect();

	return (
		<div className="flex flex-grow">
			{(() => {
				if (status === "disconnected") {
					return (
						<ConnectKitButton.Custom>
							{({ isConnected, show, truncatedAddress, ensName }) => {
								return <StyledButton onClick={show}>{isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}</StyledButton>;
							}}
						</ConnectKitButton.Custom>
					);
				}

				return (
					<div className="flex h-10 items-center space-x-4">
						{address && (
							<>
								<Avatar address={address} showAttestation />
								<div className="flex flex-col text-sm">
									<b>
										<Name address={address} />
									</b>
									<Name address={address} showAddress />

									<button type="button" onClick={() => disconnect()}>
										Disconnect Wallet
									</button>
								</div>
							</>
						)}
					</div>
				);
			})()}
		</div>
	);
}
