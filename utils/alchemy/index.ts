import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from "ethers";

import { publicEnv } from "../../env";

const getSettingsForAlchemy = (chainId: string) => {
  return {
    apiKey:
      publicEnv.alchemy[
        chainId === "1" ? "mainnet" : chainId === "5" ? "goerli" : "goerli"
      ],
    network:
      chainId === "1"
        ? Network.ETH_MAINNET
        : chainId === "5"
        ? Network.ETH_GOERLI
        : Network.ETH_GOERLI,
    maxRetries: 10,
  };
};

const getInitializeForAlchemy = (chainId: string) => {
  const settings = getSettingsForAlchemy(chainId);
  return new Alchemy(settings);
};

export const getTxCountForAlchemy = async (
  chainId: string,
  address: string
) => {
  const alchemy = getInitializeForAlchemy(chainId);

  const response = await alchemy.core.getTransactionCount(address);
  return response;
};

export const getNativeAssetBalanceForAlchemy = async (
  chainId: string,
  address: string
) => {
  const alchemy = getInitializeForAlchemy(chainId);

  const response = await alchemy.core.getBalance(address, "latest");
  return ethers.utils.formatEther(response.toString());
};
