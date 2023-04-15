import {
  getSimpleAccount,
  getVerifyingPaymaster,
  getGasFee,
  printOp,
  getHttpRpcClient,
  ERC20_ABI,
} from "../stackup";
import { ethers } from "ethers";
import { sendRestApi } from "../sendRestApi";
import { publicEnv, serverEnv } from "../../env";
import config from "../../config.json";

export const createAccount = async () => {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const accountAPI = getSimpleAccount(
    provider,
    serverEnv.signingKey,
    config.entryPoint,
    config.simpleAccountFactory
  );
  const address = await accountAPI.getCounterFactualAddress();

  return address;
};

export const sendTx = async (
  to: string,
  value: number,
  data: string,
  withPaymaster: boolean
) => {
  const provider = new ethers.providers.JsonRpcProvider(publicEnv.rpcUrl);
  const paymasterAPI = withPaymaster
    ? getVerifyingPaymaster(publicEnv.paymasterUrl, config.entryPoint)
    : undefined;
  const accountAPI = getSimpleAccount(
    provider,
    serverEnv.signingKey,
    config.entryPoint,
    config.simpleAccountFactory,
    paymasterAPI
  );
  const target = ethers.utils.getAddress(to);
  const amount = ethers.utils.parseEther(value.toString());
  const op = await accountAPI.createSignedUserOp({
    target,
    value: amount,
    data,
    ...(await getGasFee(provider)),
  });
  console.log(`Signed UserOperation: ${await printOp(op)}`);

  const client = await getHttpRpcClient(
    provider,
    publicEnv.bundlerUrl,
    config.entryPoint
  );
  const uoHash = await client.sendUserOpToBundler(op);
  console.log(`UserOpHash: ${uoHash}`);

  console.log("Waiting for transaction...");
  const txHash = await accountAPI.getUserOpReceipt(uoHash);
  console.log(`Transaction hash: ${txHash}`);
  return txHash;
};

export const sendETH = async (
  toAddress: string,
  value: number,
  withPaymaster: boolean
) => {
  const result = await sendRestApi("/api/account/sendTx", "POST", {
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      to: toAddress,
      value,
      data: "0x",
      withPaymaster,
    },
  });
  return result.hash;
};

export const sendERC20 = async (
  tokenAddress: string,
  toAddress: string,
  value: number,
  withPaymaster: boolean
) => {
  const provider = new ethers.providers.JsonRpcProvider(publicEnv.rpcUrl);
  const token = ethers.utils.getAddress(tokenAddress);
  const to = ethers.utils.getAddress(toAddress);
  const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
  const decimals = await erc20.decimals();
  const amount = ethers.utils.parseUnits(value.toString(), decimals);
  const data = erc20.interface.encodeFunctionData("transfer", [to, amount]);

  const result = await sendRestApi("/api/account/sendTx", "POST", {
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      to: toAddress,
      value,
      data,
      withPaymaster,
    },
  });
  return result.hash;
};
