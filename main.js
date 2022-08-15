// Setup: npm install alchemy-sdk
import { Alchemy, Network } from "alchemy-sdk";
import fetch from 'node-fetch';

const config = {
  apiKey: "mZ_9bUQbJiMBHbX-oRYGQz4nL4ff2M0H",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const cryptoCompareAPIKey = "318137a74abd9b3d645c6f73753fcec5378cbc367dd0b94f0147be390bd3f4f7";

const safeTokenList = ['USDC', 'USDC', 'DAI', 'ETH', 'BUSD', 'SHIB', 'HEX','STETH','WBTC','FTT','OKB','LEO','LINK','UNI','CRO','APE','MANA','SAND','QNT','AAVE']
const moderateTokenList = ['LDO','CEL','FRAX','CRI','AXS','1INCH','TUSD','CUSDC','KCS','CETH','GRT','MKR','SNX','USDP','CDAI','HBTC',
  'BTSE','GT','CRV','ELG','BAT','ENJ','AMP','PAXG','LRC','NEXO','GALA','TKX','GNO','CUSDT']



// this works
// console.log("CC RESPONSE:    " + data.ETH.USD);

async function getTokenPrice(metadata) {
  // Get crypto token price
  console.log("SYMBOL: " + metadata.symbol)
  const cryptoSymbol = metadata.symbol
  const apiPath = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + cryptoSymbol + '&tsyms=USD&api_key=' + cryptoCompareAPIKey
  const response = await fetch(apiPath);
  const data = await response.json();
  console.log("Price of " + cryptoSymbol + " " + data[cryptoSymbol]["USD"]);
  return data[cryptoSymbol]["USD"];
}

async function getNoOfTokensInWallet(token) {
  let noOfTokensInWallet = token.tokenBalance;

  // Get metadata of token
  const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);


  // Compute token balance in human-readable format
  noOfTokensInWallet = noOfTokensInWallet / Math.pow(10, metadata.decimals);
  noOfTokensInWallet = noOfTokensInWallet.toFixed(2);
  return {noOfTokensInWallet, metadata};
}

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
  let totalWalletBalance = 0;
  let safeTokenBalance = 0;
  let moderateTokenBalance = 0;
  let shitCoinBalance = 0;

  // Loop through all tokens with non-zero balance
  for (let token of nonZeroBalances) {
    // Get balance of token
    let {noOfTokensInWallet, metadata} = await getNoOfTokensInWallet(token);

    // Print name, balance, and symbol of token
    if (noOfTokensInWallet != 0) {

      console.log(`${i++}. ${metadata.name}: ${noOfTokensInWallet} ${metadata.symbol}`);

      try {
        const tokenPrice = await getTokenPrice(metadata);
        // Update wallet balance
        totalWalletBalance += noOfTokensInWallet * tokenPrice

        if(safeTokenList.includes(metadata.symbol.toString())) {
          // console.log("Updating safeTokenBalance: " + safeTokenBalance)
          safeTokenBalance += noOfTokensInWallet * tokenPrice
        } else if(moderateTokenList.includes(metadata.symbol.toString())) {
          // console.log("Updating moderateTokenBalance: " + moderateTokenBalance)
          moderateTokenBalance += noOfTokensInWallet * tokenPrice
        } else {
          // console.log("Updating shitCoinBalance: " + shitCoinBalance)
          shitCoinBalance += noOfTokensInWallet * tokenPrice;
        }

      } catch (error) {
        console.log(error)
      }
      console.log("\n")
    }
  }

  totalWalletBalance = totalWalletBalance.toFixed(2)
  let safePercent = (safeTokenBalance/totalWalletBalance * 100).toFixed(2);
  let moderatePercent = (moderateTokenBalance/totalWalletBalance * 100).toFixed(2);
  let aggressivePercent = (shitCoinBalance/totalWalletBalance * 100).toFixed(2);

//   console.log(" totalWalletBalance: " + totalWalletBalance +
//       " safeTokenBalance: " + safeTokenBalance +
//       " moderateTokenBalance: " + moderateTokenBalance +
//       "shitCoinBalance: " + shitCoinBalance
//   );
//   console.log(" totalWalletBalance: " + totalWalletBalance +
//               " safePercent: " + safePercent +
//               " moderatePercent: " + moderatePercent +
//               "aggressivePercent: " + aggressivePercent
// );

  const allBalances = [["Total Wallet Balance (USD)", totalWalletBalance],
    ["Total Value in Safe Assets (USD)", safeTokenBalance.toFixed(2)],
    ["Total Value in Moderate Assets (USD)", moderateTokenBalance.toFixed(2)],
    ["Total Value in Aggressive Assets (USD)", shitCoinBalance.toFixed(2)]
  ]
  const percentages = [["Safe Asset Percentage", safePercent],
    ["Moderate Asset Percentage", moderatePercent],
    ["Aggressive Asset Percentage", aggressivePercent]]

  console.table(allBalances);
  console.table(percentages);

  console.log("==================VERDICT==================")

  if (safePercent > moderatePercent && safePercent > aggressivePercent) {
    console.table(["RISK APPETITE: SAFE"])
  } else if (moderatePercent > safePercent && moderatePercent > aggressivePercent) {
    console.table(["RISK APPETITE: MODERATE"])
  } else {
    console.table(["RISK APPETITE: AGGRESSIVE"])
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
