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
} from "../../signedContracts/scriptsCentralised";
import { useTheme } from "@mui/material/styles";

import abiExchange from "../../contracts/centralised/exchange.json";
import { useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { exchangeAddressFromIdCentralised } from "../../signedContracts/scriptsCentralised";
import NftCardCentralised from "../../components/NftCardCentralised";
import ContractBalancesCentralised from "../../components/ContractBalancesCentralised";
import { MyContext } from "../../MyContext";

export default function Loan() {
  const theme = useTheme();
  const {
    acc,
    nftContractCentralised,
    exchangeContractCentralised,
    changeNetworkEvent,
  } = useContext(MyContext);
  const nftTokenId = useRef<HTMLInputElement>(null);
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
  >(null);
  useEffect(() => {
    (async function () {
      if (acc) {
        setLoan(await getLoan(acc));
        setMyNfts(await getNfts(acc!));
      }
    })();
  }, [acc]);

  const getLoanHandler = async function () {
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
  };

  const returnHandler = async function () {
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
    const nftContractCentralised = await getSignedNftContract(loan.nftChainId);
    const _nftTokenId = loan.nftTokenId;
    const _borrower = loan.borrower;
    const returnTx = await exchangeContract.returnLoan({ value: loan.amount });
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
  };

  return (
    <Stack alignItems={"center"}>
      <Box>
        {loan == null && (
          <Stack alignItems={"center"} spacing={6}>
            <ContractBalancesCentralised />
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
              <Input inputRef={nftTokenId} placeholder="nft token Id"></Input>
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
              <Input inputRef={loanPeriod} placeholder="loan period"></Input>
              <Button onClick={getLoanHandler}>getLoan</Button>
            </Stack>
          </Stack>
        )}
      </Box>
      <Box>
        {loan != null && loan != "loading" && (
          <Stack alignItems={"center"} spacing={10} mt={10}>
            <Stack alignItems={"center"} spacing={3}>
              <Typography>
                <b> amount : </b> {String(loan.amount)}
              </Typography>
              <Typography>
                <b> Collateral nft Network :</b> {loan.nftChainId}
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
          </Stack>
        )}
      </Box>
      {loan == "loading" && <Typography>Getting Loan</Typography>}
    </Stack>
  );
}
