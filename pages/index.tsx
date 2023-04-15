import Image from "next/image";
import { Inter } from "next/font/google";
import { useAccount, useChainId, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useRouter } from "next/router";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const chainId = useChainId();
  const account = useAccount();
  const router = useRouter();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
    chainId: chainId,
  });

  useEffect(() => {
    if (account.isConnected) {
      router.push("/wallet");
    }
  }, [account, router]);

  return (
    <div
      className={`${inter.className} flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <Image
        className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
        src="/linkstart.png"
        alt="Project Logo"
        width={500}
        height={300}
        priority
      />

      <button
        type="button"
        onClick={() => connect()}
        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-xl rounded-lg text-sm px-10 py-5 text-center mr-2 mb-2"
      >
        LINK START
      </button>
    </div>
  );
}
