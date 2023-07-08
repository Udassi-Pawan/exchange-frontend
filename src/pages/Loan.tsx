import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import getSignedContract, {
  getSignedNftContract,
  getNfts,
  getBalance,
  getNftAddress,
  getLoan,
  getCollateralNfts,
} from "../signedContracts/signedC";
import abiNFT from "../contracts/ExchangeNFT.json";
import abiExchange from "../contracts/exchange.json";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import Balance from "../components/Balance";
import { exchangeAddressFromId } from "../signedContracts/signedC";
let provider: any;

export default function Loan() {
  const nftTokenId = useRef<HTMLInputElement>(null);
  const collateralTokenId = useRef<HTMLInputElement>(null);
  const nftNetwork = useRef<HTMLInputElement>(null);
  const collateralNetwork = useRef<HTMLInputElement>(null);
  const loanNetwork = useRef<HTMLInputElement>(null);
  const loanAmount = useRef<HTMLInputElement>(null);
  const loanPeriod = useRef<HTMLInputElement>(null);
  const [acc, setAcc] = useState<string | null>(null);
  const [loan, setLoan] = useState<any>(null);
  const [collateralNfts, setCollateralNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: Number;
          network: string;
        }
      ]
    | null
  >(null);
  const [myNfts, setMyNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: Number;
          network: string;
        }
      ]
    | null
  >(null);
  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      setAcc((await provider.listAccounts())[0]);
      if (acc) {
        setLoan(await getLoan(acc));
        setMyNfts(await getNfts(acc!));
      }
    })();
  }, [acc]);
  useEffect(() => {
    (async function () {
      setCollateralNfts(await getCollateralNfts());
    })();
  }, []);

  const getLoanHandler = async function () {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId:
            "0x" + String(Number(nftNetwork.current!.value).toString(16)),
        },
      ],
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContractAddress = await getNftAddress(nftNetwork.current!.value);
    const nftContract = new ethers.Contract(
      nftContractAddress,
      abiNFT.abi,
      signer
    );
    const exchangeContract = getSignedContract(loanNetwork.current!.value);

    const transTx = await nftContract.transferFrom(
      acc,
      "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
      nftTokenId.current!.value
    );
    const recTransTx = await transTx.wait();
    console.log(recTransTx);
    const getLoanTx = await exchangeContract.getLoan(
      acc,
      loanAmount.current!.value,
      loanPeriod.current!.value,
      nftNetwork.current!.value,
      nftTokenId.current!.value
    );
    const recGetLoanTx = await getLoanTx.wait();
    console.log(recGetLoanTx);
  };

  const returnHandler = async function () {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const exchangeContract = new ethers.Contract(
      exchangeAddressFromId.get(loan.loanNetwork)!,
      abiExchange.abi,
      signer
    );
    const nftContract = await getSignedNftContract(loan.nftChainId);
    const _nftTokenId = loan.nftTokenId;
    const _borrower = loan.borrower;
    const returnTx = await exchangeContract.returnLoan({ value: loan.amount });
    const recReturnTx = await returnTx.wait();
    console.log(recReturnTx);
    const nftTransTx = await nftContract.transferFrom(
      "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
      _borrower,
      _nftTokenId
    );
    const recNftTransTx = await nftTransTx.wait();
    console.log(recNftTransTx);
  };
  const getCollateralHandler = async function () {
    const nftContract = await getSignedNftContract(
      collateralNetwork.current!.value
    );
    const nftTransTx = await nftContract.transferFrom(
      "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
      acc,
      collateralTokenId.current!.value
    );
    const recTx = await nftTransTx.wait();
    console.log(recTx);
  };
  return (
    <Box>
      <div style={{ display: "flex", gap: "1rem" }}>
        {myNfts?.map((i) => (
          <div key={i.image}>
            <p>name : {i.name}</p>
            <p>tokenId : {String(i.tokenId)}</p>
            <p> description: {i.description}</p>
            <p> network: {i.network}</p>
            <img style={{ height: "200px" }} src={i.image}></img>
          </div>
        ))}
      </div>
      <Balance />
      {loan != null && (
        <Box>
          <Typography>amount : {String(loan.amount)}</Typography>
          <Typography>nftChainId : {loan.nftChainId}</Typography>
          <Typography>nftTokenId : {loan.nftTokenId}</Typography>
          <Typography>
            expiry : {String(new Date(Number(loan.cutOffTimestamp) * 1000))}
          </Typography>
        </Box>
      )}
      <Box>
        <Input inputRef={nftTokenId} placeholder="nft token Id"></Input>

        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel>nft Network</InputLabel>
          <Select inputRef={nftNetwork}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel>loan Network</InputLabel>

          <Select inputRef={loanNetwork}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>

        <Input inputRef={loanAmount} placeholder="loan amount"></Input>
        <Input inputRef={loanPeriod} placeholder="loan period"></Input>
        <Button onClick={getLoanHandler}>getLoan</Button>
      </Box>
      <Box>
        <Button onClick={returnHandler}>ReturnLoan</Button>
      </Box>
      <div style={{ display: "flex", gap: "1rem" }}>
        {collateralNfts?.map((i) => (
          <div key={i.image}>
            <p>name : {i.name}</p>
            <p>tokenId : {String(i.tokenId)}</p>
            <p> description: {i.description}</p>
            <p> network: {i.network}</p>
            <img style={{ height: "200px" }} src={i.image}></img>
          </div>
        ))}
      </div>
      <Box>
        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel>nft Network</InputLabel>
          <Select inputRef={collateralNetwork}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <Input inputRef={collateralTokenId} placeholder="tokenId"></Input>
        <Button onClick={getCollateralHandler}>Get Collateral NFT</Button>
      </Box>
    </Box>
  );
}
