import { Box, Button, Grid, Input, Stack, Typography } from "@mui/material";
import { getNfts, getLoan } from "../../signedContracts/signedC";
import abiNFT from "../../contracts/decentralised/ExchangeNFT.json";

import abiExchange from "../../contracts/decentralised/exchange.json";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { exchangeAddressFromId } from "../../signedContracts/signedC";
import { useTheme } from "@mui/material/styles";

import NftCard from "../../components/NftCard";
let provider: any;
let exchangeContract: any;
let nftContract: any;

export default function Loan() {
  const theme = useTheme();
  const nftTokenId = useRef<HTMLInputElement>(null);
  const loanAmount = useRef<HTMLInputElement>(null);
  const loanPeriod = useRef<HTMLInputElement>(null);
  const [acc, setAcc] = useState<string | null>(null);
  const [loan, setLoan] = useState<any>(null);
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

  const accessHandler = async function () {
    const tx = await nftContract.setApprovalForAll(
      exchangeContract.address,
      true
    );
    console.log(await tx.wait());
  };
  const getLoanHandler = async function () {
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

  return (
    <Stack alignItems={"center"}>
      {!loan && (
        <Stack alignItems={"center"}>
          <Stack>
            <Grid container sx={{ m: 2 }} gap={2}>
              {myNfts?.map((i) => (
                <Grid item key={i.image}>
                  <NftCard
                    image={i.image}
                    desc={i.description}
                    name={i.name}
                    itemId={i.tokenId}
                  ></NftCard>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Stack direction={"row"} spacing={2}>
            <Input inputRef={nftTokenId} placeholder="nft itemId"></Input>
            <Input inputRef={loanAmount} placeholder="loan amount"></Input>
            <Input inputRef={loanPeriod} placeholder="loan period"></Input>
            <Button onClick={accessHandler}>Approve Access</Button>
            <Button onClick={getLoanHandler}>getLoan</Button>
          </Stack>
        </Stack>
      )}
      {loan && (
        <Stack alignItems="center" spacing={6} m={5}>
          <Stack alignItems={"center"} spacing={2}>
            <Typography>
              <b> Loan Amount :</b> {String(loan.amount)}
            </Typography>
            <Typography>
              <b>Collateral nft TokenId : </b>
              {String(loan.nftTokenId)}
            </Typography>
            <Typography>
              <b>Cutoff time : </b>
              {String(new Date(Number(loan.cutOffTimestamp) * 1000))}
            </Typography>
          </Stack>
          <Button
            sx={{
              backgroundColor: theme.palette.primary.main,
            }}
            variant="contained"
            onClick={returnHandler}
          >
            ReturnLoan
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
