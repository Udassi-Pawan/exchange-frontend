import { ethers } from "ethers";
import abiCrypto from "../contracts/decentralised/exchange.json";
import abiNFT from "../contracts/decentralised/ExchangeNFT.json";
import abiToken from "../contracts/decentralised/stakeToken.json";
var hdate = require("human-date");

const networks = ["11155111", "80001"];

// "https://matic.getblock.io/04f401f9-44f5-4841-b934-71157c95af64/testnet/",

const exchangeAddressFromIdDecentralised = new Map([
  ["11155111", "0x705AfA604BB0592F103790cA78bB3E26e6E8baE2"],
  ["80001", "0xB18261A222Ef31A5e9c6933a69A027C1b92839e1"],
]);

const networkIdInHex = new Map([
  ["11155111", "0xaa36a7"],
  ["80001", "0x13881"],
  ["97", "0x61"],
]);
const nameFromId = new Map([
  ["11155111", "Sepolia"],
  ["80001", "Mumbai"],
  ["97", "BSC"],
]);
const sepoliaURL = String(process.env.REACT_APP_SEPOLIA_URL);

const JRPCFromId = new Map([
  ["11155111", sepoliaURL],
  [
    "80001",
    "https://polygon-testnet.blastapi.io/2e3e0777-ba8f-4cf1-8f77-2aac489b3274",
  ],
]);

function getSignedContractCentralised(id: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(JRPCFromId.get(id));
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromIdDecentralised.get(id)!,
    abiCrypto.abi,
    destSigner
  );
  return contract;
}

async function getSignedNftContract(id: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(JRPCFromId.get(id));
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromIdDecentralised.get(id)!,
    abiCrypto.abi,
    destSigner
  );
  const nftContractAddress = await contract.exchangeNftAddr();
  const nftContract = new ethers.Contract(
    nftContractAddress!,
    abiNFT.abi,
    destSigner
  );
  return nftContract;
}

async function getBalance(id: string) {
  const provider = new ethers.providers.JsonRpcProvider(JRPCFromId.get(id));
  return String(
    await provider.getBalance(exchangeAddressFromIdDecentralised.get(id)!)
  );
}

const getNfts = async function (curAcc: string, network: string): Promise<any> {
  let nftContract;
  const myNfts = [];
  nftContract = await getSignedNftContract(network);
  const count = Number(await nftContract?.totalSupply());
  for (let i = 0; i < count; i++) {
    try {
      let thisOwner = await nftContract.ownerOf(i);
      if (thisOwner == curAcc) {
        const nftUriLoc = await nftContract.tokenURI(i);
        let nftData = await fetch(nftUriLoc);
        nftData = await nftData.json();
        myNfts.push({ ...nftData, tokenId: i, network: network });
      }
    } catch (e) {}
  }
  return myNfts;
};

const getNftAddress = async function (chainId: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(
    JRPCFromId.get(chainId)
  );
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromIdDecentralised.get(chainId)!,
    abiCrypto.abi,
    destSigner
  );
  return await contract.exchangeNftAddr();
};

const getTokenContract = async function (chainId: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(
    JRPCFromId.get(chainId)
  );
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromIdDecentralised.get(chainId)!,
    abiCrypto.abi,
    destSigner
  );
  const tokenAddress = await contract.stakeTokenAddr();
  const tokenContract = new ethers.Contract(
    tokenAddress,
    abiToken.abi,
    destSigner
  );
  return tokenContract;
};

async function getCollateralNfts(chainId: string) {
  const nfts: any = [];
  const exchangeContract = getSignedContractCentralised(chainId);
  const num = Number(await exchangeContract.usersCount());
  for (let i = 0; i < num; i++) {
    const curUser = await exchangeContract.users(i);
    const curUserLoan = await exchangeContract.loan(curUser);
    if (!curUserLoan.set) continue;
    const curTimestamp = Math.ceil(Number(Date.now()) / 1000);
    const expiry = Number(curUserLoan.cutOffTimestamp);
    const nftContract = await getSignedNftContract(chainId);
    if (expiry < curTimestamp) {
      const nftUriLoc = await nftContract.tokenURI(curUserLoan.nftTokenId);
      let nftData = await fetch(nftUriLoc);
      nftData = await nftData.json();
      nfts.push({
        ...nftData,
        tokenId: i,
        borrower: curUser,
        price: curUserLoan.amount,
      });
    }
  }
  console.log(nfts);
  return nfts;
}

async function getLoan(address: string, chainId: string) {
  const exchangeContract = getSignedContractCentralised(chainId);
  const loan = await exchangeContract.loan(address);
  if (loan.set) return loan;
  return null;
}

async function getAccountBalances(acc: string) {
  const balances = [];
  for (let ct = 0; ct < 2; ct++) {
    const tokenContract = await getTokenContract(networks[ct]);
    balances.push(Number(await tokenContract.balanceOf(acc)));
  }
  return balances;
}

const getStakes = async function (acc: string, network: string): Promise<any> {
  const stakesArray: any = [];
  let unlocked = 0;
  // console.log(typeof network);
  network = String(network);
  const cryptoContract = getSignedContractCentralised(network);
  const stakesNumber = await cryptoContract.stakesNumber(acc);
  for (let i = 0; i < stakesNumber; i++) {
    const thisStake = await cryptoContract.stakes(acc, i);
    const timestamp = Number(thisStake[1]);
    const value = String(thisStake[0]);
    const relativeTime = timestamp - Math.floor(Date.now() / 1000);
    if (relativeTime <= 0) {
      unlocked += Number(value);
    } else {
      const prettyTime = hdate.prettyPrint(relativeTime, { showTime: true });
      stakesArray.push({ time: prettyTime, value });
    }
  }
  return [stakesArray, unlocked];
};

export default getSignedContractCentralised;
export {
  getBalance,
  exchangeAddressFromIdDecentralised,
  getSignedNftContract,
  getNfts,
  getNftAddress,
  getCollateralNfts,
  getAccountBalances,
  getLoan,
  getStakes,
  networks,
  nameFromId,
  networkIdInHex,
};
