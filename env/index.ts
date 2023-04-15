export type EnvType = "local" | "dev" | "staging" | "prod";

export const publicEnv = {
  env: (process.env.NEXT_PUBLIC_APP_ENV as EnvType) ?? "local",
  host: process.env.NEXT_PUBLIC_HOST ?? "",
  maintenance: process.env.NEXT_PUBLIC_MAINTENANCE ?? "false",
  googleAuthClientId: process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID ?? "",
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL ?? "",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? "",
  relayApiUrl: process.env.NEXT_PUBLIC_LIT_RELAY_API_URL ?? "",
  relayApiKey: process.env.NEXT_PUBLIC_LIT_RELAY_API_KEY ?? "",
  alchemy: {
    mainnet: process.env.NEXT_PUBLIC_ALCHEMY_ETH_MAINNET_API_KEY ?? "",
    goerli: process.env.NEXT_PUBLIC_ALCHEMY_ETH_GOERLI_API_KEY ?? "",
    localhost: "",
  },
};

export const serverEnv = (() => {
  if (process && process.browser) return undefined as any;
  return {
    googleAuthClientSecret:
      process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_SECRET ?? "",
    signingKey: process.env.NEXT_PUBLIC_SIGNING_KEY ?? "",
  };
})();
