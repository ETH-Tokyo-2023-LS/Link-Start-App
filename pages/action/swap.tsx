import {
  useAccount,
  useBalance,
  useChainId,
  useContract,
  useProvider,
  useSigner,
} from "wagmi";
import ISwapRouterABI from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";
import IWETHErc20ABI from "@/abi/weth-erc20-abi.json";
import IUniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import {
  UNI_DECIMALS,
  UNI_ADDRESS,
  WETH_DECIMALS,
  WETH_ADDRESS,
} from "@/constants/token";
import { ethers } from "ethers";
import {
  POOL_ADDRESS,
  ROUTER_ADDRESS,
  UNI_V3_FACTORY_ADDRESS,
} from "@/constants/adfress";
import React, { useState } from "react";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import { MobileHeader } from "@/components/MobileHeader";
import { Num2FracStr } from "@/utils/num2FracStr";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

let _provider: ethers.providers.JsonRpcProvider;
function getProvider() {
  return _provider != null
    ? _provider
    : new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_POLYGON_TESTNET_PROVIDER_URL
      );
}

interface Immutables {
  token0: string;
  token1: string;
  fee: number;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
}

// get poolAddress from uniswap
const usePoolAddress = async () => {
  const [poolAddress, setPoolAddress] = useState<string>();

  const uniV3FactoryABI = [
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
  ];
  const uniV3Factory = new ethers.Contract(
    UNI_V3_FACTORY_ADDRESS,
    uniV3FactoryABI,
    getProvider()
  );

  const matic_matic_PoolAddress: string = await uniV3Factory.getPool(
    UNI_ADDRESS,
    WETH_ADDRESS,
    3000
  );
  console.log(matic_matic_PoolAddress);
  setPoolAddress(matic_matic_PoolAddress);

  return poolAddress;
};

