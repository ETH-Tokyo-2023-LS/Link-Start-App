import { useChainId, useContract, useProvider } from "wagmi";
import IUniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import {
  MATIC_ADDRESS,
  MATIC_DECIMALS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/constants/token";
import { ethers } from "ethers";
import { UNI_V3_FACTORY_ADDRESS } from "@/constants/adfress";
import React, { useState } from "react";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import { MobileHeader } from "@/components/MobileHeader";
import { Num2FracStr } from "@/utils/num2FracStr";

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

  const matic_usdc_PoolAddress: string = await uniV3Factory.getPool(
    // WETH_ADDRESS,
    USDC_ADDRESS,
    MATIC_ADDRESS,
    3000
  );
  setPoolAddress(matic_usdc_PoolAddress);

  return poolAddress;
};

const Swap = () => {
  return (
    <div className="max-w">
      <MobileHeader title="Swap" />
      <SwapComponent currency1Label="USDC" currency2Label="MATIC" />
    </div>
  );
};

const useSwap = () => {
  // const poolAddress = await usePoolAddress();
  const chainId = useChainId();
  const provider = useProvider();
  const poolContract = useContract({
    // address: poolAddress,
    address: "0x6253893781bB011C4b9C114C2835603ab49F0767", // usdc-matic
    abi: IUniswapV3PoolArtifact.abi,
    signerOrProvider: provider,
  });

  const getPoolImmutables = async () => {
    if (!poolContract)
      throw new Error("Pool contract has not been initialized");

    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);
    console.log({ token0, token1 });

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

  const getQuote = async (amount: number) => {
    const [immutables, state] = await Promise.all([
      getPoolImmutables(),
      getPoolState(),
    ]);

    const tokenA = new Token(chainId, immutables.token0, USDC_DECIMALS);
    const tokenB = new Token(chainId, immutables.token1, MATIC_DECIMALS);

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

  return { getQuote };
};

type CurrencyInputProps = {
  currencyLabel: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencyLabel,
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg font-semibold text-gray-700">
        {currencyLabel}
      </span>
      <input
        type="number"
        value={value}
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
      <span className="text-lg font-semibold text-gray-700">
        {currencyLabel}
      </span>
      <span className="text-lg text-gray-700">{Num2FracStr(value)}</span>
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
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState(0);
  const [quote, setQuote] = useState(0);
  const { getQuote } = useSwap();

  const onChangeAmountInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInputCurrencyAmount(parseFloat(event.target.value));
    const quote = await getQuote(parseFloat(event.target.value));
    setQuote(quote);
  };

  return (
    <div className="space-y-4">
      <CurrencyInput
        currencyLabel={currency1Label}
        value={inputCurrencyAmount}
        onChange={onChangeAmountInput}
      />
      <CurrencyOutput currencyLabel={currency2Label} value={quote} />
    </div>
  );
};

export default Swap;
