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


const response = await fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=USD&api_key='+cryptoCompareAPIKey);
const data = await response.json();

console.log("CC RESPONSE:    " + JSON.stringify(data));

// var options = {
//   "method": "GET",
//   "hostname": "rest.coinapi.io",
//   "path": "/v1/exchangerate/BTC?invert=false",
//   "headers": {'X-CoinAPI-Key': '56A2C0BC-181A-4DD7-8FC3-697B3C2EBD21'}
// };
//
// var request = https.request(options, function (response) {
//   var chunks = [];
//   response.on("data", function (chunk) {
//     chunks.push(chunk);
//   });
// });
//
// console.log("RESPONSE:    " + JSON.stringify(request));
// request.end();

// const messariApiKey = '714fc350-9b4c-4e0c-bd79-916849342ec3'
// const response = https
//     .request(
//         {
//           host: "data.messari.io",
//           path: "/api/v1/assets/btc",
//           headers: { "x-messari-api-key": messariApiKey },
//         },
//         function (response) {
//           let str = "";
//           response.on("data", (chunk) => (str += chunk));
//           response.on("end", () => console.log(JSON.parse(str)));
//         }
//     )
//     .end();
//
// console.log("Messari RESPONSE:    " + JSON.stringify(response));




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
