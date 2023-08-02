import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  getSignedContract,
  getSignedNftContract,
  getNfts,
  getLoan,
  getBalance,
} from "../../signedContracts/scriptsCentralised";
import { useTheme } from "@mui/material/styles";

import abiExchange from "../../contracts/centralised/exchange.json";
import { useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { exchangeAddressFromIdCentralised } from "../../signedContracts/scriptsCentralised";
import NftCardCentralised from "../../components/NftCardCentralised";
import ContractBalancesCentralised from "../../components/ContractBalancesCentralised";
import { MyContext } from "../../MyContext";
import { Link } from "react-router-dom";
import { nameFromId } from "../../signedContracts/scriptsDecentralised";

const signedExchangeContract = getSignedContract("80001");

const checkIdentity = async function (acc: string) {
  const identity = await signedExchangeContract.checkIdentity(acc);
  return identity;
};
export default function Loan() {
  const theme = useTheme();
  const {
    acc,
    nftContractCentralised,
    changeNetworkEvent,
    setLoading,
    setDialogueText,
  } = useContext(MyContext);
  const nftTokenId = useRef<HTMLInputElement>(null);
  const [creditScore, setCreditScore] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const nftNetwork = useRef<HTMLInputElement>(null);
  const loanNetwork = useRef<HTMLInputElement>(null);
  const loanAmount = useRef<HTMLInputElement>(null);
  const loanPeriod = useRef<HTMLInputElement>(null);
  const [loan, setLoan] = useState<any>("loading");
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
    | []
  >(null);
  useEffect(() => {
    (async function () {
      if (acc) {
        const identity = await checkIdentity(acc!);
        setCreditScore(String(identity.creditScore));
        setName(identity.name);
        setMyNfts(await getNfts(acc!));
        setLoan(await getLoan(acc));
      }
    })();
    return () => {
      // setLoan("loading");
      // setMyNfts(null);
      // setCreditScore(null);
      // setName(null);
    };
  }, [acc]);

  const getLoanHandler = async function () {
    setLoading(true);
    try {
      if (Number(loanPeriod.current!.value) > 3600) {
        setDialogueText(`Loan period should be less than 3600s.`);
        return setLoading();
      }
      if (Number(loanAmount.current!.value) >= 20 * Number(creditScore)) {
        setDialogueText(
          `Loan amount should be less than ${
            20 * Number(creditScore)
          } as per your credit score.`
        );
        return setLoading();
      }
      if (
        Number(loanAmount.current!.value) >
        Number(await getBalance(loanNetwork.current!.value))
      ) {
        setDialogueText(
          "Not enough funds for loan available. Please try again later."
        );
        return setLoading();
      }
      const exchangeContract = getSignedContract(loanNetwork.current!.value);
      const transTx = await nftContractCentralised.transferFrom(
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
    } catch (e) {
      setDialogueText("Loan credit transaction failed.");
    }
    setLoading();
    setLoan("loading");
    setLoan(await getLoan(acc));
  };

  const returnHandler = async function () {
    setLoading(true);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x" + String(Number(loan.loanNetwork).toString(16)),
          },
        ],
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const exchangeContract = new ethers.Contract(
        exchangeAddressFromIdCentralised.get(loan.loanNetwork)!,
        abiExchange.abi,
        signer
      );
      const nftContractCentralised = await getSignedNftContract(
        loan.nftChainId
      );
      const _nftTokenId = loan.nftTokenId;
      const _borrower = loan.borrower;
      const returnTx = await exchangeContract.returnLoan({
        value: loan.amount,
      });
      const recReturnTx = await returnTx.wait();
      console.log(recReturnTx);
      const nftTransTx = await nftContractCentralised.transferFrom(
        "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
        _borrower,
        _nftTokenId
      );
      const recNftTransTx = await nftTransTx.wait();
      console.log(recNftTransTx);
      setLoan(await getLoan(acc!));
      setMyNfts(await getNfts(acc!));
    } catch (e) {
      setDialogueText("Loan return transaction failed.");
    }
    setLoading();
  };

  return (
    <Stack mt={5} alignItems={"center"}>
      {loan == "loading" && (
        <Typography mt={5} variant="h3">
          Getting Loan details ...
        </Typography>
      )}

      {loan == null && (
        <Stack alignItems={"center"}>
          {name == null && (
            <Typography mt={5} variant="h3">
              Getting KYC Status ...
            </Typography>
          )}
          {name == "" && (
            <Typography variant="h3">
              Please complete KYC <Link to="/centralised/kyc">here</Link> to be
              eligible for Loan.
            </Typography>
          )}

          {myNfts == null && (
            <Typography mt={5} variant="h3">
              Getting NFT details ...
            </Typography>
          )}
          {myNfts != null && myNfts.length == 0 && (
            <Typography variant={"h3"} sx={{ mt: 8 }}>
              <Link to="/centralised/nft">Get</Link> an NFT to stake as
              collateral for Loan.
            </Typography>
          )}
        </Stack>
      )}

      {name != null &&
        loan == null &&
        name != "" &&
        myNfts != null &&
        myNfts?.length != 0 && (
          <Stack mb={6} alignItems={"center"} spacing={6}>
            <ContractBalancesCentralised />
            <Stack spacing={2} alignItems={"center"}>
              <Typography>
                Please choose an NFT to stake as collateral for loan.
              </Typography>
              <Typography>
                You are eligible for {20 * Number(creditScore)} wei of Loan
                amount as per your credit score of {creditScore}
              </Typography>
            </Stack>

            <Stack>
              {myNfts?.map((i) => (
                <NftCardCentralised
                  image={i.image}
                  name={i.name}
                  itemId={i.tokenId}
                  network={i.network}
                  desc={i.description}
                  key={i.image}
                />
              ))}
            </Stack>
            <Stack direction="row" alignItems={"center"} spacing={3}>
              <Input inputRef={nftTokenId} placeholder="nft itemId"></Input>
              <FormControl variant="standard" sx={{ mb: 4, minWidth: 150 }}>
                <InputLabel>nft Network</InputLabel>
                <Select onChange={changeNetworkEvent} inputRef={nftNetwork}>
                  <MenuItem value={"11155111"}>Sepolia</MenuItem>
                  <MenuItem value={"80001"}>Mumbai</MenuItem>
                  <MenuItem value={"97"}>BSC</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="standard" sx={{ mb: 2, minWidth: 150 }}>
                <InputLabel>loan Network</InputLabel>

                <Select inputRef={loanNetwork}>
                  <MenuItem value={"11155111"}>Sepolia</MenuItem>
                  <MenuItem value={"80001"}>Mumbai</MenuItem>
                  <MenuItem value={"97"}>BSC</MenuItem>
                </Select>
              </FormControl>

              <Input inputRef={loanAmount} placeholder="loan amount"></Input>
              <Input
                inputRef={loanPeriod}
                placeholder="loan period in s"
              ></Input>
              <Button onClick={getLoanHandler}>getLoan</Button>
            </Stack>
          </Stack>
        )}

      {loan != null && loan != "loading" && (
        <Stack alignItems={"center"} spacing={5} mt={10}>
          <Stack alignItems={"center"} spacing={3}>
            <Typography variant="h3">Loan Details:</Typography>
            <Typography>
              <b> amount : </b> {String(loan.amount)}
            </Typography>
            <Typography>
              <b> Collateral nft Network :</b> {nameFromId.get(loan.nftChainId)}
            </Typography>
            <Typography>
              <b> nftTokenId : </b> {loan.nftTokenId}
            </Typography>
            <Typography>
              <b> cutoff time : </b>
              {String(new Date(Number(loan.cutOffTimestamp) * 1000))}
            </Typography>
          </Stack>
          <Box>
            <Button
              variant={"contained"}
              sx={{
                backgroundColor: theme.palette.secondary.dark,
              }}
              onClick={returnHandler}
            >
              ReturnLoan
            </Button>
          </Box>
          <Stack alignItems={"center"}>
            <Typography>
              Please return the loan amount before cutoff time.
            </Typography>
            <Typography>
              After the cutoff time, the collateral nft will be put for sale on
              <Link to="/centralised/market"> Marketplace </Link>
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
