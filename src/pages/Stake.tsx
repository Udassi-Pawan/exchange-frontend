import {
  Box,
  Button,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import abiCrypto from "../contracts/exchange.json";
import abiToken from "../contracts/stakeToken.json";
import getSignedContract, {
  exchangeAddressFromId,
  getAccountBalances,
  getBalance,
  getStakes,
  networks,
} from "../signedContracts/signedC";

let cryptoContract: any;
let tokenContract: any;
let provider: any;

export default function Stake() {
  const theme = useTheme();
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [accBalances, setAccBalances] = useState<any>(null);
  const fromNetwork = useRef<HTMLInputElement>(null);
  const toNetwork = useRef<HTMLInputElement>(null);
  const [stakes, setStakes] = useState<
    [{ value: string; time: string }] | null
  >(null);
  const [unlocked, setUnlocked] = useState<any>(null);
  const stakeValue = useRef<HTMLInputElement>(null);
  const periodValue = useRef<HTMLInputElement>(null);
  const redeemValue = useRef<HTMLInputElement>(null);

  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);

  window.ethereum.on("accountsChanged", async function () {
    setAcc((await provider.listAccounts())[0].address);
  });
  window.ethereum.on("chainChanged", async function () {
    window.location.reload();
  });

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
      cryptoContract = new ethers.Contract(
        cryptoAddress!,
        abiCrypto.abi,
        signer
      );
      const tokenAddress = await cryptoContract.stakeTokenAddr();
      tokenContract = new ethers.Contract(tokenAddress!, abiToken.abi, signer);
      if (!acc) return;
      const [stakesArray, unlockedValue] = await getStakes(acc!);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
      setAccBalances(await getAccountBalances(acc));

      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, [acc]);

  const stakeHandler = async () => {
    const tx = await cryptoContract.stakeEth(periodValue.current!.value, {
      value: stakeValue.current!.value,
    });
    const receipt = await tx.wait();
    console.log(receipt);
    const [stakesArray, unlockedValue] = await getStakes(acc!);
    setStakes(stakesArray!);
    setUnlocked(unlockedValue);
  };
  const withdrawHandler = async () => {
    const redeemAmount = Number(redeemValue.current!.value);
    const transferTx = await cryptoContract.withdrawStakedEth(redeemAmount);
    const recTransferTx = await transferTx.wait();
    console.log(recTransferTx);
    const [stakesArray, unlockedValue] = await getStakes(acc!);
    setStakes(stakesArray!);
    setUnlocked(unlockedValue);
  };

  return (
    <Stack alignItems={"center"} spacing={2}>
      <Stack alignItems={"center"}>
        <Box>
          {chainId == "11155111" && (
            <Typography sx={{ textDecoration: "underline" }}>
              Contract Sepolia Balance : {sepoliaBalance}
            </Typography>
          )}
          {chainId == "80001" && (
            <Typography sx={{ textDecoration: "underline" }}>
              Contract Mumbai Balance : {mumbaiBalance}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.secondary.main,
            p: 1,
            m: 2,
            borderRadius: "1rem",
          }}
        >
          <Stack mt={2} mb={2} alignItems={"center"}>
            <Typography mb={1.6} fontSize={"1.4rem"}>
              Locked Deposits:
            </Typography>
            {stakes &&
              stakes.map((s) => (
                <Stack direction={"row"} key={s.time} spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <Typography fontWeight={"600"}> value: </Typography>
                    <Typography>{s.value}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography fontWeight={"600"}> unlock time:</Typography>
                    <Typography>{s.time}</Typography>
                  </Stack>
                </Stack>
              ))}
          </Stack>
        </Box>
      </Stack>
      <Box>
        {unlocked && (
          <Box>
            {chainId == "11155111" && (
              <Stack direction="row" spacing={1}>
                <Typography fontWeight={"600"}> Unlocked Amount : </Typography>
                <Typography>{unlocked[0]}</Typography>
              </Stack>
            )}
            {chainId == "80001" && (
              <Typography>Unlocked Mumbai tokens : {unlocked[1]}</Typography>
            )}
          </Box>
        )}
      </Box>
      <Box>
        <Input placeholder="value" inputRef={stakeValue} />
        <Input
          sx={{ m: 2 }}
          placeholder="period in seconds"
          inputRef={periodValue}
        />
        <Button onClick={stakeHandler}>Stake</Button>
      </Box>
      <Box>
        <Input placeholder="value" inputRef={redeemValue} />
        <Button onClick={withdrawHandler}>Withdraw</Button>
      </Box>
    </Stack>
  );
}
