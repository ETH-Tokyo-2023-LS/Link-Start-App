import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { SimpleAccountAPI, PaymasterAPI } from "@account-abstraction/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { getVerifyingPaymaster, getGasFee, getHttpRpcClient } from "../stackup";
import { PKPWallet } from "./signer";
import { publicEnv } from "../../env";
import config from "../../config.json";

export const getSimpleAccountForPKP = async (
  provider: JsonRpcProvider,
  pkpPubKey: string,
  entryPointAddress: string,
  factoryAddress: string,
  credential?: any,
  paymasterAPI?: PaymasterAPI
) => {
  // NOTE: with Metamask
  // const PKP_PUBKEY = "{YOUR PKP UNCOMPRESSED PUBLIC KEY}";
  // const CONTROLLER_AUTHSIG = await LitJsSdk.checkAndSignAuthMessage({
  //   chain: "goerli", //"mumbai",
  // });
  // console.log(CONTROLLER_AUTHSIG);

  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();
  const sessionSigs = await litNodeClient.signSessionKey({
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resources: [`litEncryptionCondition://*`],
    authMethods: [
      {
        authMethodType: 6,
        accessToken: credential,
      },
    ],
    pkpPublicKey: pkpPubKey,
  });
  console.log("sessionSigs before saving encryption key: ", sessionSigs);

  const pkpWallet = new PKPWallet({
    pkpPubKey,
    controllerAuthSig: sessionSigs.authSig,
    provider: publicEnv.rpcUrl,
  });
  await pkpWallet.init();

  const sw = new SimpleAccountAPI({
    provider,
    entryPointAddress,
    owner: pkpWallet,
    factoryAddress,
    paymasterAPI,
  });

  // Hack: default getUserOpReceipt does not include fromBlock which causes an error for some RPC providers.
  sw.getUserOpReceipt = async (
    userOpHash: string,
    timeout = 30000,
    interval = 5000
  ): Promise<string | null> => {
    const endtime = Date.now() + timeout;
    const block = await sw.provider.getBlock("latest");
    while (Date.now() < endtime) {
      // @ts-ignore
      const events = await sw.entryPointView.queryFilter(
        // @ts-ignore
        sw.entryPointView.filters.UserOperationEvent(userOpHash),
        Math.max(0, block.number - 100)
      );
      if (events.length > 0) {
        return events[0].transactionHash;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return null;
  };

  return sw;
};

export const createAccountForPKP = async (
  pkpPubKey: string,
  credential?: any
) => {
  const provider = new ethers.providers.JsonRpcProvider(publicEnv.rpcUrl);
  const accountAPI = await getSimpleAccountForPKP(
    provider,
    pkpPubKey,
    config.entryPoint,
    config.simpleAccountFactory,
    credential
  );
  const address = await accountAPI.getCounterFactualAddress();

  return address;
};

export const sendTxForPKP = async (
  pkpPubKey: string,
  to: string,
  value: number,
  data: string,
  credential?: any,
  withPaymaster?: boolean
) => {
  const provider = new ethers.providers.JsonRpcProvider(publicEnv.rpcUrl);
  const paymasterAPI = withPaymaster
    ? getVerifyingPaymaster(publicEnv.paymasterUrl, config.entryPoint)
    : undefined;
  const accountAPI = await getSimpleAccountForPKP(
    provider,
    pkpPubKey,
    config.entryPoint,
    config.simpleAccountFactory,
    credential,
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
  console.log(`Signed UserOperation: ${JSON.stringify(op)}`);

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
