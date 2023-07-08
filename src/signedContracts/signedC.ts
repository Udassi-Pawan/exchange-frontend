import { ethers } from "ethers";
import abiCrypto from "../contracts/exchange.json";
import abiNFT from "../contracts/ExchangeNFT.json";
import { utils } from "ethers";

const sepoliaURL = String(process.env.REACT_APP_SEPOLIA_URL);

const networks = ["11155111", "80001", "97"];
const blocks = [3843400, 37631257, 29756066];
const JRPCFromId = new Map([
  ["11155111", sepoliaURL],
  [
    "80001",
    "https://matic.getblock.io/04f401f9-44f5-4841-b934-71157c95af64/testnet/",
  ],
  ["97", "https://bsc-testnet.publicnode.com"],
]);
const exchangeAddressFromId = new Map([
  ["11155111", "0x99D04D8a8CC1b74012A8Fd6A157470F404365786"],
  ["80001", "0xAF9D4F5d7896eB420451Cd89832a1ea152651058"],
  ["97", "0x670E9c8cb57b2C924dac907b214415C26D656693"],
]);

let sepoliaSigned, mumbaiSigned, bscSigned;

const ids = ["11155111", "80001", "97"];

const signedContracts: any = [];

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

export default getSignedContract;
export {
  sepoliaSigned,
  mumbaiSigned,
  bscSigned,
  getBalance,
  exchangeAddressFromId,
  getSignedNftContract,
  getNfts,
  getNftAddress,
  getLoan,
  getCollateralNfts,
};
