import "@coinbase/onchainkit/styles.css";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import AccountConnect from "../components/account-connect/AccountConnect";
import { ConnectKitProvider } from "connectkit";

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
					<div className="App">
						<header className="App-header">
							<AccountConnect />
						</header>
					</div>
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}

export default App;
