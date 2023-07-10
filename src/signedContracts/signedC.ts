import { ethers } from "ethers";
import abiCrypto from "../contracts/exchange.json";
import abiNFT from "../contracts/ExchangeNFT.json";
import abiToken from "../contracts/stakeToken.json";
var hdate = require("human-date");

const sepoliaURL = String(process.env.REACT_APP_SEPOLIA_URL);

const networks = ["11155111", "80001", "97"];
const JRPCFromId = new Map([
  ["11155111", sepoliaURL],
  [
    "80001",
    "https://matic.getblock.io/04f401f9-44f5-4841-b934-71157c95af64/testnet/",
  ],
  ["97", "https://bsc-testnet.publicnode.com"],
]);
const exchangeAddressFromId = new Map([
  ["11155111", "0x2554eFC6bc5d6738019c02DAC274e7A1b7aDE990"],
  ["80001", "0x26595294c31126CBC60Ce34D72AB3A2f1C9E4168"],
  ["97", "0x670E9c8cb57b2C924dac907b214415C26D656693"],
]);

function getSignedContract(id: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(JRPCFromId.get(id));
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromId.get(id)!,
    abiCrypto.abi,
    destSigner
  );
  return contract;
}

async function getSignedNftContract(id: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(JRPCFromId.get(id));
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromId.get(id)!,
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
  return String(await provider.getBalance(exchangeAddressFromId.get(id)!));
}

const getNfts = async function (curAcc: string): Promise<any> {
  let nftContract;
  const myNfts = [];
  for (let ct = 0; ct < 3; ct++) {
    nftContract = await getSignedNftContract(networks[ct]);
    const count = Number(await nftContract?.totalSupply());
    for (let i = 0; i < count; i++) {
      try {
        let thisOwner = await nftContract.ownerOf(i);
        if (thisOwner == curAcc) {
          const nftUriLoc = await nftContract.tokenURI(i);
          let nftData = await fetch(nftUriLoc);
          nftData = await nftData.json();
          myNfts.push({ ...nftData, tokenId: i, network: networks[ct] });
        }
      } catch (e) {}
    }
  }
  return myNfts;
};

const getNftAddress = async function (chainId: string) {
  const JRPCprovider = new ethers.providers.JsonRpcProvider(
    JRPCFromId.get(chainId)
  );
  const destSigner = new ethers.Wallet(process.env.REACT_APP_PK!, JRPCprovider);
  const contract = new ethers.Contract(
    exchangeAddressFromId.get(chainId)!,
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
    exchangeAddressFromId.get(chainId)!,
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

async function getLoan(address: string) {
  let loan;
  let exchangeContract;
  for (let ct = 0; ct < 3; ct++) {
    exchangeContract = getSignedContract(networks[ct]);
    loan = await exchangeContract.checkLoan(address);
    if (loan.set)
      return { ...loan, loanNetwork: networks[ct], borrower: address };
  }
  return null;
}

async function getCollateralNfts() {
  const nfts: any = [];
  for (let ct = 0; ct < 2; ct++) {
    const exchangeContract = getSignedContract(networks[ct]);
    const num = Number(await exchangeContract.usersCount());
    for (let i = 0; i < num; i++) {
      const curUser = await exchangeContract.getUser(i);
      const curUserLoan = await exchangeContract.checkLoan(curUser);
      console.log(curUserLoan);
      const curTimestamp = Math.ceil(Number(Date.now()) / 1000);
      const expiry = Number(curUserLoan.cutOffTimestamp);
      const nftContract = await getSignedNftContract(curUserLoan.nftChainId);
      if (expiry < curTimestamp) {
        const nftUriLoc = await nftContract.tokenURI(curUserLoan.nftTokenId);
        let nftData = await fetch(nftUriLoc);
        nftData = await nftData.json();
        nfts.push({ ...nftData, tokenId: i, network: curUserLoan.nftChainId });
      }
    }
  }

  return nfts;
}

async function getAccountBalances(acc: string) {
  const balances = [];
  for (let ct = 0; ct < 3; ct++) {
    const tokenContract = await getTokenContract(networks[ct]);
    balances.push(Number(await tokenContract.balanceOf(acc)));
  }
  return balances;
}

const getStakes = async function (acc: string): Promise<any> {
  const stakesArray = [];
  let unlocked = [0, 0, 0];
  for (let ct = 0; ct < 3; ct++) {
    const cryptoContract = getSignedContract(networks[ct]);
    const stakesNumber = await cryptoContract.stakesNumber(acc);
    for (let i = 0; i < stakesNumber; i++) {
      const thisStake = await cryptoContract.stakes(acc, i);
      const timestamp = Number(thisStake[1]);
      const value = String(thisStake[0]);

      const relativeTime = timestamp - Math.floor(Date.now() / 1000);
      if (relativeTime <= 0) {
        unlocked[ct] += Number(value);
      } else {
        const prettyTime = hdate.prettyPrint(relativeTime, { showTime: true });
        stakesArray.push({ time: prettyTime, value, network: networks[ct] });
      }
    }
  }
  return [stakesArray, unlocked];
};

export default getSignedContract;
export {
  getBalance,
  exchangeAddressFromId,
  getSignedNftContract,
  getNfts,
  getNftAddress,
  getLoan,
  getCollateralNfts,
  getAccountBalances,
  getStakes,
  networks,
};
