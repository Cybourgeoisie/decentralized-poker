import "@coinbase/onchainkit/styles.css";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { ConnectKitProvider } from "connectkit";
import { XMTPProvider } from "@xmtp/react-sdk";
import { XMTPHelperProvider } from "../providers/XMTPHelperProvider";
import { PokerProvider } from "../providers/PokerProvider";
import { ContractProvider } from "../providers/ContractProvider";
import AppUX from "./AppUX";

const wagmiConfig = createConfig({
	chains: [baseSepolia, base],
	connectors: [],
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
								<ContractProvider>
									<AppUX />
								</ContractProvider>
							</PokerProvider>
						</XMTPHelperProvider>
					</XMTPProvider>
				</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}

export default App;
