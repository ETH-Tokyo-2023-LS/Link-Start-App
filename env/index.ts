export type EnvType = "local" | "dev" | "staging" | "prod";

export const publicEnv = {
  env: (process.env.NEXT_PUBLIC_APP_ENV as EnvType) ?? "local",
  host: process.env.NEXT_PUBLIC_HOST ?? "",
  maintenance: process.env.NEXT_PUBLIC_MAINTENANCE ?? "false",
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL ?? "",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL ?? "",
  // entryPoint: "0x0576a174D229E3cFA37253523E645A78A0C91B57",
  // simpleAccountFactory: "0x71D63edCdA95C61D6235552b5Bc74E32d8e2527B",
};

export const serverEnv = (() => {
  if (process && process.browser) return undefined as any;
  return {
    signingKey: process.env.NEXT_PUBLIC_SIGNING_KEY ?? "",
  };
})();
