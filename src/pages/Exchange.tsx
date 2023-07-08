import abiCrypto from "../contracts/exchange.json";
import getSignedContract, {
  exchangeAddressFromId,
} from "../signedContracts/signedC";
import { getBalance } from "../signedContracts/signedC";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Input,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";

let provider: any;
let curMeta: any;

export default function Exchange() {
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);
  const [bscBalance, setBscBalance] = useState<string | null>(null);
  const fromNetwork = useRef<HTMLInputElement>(null);
  const transferValue = useRef<HTMLInputElement>(null);
  const toNetwork = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      setAcc((await provider.listAccounts())[0]);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      let cryptoAddress = exchangeAddressFromId.get(chainIdString);
      curMeta = new ethers.Contract(cryptoAddress!, abiCrypto.abi, signer);
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
      setBscBalance(await getBalance("97"));
    })();
  }, [acc]);

  const transferHandler = async function () {
    const destNetworkId = toNetwork.current?.value;
    const value = transferValue.current?.value;
    const tranferTx = await curMeta.acceptEth({
      value,
    });
    const transferReceipt = await tranferTx.wait();
    console.log("transfer", transferReceipt);
    const signedDestContract = getSignedContract(destNetworkId!);
    console.log(signedDestContract);

    const withdrawTx = await signedDestContract.withdrawEth(value);
    const withdrawTxReceipt = await withdrawTx.wait();
    console.log("withdraw", withdrawTxReceipt);
  };
  return (
    <>
      <Box>
        <Typography>Sepolia Balance : {sepoliaBalance}</Typography>
        <Typography>Mumbai Balance : {mumbaiBalance}</Typography>
        <Typography>Bsc Balance : {bscBalance}</Typography>
      </Box>
      <Box>
        <FormControl sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>From</InputLabel>
          <Select inputRef={fromNetwork} id="demo-simple-select">
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>To</InputLabel>
          <Select inputRef={toNetwork} id="demo-simple-select">
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <Input inputRef={transferValue}></Input>
        <Button onClick={transferHandler}>Transfer</Button>
      </Box>
    </>
  );
}
