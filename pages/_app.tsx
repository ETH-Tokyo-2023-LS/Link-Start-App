import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { configureChains, WagmiConfig, createClient, useAccount } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { polygonMumbai } from "@wagmi/core/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { Footer } from "@/components/FooterTab";

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);
const client = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider,
  webSocketProvider,
});

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
      {router.pathname === "/" ? null : <Footer />}
    </WagmiConfig>
  );
}
