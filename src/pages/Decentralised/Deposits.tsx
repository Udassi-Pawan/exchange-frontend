import { Box, Button, Input, Stack, Typography } from "@mui/material";
import { Contract, ethers } from "ethers";
import { useTheme } from "@mui/material/styles";
import { useContext, useEffect, useRef, useState } from "react";
import abiToken from "../../contracts/decentralised/stakeToken.json";
import {
  getBalance,
  getStakes,
} from "../../signedContracts/scriptsDecentralised";
import { MyContext } from "../../MyContext";
let tokenContract: Contract;
let provider: ethers.providers.Web3Provider;

export default function Deposits() {
  const theme = useTheme();
  const {
    exchangeContractDecentralised,
    acc,
    chainId,
    setLoading,
    setDialogueText,
  } = useContext(MyContext);
  const [stakes, setStakes] = useState<
    { value: string; time: string }[] | null | []
  >(null);
  const [unlocked, setUnlocked] = useState<number | null>(null);
  const stakeValue = useRef<HTMLInputElement>(null);
  const periodValue = useRef<HTMLInputElement>(null);
  const redeemValue = useRef<HTMLInputElement>(null);

  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      if (!exchangeContractDecentralised) return;
      const tokenAddress = await exchangeContractDecentralised.stakeTokenAddr();
      tokenContract = new ethers.Contract(tokenAddress!, abiToken.abi, signer);
      if (!acc || !chainId) return;
      const [stakesArray, unlockedValue] = await getStakes(acc!, chainId);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, [acc, exchangeContractDecentralised]);

  const stakeHandler = async () => {
    if (Number(periodValue.current!.value) < 31)
      return setDialogueText("Deposit Period should be longer than 31s.");
    setLoading(true);
    try {
      const tx = await exchangeContractDecentralised.stakeEth(
        periodValue.current!.value,
        {
          value: stakeValue.current!.value,
        }
      );
      const receipt = await tx.wait();
      console.log(receipt);
      const [stakesArray, unlockedValue] = await getStakes(acc!, chainId!);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    } catch (e) {
      setDialogueText("Deposit Transaction Failed.");
    }
    setLoading();
  };
  const withdrawHandler = async () => {
    if (Number(redeemValue.current!.value) > Number(unlocked))
      return setDialogueText("Not enough unlocked funds.");
    setLoading(true);
    try {
      const redeemAmount = Number(redeemValue.current!.value);
      const transferTx = await exchangeContractDecentralised.withdrawStakedEth(
        redeemAmount
      );
      const recTransferTx = await transferTx.wait();
      console.log(recTransferTx);
      const [stakesArray, unlockedValue] = await getStakes(acc!, chainId!);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    } catch (e) {
      setDialogueText("Withdraw transaction failed.");
    }
    setLoading();
  };

  return (
    <Stack alignItems={"center"} spacing={5}>
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
            {stakes == null && (
              <Typography fontSize={"1rem"}>Loading Deposits ...</Typography>
            )}
            {stakes?.length == 0 && (
              <Typography fontSize={"1rem"}>No deposits found.</Typography>
            )}
          </Stack>
        </Box>
      </Stack>
      <Box>
        {unlocked != null && (
          <Box>
            {chainId == "11155111" && (
              <Typography>Unlocked Sepolia tokens : {unlocked}</Typography>
            )}
            {chainId == "80001" && (
              <Typography>Unlocked Mumbai tokens : {unlocked}</Typography>
            )}
          </Box>
        )}
      </Box>
      <Stack alignItems={"center"}>
        <Typography variant={"h5"}>Interest Rates as per period :</Typography>
        <Typography> &gt; 1 min : 3%</Typography>
        <Typography> &gt; 2 min : 4%</Typography>
        <Typography> &gt; 3 min : 5%</Typography>
      </Stack>
      <Stack alignItems={"center"} direction={"row"} spacing={2}>
        <Input placeholder="value" inputRef={stakeValue} />
        <Input
          sx={{ m: 2 }}
          placeholder="period in seconds"
          inputRef={periodValue}
        />
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={stakeHandler}
        >
          Deposit
        </Button>
      </Stack>

      <Stack direction={"row"} spacing={2}>
        <Input placeholder="value" inputRef={redeemValue} />
        <Button
          variant={"contained"}
          sx={{
            backgroundColor: theme.palette.secondary.dark,
          }}
          onClick={withdrawHandler}
        >
          Withdraw
        </Button>
      </Stack>
    </Stack>
  );
}
