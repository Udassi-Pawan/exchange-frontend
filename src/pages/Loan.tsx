import { Box, Button, Input, Typography } from "@mui/material";
import {
  getSignedNftContract,
  getNfts,
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
let exchangeContract: any;
let nftContract: any;

export default function Loan() {
  const nftTokenId = useRef<HTMLInputElement>(null);
  const collateralTokenId = useRef<HTMLInputElement>(null);
  const collateralPrice = useRef<HTMLInputElement>(null);
  const loanAmount = useRef<HTMLInputElement>(null);
  const loanPeriod = useRef<HTMLInputElement>(null);
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [loan, setLoan] = useState<any>(null);
  const [collateralNfts, setCollateralNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: Number;
          borrower: string;
          price: string;
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
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      const signer = await provider.getSigner();
      exchangeContract = new ethers.Contract(
        exchangeAddressFromId.get(chainIdString)!,
        abiExchange.abi,
        signer
      );
      const nftContractAddress = await exchangeContract.exchangeNftAddr();
      nftContract = new ethers.Contract(
        nftContractAddress!,
        abiNFT.abi,
        signer
      );

      if (acc) {
        setLoan(await getLoan(acc, chainIdString));
        setMyNfts(await getNfts(acc!));
      }
    })();
  }, [acc]);
  useEffect(() => {
    (async function () {
      if (chainId) setCollateralNfts(await getCollateralNfts(chainId));
    })();
  }, [chainId]);

  const accessHandler = async function () {
    const tx = await nftContract.setApprovalForAll(
      exchangeContract.address,
      true
    );
    console.log(await tx.wait());
  };
  const getLoanHandler = async function () {
    // await window.ethereum.request({
    //   method: "wallet_switchEthereumChain",
    //   params: [
    //     {
    //       chainId:
    //         "0x" + String(Number(nftNetwork.current!.value).toString(16)),
    //     },
    //   ],
    // });
    const tx = await exchangeContract.getLoan(
      loanAmount.current!.value,
      loanPeriod.current!.value,
      nftTokenId.current!.value
    );
    console.log(await tx.wait());
  };

  const returnHandler = async function () {
    const amount = String(loan.amount);
    console.log(amount);
    const tx = await exchangeContract.returnLoan({ value: amount });
  };
  const getCollateralHandler = async function () {
    console.log(collateralTokenId.current!.value);
    const tx = await exchangeContract.buyCollateralNft(
      collateralTokenId.current!.value,
      { value: collateralPrice.current!.value }
    );
    // console.log(await tx.wait());
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
      {/* <Balance /> */}
      {loan != null && (
        <Box>
          <Typography>amount : {String(loan.amount)}</Typography>
          <Typography>nftTokenId : {String(loan.nftTokenId)}</Typography>
          <Typography>
            expiry : {String(new Date(Number(loan.cutOffTimestamp) * 1000))}
          </Typography>
        </Box>
      )}
      <Box>
        <Input inputRef={nftTokenId} placeholder="nft token Id"></Input>
        <Input inputRef={loanAmount} placeholder="loan amount"></Input>
        <Input inputRef={loanPeriod} placeholder="loan period"></Input>
        <Button onClick={accessHandler}>Approve Access</Button>
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
            <p> borrower: {i.borrower}</p>
            <p> price: {String(i.price)}</p>
            <img style={{ height: "200px" }} src={i.image}></img>
          </div>
        ))}
      </div>
      <Box>
        <Input inputRef={collateralTokenId} placeholder="borrower"></Input>
        <Input inputRef={collateralPrice} placeholder="amount"></Input>
        <Button onClick={getCollateralHandler}>Get Collateral NFT</Button>
      </Box>
    </Box>
  );
}
