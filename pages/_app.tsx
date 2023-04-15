import "@/styles/globals.css";
import "@/styles/gcse-style.css";

import type { AppProps } from "next/app";

import { configureChains, WagmiConfig, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { goerli } from "@wagmi/core/chains";
import { Footer } from "@/components/FooterTab";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { publicEnv } from "../env";

const { provider, webSocketProvider } = configureChains(
  [goerli],
  [publicProvider()]
);
const client = createClient({
  autoConnect: true,
  connectors: [],
  provider,
  webSocketProvider,
});

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <GoogleOAuthProvider clientId={publicEnv.googleAuthClientId}>
        <Component {...pageProps} />
        {router.pathname === "/" ? null : <Footer />}
      </GoogleOAuthProvider>
    </WagmiConfig>
  );
}
