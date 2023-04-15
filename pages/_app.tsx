import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { configureChains, WagmiConfig, createClient, useAccount } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { goerli } from "@wagmi/core/chains";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { Footer } from "@/components/FooterTab";
import { GoogleOAuthProvider } from "@react-oauth/google";

const { chains, provider, webSocketProvider } = configureChains(
  [goerli],
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
      <GoogleOAuthProvider clientId="1071348522014-3qq1ln33ful535dnd8r4f6f9vtjrv2nu.apps.googleusercontent.com">
        <Component {...pageProps} />
        {router.pathname === "/" ? null : <Footer />}
      </GoogleOAuthProvider>
    </WagmiConfig>
  );
}
