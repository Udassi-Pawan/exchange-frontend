import { Box, Button, Grid, Input, Typography } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import abiCrypto from "../contracts/exchange.json";
import abiToken from "../contracts/stakeToken.json";
import { exchangeAddressFromId } from "../signedContracts/signedC";
var hdate = require("human-date");

let cryptoContract: any;
let tokenContract: any;
let provider: any;

const getStakes = async function (acc: string): Promise<any> {
  const stakesNumber = await cryptoContract.stakesNumber(acc);
  let unlocked = 0;
  const stakesArray = [];
  for (let i = 0; i < stakesNumber; i++) {
    const thisStake = await cryptoContract.stakes(acc, i);
    const timestamp = Number(thisStake[1]);
    const value = String(thisStake[0]);

    const relativeTime = timestamp - Math.floor(Date.now() / 1000);
    if (relativeTime <= 0) {
      unlocked += Number(value);
    } else {
      const prettyTime = hdate.prettyPrint(relativeTime, { showTime: true });
      stakesArray.push({ time: prettyTime, value });
    }
  }
  return [stakesArray, unlocked];
};

export default function Stake() {
  const [acc, setAcc] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [stakes, setStakes] = useState<
    [{ value: string; time: string }] | null
  >(null);
  const [unlocked, setUnlocked] = useState<Number | null>(null);
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
      setAcc((await provider.listAccounts())[0].address);
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
    const tx = await cryptoContract.withdrawStakedEth(
      redeemValue.current!.value
    );
    const receipt = await tx.wait();
    console.log(receipt);
    const [stakesArray, unlockedValue] = await getStakes(acc!);
    setStakes(stakesArray!);
    setUnlocked(unlockedValue);
  };

  return (
    <>
      <Box>
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
        <Typography>unlocked : {String(unlocked)}</Typography>
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
