import {
  Box,
  Button,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import abiCrypto from "../contracts/exchange.json";
import abiToken from "../contracts/stakeToken.json";
import getSignedContract, {
  exchangeAddressFromId,
  getAccountBalances,
  getStakes,
  networks,
} from "../signedContracts/signedC";
import Balance from "../components/Balance";

let cryptoContract: any;
let tokenContract: any;
let provider: any;

export default function Stake() {
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
    <>
      <Box>
        <Balance />
        <Typography>{acc}</Typography>
        <Typography>{chainId}</Typography>
        <Box>
          {stakes &&
            stakes.map((s) => (
              <Grid container key={s.time} spacing={2}>
                <Grid item>
                  <Typography>value: {s.value}</Typography>
                </Grid>
                <Grid item>
                  <Typography>time: {s.time}</Typography>
                </Grid>
              </Grid>
            ))}
        </Box>
      </Box>
      <Box>
        {unlocked && (
          <Box>
            <Typography>Unlocked Seploia tokens : {unlocked[0]}</Typography>
            <Typography>Unlocked Mumbai tokens : {unlocked[1]}</Typography>
          </Box>
        )}
      </Box>
      <Box>
        <Input placeholder="value" inputRef={stakeValue} />
        <Input sx={{ m: 2 }} placeholder="period" inputRef={periodValue} />
        <Button onClick={stakeHandler}>Stake</Button>
      </Box>
      <Box>
        <Input placeholder="value" inputRef={redeemValue} />
        <Button onClick={withdrawHandler}>Withdraw</Button>
      </Box>
    </>
  );
}
