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
import { Contract, ethers } from "ethers";
import { useContext, useEffect, useRef, useState } from "react";
import abiToken from "../../contracts/centralised/stakeToken.json";
import {
  getSignedContract,
  getStakes,
  networks,
} from "../../signedContracts/scriptsCentralised";
import { useTheme } from "@mui/material/styles";
import ContractBalancesCentralised from "../../components/ContractBalancesCentralised";
import { MyContext } from "../../MyContext";

let tokenContract: Contract;
let provider: ethers.providers.Web3Provider;

export default function Deposits() {
  const [counter, setCounter] = useState<number>(0);
  const theme = useTheme();
  const {
    exchangeContractCentralised,
    acc,
    changeNetworkEvent,
    setLoading,
    setDialogueText,
  } = useContext(MyContext);

  const toNetwork = useRef<HTMLInputElement>(null);
  const [stakes, setStakes] = useState<
    { value: string; time: string }[] | null | []
  >(null);
  const [unlocked, setUnlocked] = useState<number[] | null>(null);
  const stakeValue = useRef<HTMLInputElement>(null);
  const periodValue = useRef<HTMLInputElement>(null);
  const redeemValue = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      if (!exchangeContractCentralised) return;
      const tokenAddress = await exchangeContractCentralised.stakeTokenAddr();
      tokenContract = new ethers.Contract(tokenAddress!, abiToken.abi, signer);
      if (!acc) return;
      const [stakesArray, unlockedValue] = await getStakes(acc!);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
    })();
  }, [acc, exchangeContractCentralised]);

  const stakeHandler = async () => {
    if (!stakeValue.current!.value)
      return setDialogueText("Please set a valid amount.");
    if (Number(periodValue.current!.value) <= 30)
      return setDialogueText("Deposit period should be more than 30s.");
    setLoading(true);

    try {
      const tx = await exchangeContractCentralised.stakeEth(
        periodValue.current!.value,
        {
          value: stakeValue.current!.value,
        }
      );
      const receipt = await tx.wait();
      console.log(receipt);
      setLoading(false);
      const [stakesArray, unlockedValue] = await getStakes(acc!);
      setStakes(stakesArray!);
      setUnlocked(null);
      setUnlocked(unlockedValue);
      setCounter((prev) => prev + 1);
    } catch (e) {
      return setDialogueText("Deposit Transaction failed.");
    }
    setLoading(false);
  };
  const withdrawHandler = async () => {
    setLoading(true);
    try {
      const redeemAmount = Number(redeemValue.current!.value);
      if (unlocked![0] + unlocked![1]! + unlocked![2] < redeemAmount) {
        setDialogueText("Not enough unlocked funds!");
        return setLoading();
      }
      let total = 0;
      for (let i = 0; i < 3; i++) {
        if (unlocked![i] == 0) continue;
        const exchangeContract = getSignedContract(networks[i]);
        if (total + unlocked![i] >= redeemAmount) {
          console.log("burning final");
          const burnTx = await exchangeContract.burnStakedEth(
            acc,
            redeemAmount - total
          );
          await burnTx.wait();
          total += redeemAmount - total;
          break;
        } else {
          console.log("burning", unlocked![i], networks[i]);
          const burnTx = await exchangeContract.burnStakedEth(
            acc,
            unlocked![i]
          );
          await burnTx.wait();
          total += unlocked![i];
        }
      }
      if (total == redeemAmount) {
        console.log("transfering eth");
        const exchangeContract = getSignedContract(toNetwork.current!.value);

        const transferTx = await exchangeContract.withdrawEth(acc, total);
        const recTransferTx = await transferTx.wait();
        console.log(recTransferTx);
      }
      setLoading();
      setStakes(null);
      setUnlocked(null);
      const [stakesArray, unlockedValue] = await getStakes(acc!);
      setCounter((prev) => prev + 1);
      setStakes(stakesArray!);
      setUnlocked(unlockedValue);
    } catch (e) {
      setDialogueText("Withdraw Transaction Failed.");
    }
    setLoading();
  };

  return (
    <Stack alignItems={"center"} spacing={5} mb={5}>
      <ContractBalancesCentralised counterState={counter} />
      <Box
        sx={{
          backgroundColor: theme.palette.secondary.dark,
          p: 1,
          m: 2,
          borderRadius: "1rem",
        }}
      >
        <Stack mt={2} mb={2} alignItems={"center"}>
          <Typography mb={1.6} fontSize={"1.7rem"}>
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
      <Box>
        {unlocked && (
          <Box>
            <Typography variant={"h6"}>
              Unlocked tokens : {unlocked[0] + unlocked[1] + unlocked[2]}
            </Typography>
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
        <FormControl variant="standard" sx={{ mb: 2, minWidth: 100 }}>
          <InputLabel>Network</InputLabel>
          <Select onChange={changeNetworkEvent}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
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
      <Stack direction="row" alignItems={"center"}>
        <Input placeholder="value" inputRef={redeemValue} />
        <FormControl variant="standard" sx={{ m: 1, minWidth: 80 }}>
          <InputLabel>To</InputLabel>
          <Select inputRef={toNetwork}>
            <MenuItem value={"11155111"}>Sepolia</MenuItem>
            <MenuItem value={"80001"}>Mumbai</MenuItem>
            <MenuItem value={"97"}>BSC</MenuItem>
          </Select>
        </FormControl>
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
