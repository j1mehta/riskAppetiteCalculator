// Setup: npm install alchemy-sdk
import { Alchemy, Network } from "alchemy-sdk";
import fetch from 'node-fetch';
import * as https from 'https';

const config = {
  apiKey: "mZ_9bUQbJiMBHbX-oRYGQz4nL4ff2M0H",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const cryptoCompareAPIKey = "318137a74abd9b3d645c6f73753fcec5378cbc367dd0b94f0147be390bd3f4f7";

const cryptoSymbol = 'ETH'

const response = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms='+cryptoSymbol+'&tsyms=USD&api_key='+cryptoCompareAPIKey);
const data = await response.json();

console.log("CC RESPONSE:    " + data[cryptoSymbol]["USD"]);

// this works
// console.log("CC RESPONSE:    " + data.ETH.USD);

const main = async () => {
  // Wallet address
  const address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

  // Get token balances
  const balances = await alchemy.core.getTokenBalances(address);

  // Remove tokens with zero balance
  const nonZeroBalances = balances.tokenBalances.filter((token) => {
    return token.tokenBalance !== "0";
  });

  console.log(`Token balances of ${address} \n`);

  // Counter for SNo of final output
  let i = 1;


  // Loop through all tokens with non-zero balance
  for (let token of nonZeroBalances) {
    // Get balance of token
    let balance = token.tokenBalance;

    // Get metadata of token
    const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

    // Compute token balance in human-readable format
    balance = balance / Math.pow(10, metadata.decimals);
    balance = balance.toFixed(2);

    // Print name, balance, and symbol of token
    if (balance != 0)
      console.log(`${i++}. ${metadata.name}: ${balance} ${metadata.symbol}`);
  }
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
