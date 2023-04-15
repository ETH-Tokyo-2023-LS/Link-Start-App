import React, { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";

import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import ISwapRouterABI from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";
import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";

import { Token } from "@uniswap/sdk-core";
import { Pool, tickToPrice, Route } from "@uniswap/v3-sdk";
import { useRouter } from "next/router";
import { UNI_V3_FACTORY_ADDRESS } from "@/constants/adfress";
import {
  MATIC_ADDRESS,
  MATIC_DECIMALS,
  MATIC_NAME,
  MATIC_SYMBOL,
  USDC_ADDRESS,
  USDC_DECIMALS,
  USDC_NAME,
  USDC_SYMBOL,
} from "@/constants/token";
import { MUMBAI_CHAIN_ID } from "@/constants/chain";

const swapRouterABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOutMinimum",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "exactInputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

const Content = () => {
  const router = useRouter();
  const { content } = router.query;

  return (
    <div>
      <p>Content: {content}</p>
      <UniswapV3 />
    </div>
  );
};

const UniswapV3 = () => {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();
  // const [provider, setProvider] = useState<ethers.Wallet>();
  // const [signer, setSigner] = useState<ethers.Wallet>();

  // const [weth, setWeth] = useState<Token>();
  const [matic, setMatic] = useState<Token>();
  const [usdc, setUsdc] = useState<Token>();
  const [user, setUser] = useState<ethers.Wallet>();

  useEffect(() => {
    const init = async () => {
      const _provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_POLYGON_TESTNET_PROVIDER_URL
        // "https://mainnet.infura.io/v3/2527be597dfa4f5bb7555d0e59367c4c"
      );
      setProvider(_provider);
      setUser(
        new ethers.Wallet(
          process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY as string
          // _provider
        )
      );

      // wallet address
      // const _signer = new ethers.Wallet(
      //   "0x43291166a6ae98bfd0dc8ec21ca3d3514c4ef529e50b9a7889f42729e5e1698e",
      //   _provider
      // );
      // setProvider(_signer);
      // setSigner(_signer);

      // const _weth = new Token(
      //   MUMBAI_CHAIN_ID,
      //   WETH_ADDRESS,
      //   WETH_DECIMALS,
      //   WETH_SYMBOL,
      //   WETH_NAME
      // );
      // setWeth(_weth);

      const _matic = new Token(
        MUMBAI_CHAIN_ID,
        MATIC_ADDRESS,
        MATIC_DECIMALS,
        MATIC_SYMBOL,
        MATIC_NAME
      );
      setMatic(_matic);

      const _usdc = new Token(
        MUMBAI_CHAIN_ID,
        USDC_ADDRESS,
        USDC_DECIMALS,
        USDC_SYMBOL,
        USDC_NAME
      );
      setUsdc(_usdc);
    };

    init();
  }, []);

  const getTrade = async () => {
    // if (!provider || !weth || !usdc || !user) return;
    if (!provider || !matic || !usdc || !user) return;

    const uniV3FactoryABI = [
      "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
    ];
    const uniV3Factory = new ethers.Contract(
      UNI_V3_FACTORY_ADDRESS,
      uniV3FactoryABI,
      provider
    );

    const uniV3PoolAddress = await uniV3Factory.getPool(
      // WETH_ADDRESS,
      USDC_ADDRESS,
      MATIC_ADDRESS,
      3000
    );

    console.log({ uniV3PoolAddress });

    const uniV3PoolContract = new ethers.Contract(
      uniV3PoolAddress,
      IUniswapV3PoolABI.abi,
      // [
      //   "function swapExactInputSingle(uint amountIn, uint amountOutMinimum, address tokenIn, address tokenOut, uint24 fee, address recipient, uint deadline) external returns (uint amountOut)",
      //   "function fee() external view returns (uint24)",
      // ],
      provider
    );

    const [token0address, token1address, fee, liquidity, slot] =
      await Promise.all([
        uniV3PoolContract.token0(),
        uniV3PoolContract.token1(),
        uniV3PoolContract.fee(),
        uniV3PoolContract.liquidity(),
        uniV3PoolContract.slot0(),
      ]);

    const pool = new Pool(
      // weth,
      matic,
      usdc,
      fee,
      slot[0].toString(),
      liquidity.toString(),
      slot[1]
    );
    const currentAmount = Number(pool.token0Price.toSignificant(10));
    console.log({ currentAmount });

    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
    const swapRouterContract = new ethers.Contract(
      swapRouterAddress,
      swapRouterABI,
      // ISwapRouterABI.abi,
      provider
    );

    const tokenContract0 = new ethers.Contract(
      USDC_ADDRESS,
      // WETH_ADDRESS,
      IUniswapV2ERC20.abi,
      provider
    );

    const amountIn = ethers.utils.parseUnits("100", USDC_DECIMALS);
    const amountOutMinimum = ethers.utils.parseUnits("1", MATIC_DECIMALS);
    // const swapArgs = [
    //   USDC_ADDRESS, // tokenIn
    //   MATIC_ADDRESS, // tokenOut
    //   3000, // 0.3% fee
    //   user.address, // recipient
    //   Math.floor(Date.now() / 1000) + 60 * 10, // deadline
    //   amountIn, // amountIn
    //   amountOutMinimum, //amountOutMinimum
    //   0, //sqrtPriceLimitX96
    // ];

    const swapArgs = [
      USDC_ADDRESS,
      MATIC_ADDRESS,
      3000, // 0.3% fee
      amountIn,
      amountOutMinimum,
      user.address,
      Math.floor(Date.now() / 1000) + 60 * 10,
    ];

    const gasPrice = ethers.utils.parseUnits("1", "gwei");
    // const gasPrice = await user.provider.getGasPrice();
    // const finalGasPrice = gasPrice * functionGasFees;

    const tx = await swapRouterContract.populateTransaction.exactInputSingle(
      ...swapArgs,
      { gasPrice }
    );
    console.log(tx);
    // const approvalResponse = await tokenContract0
    //   .connect(user)
    //   .approve(swapRouterAddress, amountIn);
    // console.log(approvalResponse);
    const gasLimit = await user.provider.estimateGas(tx);
    console.log({ gasLimit });

    const nonce = await user.getTransactionCount("latest");
    const signedTx = await user.signTransaction({
      nonce,
      gasPrice,
      gasLimit,
      to: swapRouterAddress,
      value: ethers.utils.parseUnits("0", MATIC_DECIMALS),
      data: tx.data,
    });

    const txResponse = await user.provider.sendTransaction;
    console.log({ txResponse });

    // // ここは本来入力
    // const price = 100;
    // const inputAmount = price * 1.01;

    // const amountOut = ethers.utils.parseUnits(
    //   inputAmount.toString(),
    //   MATIC_DECIMALS
    //   // WETH_DECIMALS
    // );

    // // const eth = await showPrice(inputAmount);
    // const amountInMaximum =
    //   Math.floor(inputAmount * 1.1).toString() + "000000000000000000";

    // console.log({ amountInMaximum });

    // console.log({ amountOut, amountInMaximum });

    // const params = {
    //   tokenIn: token0address,
    //   tokenOut: token1address,
    //   fee: fee,
    //   recipient: await user.getAddress(),
    //   deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    //   amountOut: amountOut,
    //   amountInMaximum: BigNumber.from(amountInMaximum),
    //   sqrtPriceLimitX96: 0,
    // };

    // const transaction = await swapRouterContract
    //   .connect(user)
    //   .exactOutputSingle(params, {
    //     gasLimit: ethers.utils.hexlify(2000000),
    //   });

    // console.log({ transaction });

    return;

    // const amountOutMinimum = 0;
    // const feeInBPS = (fee / 10000) * 100;

    // const recipient = user.address;
    // const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    // const amountOut = await uniV3PoolContract.swapExactInputSingle(
    //   ethers.utils.parseUnits("0.01", 6), // Convert to 6 decimal places
    //   amountOutMinimum,
    //   USDC_ADDRESS,
    //   WETH_ADDRESS,
    //   fee,
    //   recipient,
    //   deadline
    // );
  };

  return (
    <div>
      <h1>Uniswap V3 Polygon Mumbai Testnet Demo</h1>
      <button onClick={getTrade}>Swap WETH for USDC</button>
    </div>
  );
};

export default Content;
