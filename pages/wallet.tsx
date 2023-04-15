import { useAccount, useConnect, useChainId } from "wagmi";

export default function Wallet() {
  const chainId = useChainId();
  const { address } = useAccount();

  return <div>wallet page</div>;
}
