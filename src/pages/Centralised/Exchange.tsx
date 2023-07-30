import { useTheme } from "@mui/material/styles";
import abiCrypto from "../../contracts/centralised/exchange.json";
import getSignedContract, {
  exchangeAddressFromId,
} from "../../signedContracts/signedC2";
import { getBalance } from "../../signedContracts/signedC2";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Input,
  Typography,
  Stack,
  SelectChangeEvent,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { networkIdInHex } from "../../signedContracts/signedC";
import ContractBalancesCentralised from "../../components/ContractBalancesCentralised";

let provider: any;
let curMeta: any;

export default function Exchange() {
  const theme = useTheme();
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
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
    })();
  }, [acc]);

  const networkChangeHandler = async function (e: SelectChangeEvent) {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: networkIdInHex.get(e.target.value) }], // chainId must be in hexadecimal numbers
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    const chainIdString = String(chainId);
    setChainId(chainIdString);
  };

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

    const withdrawTx = await signedDestContract.withdrawEth(acc, value);
    const withdrawTxReceipt = await withdrawTx.wait();
    console.log("withdraw", withdrawTxReceipt);
  };
  return (
    <Stack alignItems="center" spacing={10} sx={{ mt: 5 }}>
      <ContractBalancesCentralised />
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"flex"}
        justifyContent={"space-between"}
      >
        <FormControl variant="standard" sx={{ minWidth: 80 }}>
          <InputLabel>From</InputLabel>
          <Select
            onChange={networkChangeHandler}
            inputRef={fromNetwork}
            id="demo-simple-select"
          >
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ minWidth: 80 }}>
          <InputLabel>To</InputLabel>
          <Select inputRef={toNetwork} id="demo-simple-select">
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
        <Input
          sx={{ mt: "10" }}
          inputRef={transferValue}
          placeholder="value"
        ></Input>
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={transferHandler}
        >
          Transfer
        </Button>
      </Stack>
    </Stack>
  );
}