const useSwap = () => {
  const { data: signer } = useSigner();
  // const poolAddress = await usePoolAddress();
  const chainId = useChainId();
  const provider = useProvider();
  const poolContract = useContract({
    address: POOL_ADDRESS,
    // address: "0x28cee28a7c4b4022ac92685c07d2f33ab1a0e122", // uni-weth
    // address: "0xca6b1B5cAE655847f8559B2B9BB6C674C7c9399F", // matic-weth
    // address: "0x6253893781bB011C4b9C114C2835603ab49F0767", // usdc-matic
    abi: IUniswapV3PoolArtifact.abi,
    signerOrProvider: provider,
  });
  const tokenContract = useContract({
    address: WETH_ADDRESS,
    abi: IWETHErc20ABI.abi,
    signerOrProvider: signer,
  });

  const { address } = useAccount();
  const routerContract = useContract({
    address: ROUTER_ADDRESS,
    abi: ISwapRouterABI.abi,
    signerOrProvider: signer,
  });

  const getPoolImmutables = async () => {
    if (!poolContract)
      throw new Error("Pool contract has not been initialized");

    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);
    console.log({ token0, token1, fee });

    const immutables: Immutables = {
      token0,
      token1,
      fee,
    };
    return immutables;
  };

  const getPoolState = async () => {
    if (!poolContract)
      throw new Error("Pool contract has not been initialized");

    const [liquidity, slot] = await Promise.all([
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);

    const PoolState: State = {
      liquidity,
      sqrtPriceX96: slot[0],
      tick: slot[1],
    };

    return PoolState;
  };

  const deposit = async (amount: number) => {
    if (!tokenContract)
      throw new Error("WETH contract has not been initialized");

    const parsedAmount = ethers.utils.parseUnits(
      amount.toString(),
      WETH_DECIMALS
    );

    const txn = await tokenContract.deposit({ value: parsedAmount });
    return txn;
  };

  const approve = async (address: string, amount: number) => {
    if (!tokenContract || !signer)
      throw new Error("contract has not been initialized");

    console.log(await signer.getAddress());

    const parsedAmount = ethers.utils.parseUnits(
      amount.toString(),
      UNI_DECIMALS
    );

    // const txn = await tokenContract
    //   .connect(signer)
    //   .approve(address, parsedAmount);
    const txn = tokenContract.approve(address, parsedAmount);
    return txn;
  };

  const getQuote = async (amount: number) => {
    const [immutables, state] = await Promise.all([
      getPoolImmutables(),
      getPoolState(),
    ]);

    const tokenA = new Token(chainId, immutables.token0, UNI_DECIMALS);
    const tokenB = new Token(chainId, immutables.token1, WETH_DECIMALS);

    const pool = new Pool(
      tokenA,
      tokenB,
      immutables.fee,
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick
    );

    const outputAmount = amount * parseFloat(pool.token1Price.toFixed(2));

    return outputAmount;
  };

  const swap = async (amount: number) => {
    if (!routerContract)
      throw new Error("Router contract has not been initialized");

    console.log({ amount });

    await deposit(amount);
    await approve(ROUTER_ADDRESS, amount);

    const immutables = await getPoolImmutables();

    const parsedAmount = ethers.utils.parseUnits(
      amount.toString(),
      UNI_DECIMALS
    );

    const params = {
      tokenIn: immutables.token1,
      tokenOut: immutables.token0,
      fee: immutables.fee,
      recipient: address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: parsedAmount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const txn = await routerContract.exactInputSingle(params, {
      gasLimit: ethers.utils.hexlify(700000),
    });

    console.log(txn);

    return txn;
  };

  return { getQuote, swap };
};

type CurrencyInputProps = {
  currencyLabel: string;
  value: number;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencyLabel,
  value,
  disabled,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="min-w-[20%] text-lg font-semibold text-white-700">
        {currencyLabel}
      </span>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={onChange}
        className="w-full py-2 px-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );
};

type CurrencyOutputProps = {
  currencyLabel: string;
  value: number;
};
const CurrencyOutput: React.FC<CurrencyOutputProps> = ({
  currencyLabel,
  value,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="min-w-[20%] text-lg font-semibold text-white-700 ">
        {currencyLabel}
      </span>
      <input
        readOnly
        type="number"
        value={value}
        className="w-full py-2 px-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {/* <span className="text-lg text-gray-700">{Num2FracStr(value)}</span> */}
    </div>
  );
};

type SwapComponentProps = {
  currency1Label: string;
  currency2Label: string;
};
export const SwapComponent: React.FC<SwapComponentProps> = ({
  currency1Label,
  currency2Label,
}) => {
  const [loading, setLoading] = useState(false);
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState(0);
  const [quote, setQuote] = useState(0);
  const { getQuote, swap } = useSwap();
  const { address } = useAccount();

  const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const { data: ETHBalance } = useBalance({
    address,
    token: WETH_ADDRESS as any,
    watch: true,
  });
  const { data: UNIBalance } = useBalance({
    address,
    token: UNI_ADDRESS,
    watch: true,
  });
  const { data: MATICBalance } = useBalance({
    address,
    token: UNI_ADDRESS as any,
    watch: true,
  });

  const onChangeAmountInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading(true);
    setInputCurrencyAmount(parseFloat(event.target.value));
    const quote = await getQuote(parseFloat(event.target.value));
    setLoading(false);
    setQuote(isNaN(quote) ? 0 : quote);
  };

  return (
    <div className="w-full flex flex-col justify-center my-10">
      <div className="grid grid-rows-4 grid-flow-col gap-1 justify-center">
        <div className="row-span-1">
          <CurrencyInput
            currencyLabel={currency1Label}
            value={inputCurrencyAmount}
            disabled={loading}
            onChange={onChangeAmountInput}
          />
        </div>
        <div className="row-span-2">
          <FontAwesomeIcon icon={faCaretDown} size="5x" className="w-full" />
        </div>
        <div className="row-span-1">
          <CurrencyOutput currencyLabel={currency2Label} value={quote} />
        </div>
      </div>

      <div className="flex justify-center w-full">
        <button
          type="button"
          onClick={async () => {
            const txn = await swap(inputCurrencyAmount);
            await txn.wait();
          }}
          className="min-w-[50%] mt-10 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-xl rounded-lg text-sm px-10 py-5 text-center mr-2 mb-2"
        >
          SWAP
        </button>
      </div>
    </div>
  );
};

const Swap = () => {
  return (
    <div className="max-w">
      <MobileHeader title="Swap" />

      <SwapComponent currency1Label="WETH" currency2Label="UNI" />
    </div>
  );
};

export default Swap;
