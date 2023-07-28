import abiExchange from "../contracts/exchange.json";
import { exchangeAddressFromId } from "../signedContracts/signedC";
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
  Stack,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";

let provider: any;
let curMeta: any;
let exchangeContract: any;

export default function Exchange() {
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);
  const fromNetwork = useRef<HTMLInputElement>(null);
  const transferValue = useRef<HTMLInputElement>(null);
  const toNetwork = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setChainId(chainIdString);
      let cryptoAddress = exchangeAddressFromId.get(chainIdString);
      setAcc((await provider.listAccounts())[0]);
      exchangeContract = new ethers.Contract(
        cryptoAddress!,
        abiExchange.abi,
        signer
      );
      curMeta = new ethers.Contract(cryptoAddress!, abiExchange.abi, signer);
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, [acc]);

  const transferHandler = async function () {
    const value = transferValue.current?.value;
    const tx = await exchangeContract.sendEthOver({ value });
    console.log(await tx.wait());
  };
  return (
    <Box>
      <Stack m={10} alignItems={"center"} spacing={20}>
        <Stack spacing={2}>
          <Typography sx={{ textDecoration: "underline" }}>
            Contract Sepolia Balance : {sepoliaBalance}
          </Typography>
          <Typography sx={{ textDecoration: "underline" }}>
            {" "}
            Contract Mumbai Balance : {mumbaiBalance}
          </Typography>
        </Stack>
        <Stack direction={"row"} alignItems={"center"}>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
            <InputLabel>To</InputLabel>
            <Select inputRef={toNetwork}>
              {chainId != "11155111" && (
                <MenuItem value={"11155111"}>Sepolia</MenuItem>
              )}
              {chainId != "80001" && (
                <MenuItem value={"80001"}>Mumbai</MenuItem>
              )}
            </Select>
          </FormControl>

          <Input
            placeholder="Value"
            type="number"
            inputRef={transferValue}
          ></Input>
          <Button onClick={transferHandler}>Transfer</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
