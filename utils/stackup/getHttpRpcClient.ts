import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { JsonRpcProvider } from "@ethersproject/providers";

export const getHttpRpcClient = async (
  provider: JsonRpcProvider,
  bundlerUrl: string,
  entryPointAddress: string
) => {
  const chainId = await provider.getNetwork().then((net) => net.chainId);
  return new HttpRpcClient(bundlerUrl, entryPointAddress, chainId);
};
