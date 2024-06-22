import "@coinbase/onchainkit/styles.css";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import AccountConnect from "../components/account-connect/AccountConnect";
import { ConnectKitProvider } from "connectkit";
import GameUX from "./GameUX";
import ChatSidebar from "../components/chat-sidebar/ChatSidebar";
import { XMTPProvider } from "@xmtp/react-sdk";
import { XMTPHelperProvider } from "../providers/XMTPHelperProvider";
import { PokerProvider } from "../providers/PokerProvider";

const wagmiConfig = createConfig({
	chains: [baseSepolia, base],
	connectors: [
		coinbaseWallet({
			appChainIds: [baseSepolia.id, base.id],
			appName: "onchainkit-decentralized-poker",
		}),
	],
	ssr: true,
	transports: {
		[baseSepolia.id]: http(),
		[base.id]: http(),
	},
});

// Create a client
const queryClient = new QueryClient();

function App() {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>
					<XMTPProvider>
						<XMTPHelperProvider>
							<PokerProvider>
								<div className="App">
									{/* Account Connect */}
									<header className="text-white flex flex-row items-end w-full p-4 absolute z-50 pointer-events-none">
										<AccountConnect />
									</header>

									{/* Game UX */}
									<GameUX />

									{/* Chat Sidebar */}
									<ChatSidebar />
								</div>
							</PokerProvider>
						</XMTPHelperProvider>
					</XMTPProvider>
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}

export default App;
