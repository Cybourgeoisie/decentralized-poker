import "@coinbase/onchainkit/styles.css";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import AccountConnect from "../components/account-connect/AccountConnect";
import { ConnectKitProvider } from "connectkit";
import PokerTable from "../components/poker-table/PokerTable";
import ChatSidebar from "../components/chat-sidebar/ChatSidebar";
import { XMTPProvider } from "@xmtp/react-sdk";
import { XMTPHelperProvider } from "../providers/XMTPHelperProvider";

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

const players = [
	{ id: 1, name: "Player 1" },
	{ id: 2, name: "Player 2" },
	{ id: 3, name: "Player 3" },
	{ id: 4, name: "Player 4" },
	{ id: 5, name: "Player 5" },
	{ id: 6, name: "You" },
	// Add more players as needed, up to 6
];

function App() {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>
					<XMTPProvider>
						<XMTPHelperProvider>
							<div className="App">
								<header className="text-white flex flex-row items-end w-full p-4 absolute z-10 pointer-events-none">
									<AccountConnect />
								</header>
								<div className="w-full">
									<PokerTable players={players} />
								</div>
								<ChatSidebar />
							</div>
						</XMTPHelperProvider>
					</XMTPProvider>
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}

export default App;
